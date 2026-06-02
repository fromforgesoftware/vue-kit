/**
 * Axios wrapper for authenticated internal API calls with ForgeError mapping.
 * For simple external API calls without auth, use useFetch instead.
 *
 * @param options - Configuration options
 * @param options.url - URL to fetch (can be reactive or getter)
 * @param options.method - HTTP method (default: 'GET')
 * @param options.data - Request body data (for POST/PUT/PATCH)
 * @param options.config - Additional Axios config
 * @param options.immediate - Whether to fetch immediately (default: true for GET)
 * @param options.transform - Transform response data
 * @param options.client - Custom Axios instance (optional)
 * @returns Data, loading, error state and control methods
 *
 * @example
 * ```ts
 * // Simple GET request
 * const { data, loading, error, execute } = useAxios<User[]>({
 *   url: '/api/users'
 * })
 *
 * // POST with data
 * const { execute } = useAxios<User>({
 *   url: '/api/users',
 *   method: 'POST',
 *   immediate: false
 * })
 * await execute({ data: { name: 'John' } })
 *
 * // With custom Axios client
 * const client = createAxiosClient({ baseURL: 'https://api.example.com' })
 * const { data } = useAxios({ url: '/users', client })
 * ```
 */
import {
	ref,
	readonly,
	watch,
	shallowRef,
	onUnmounted,
	unref,
	type Ref,
	type DeepReadonly,
	type MaybeRef,
} from 'vue';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { mapAxiosError } from '@fromforgesoftware/ts-kit/errors';
import type { ForgeError } from '@fromforgesoftware/ts-kit/errors';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface UseAxiosOptions<T> {
	/** URL to fetch (string, ref, or getter function) */
	url: MaybeRef<string> | (() => string);
	/** HTTP method (default: 'GET') */
	method?: HttpMethod;
	/** Request body data (for POST/PUT/PATCH) */
	data?: MaybeRef<unknown>;
	/** Additional Axios config */
	config?: AxiosRequestConfig;
	/** Whether to fetch immediately (default: true for GET, false for others) */
	immediate?: boolean;
	/** Transform response data */
	transform?: (data: unknown) => T;
	/** Custom Axios instance */
	client?: AxiosInstance;
}

export interface UseAxiosReturn<T> {
	/** Response data */
	data: DeepReadonly<Ref<T | null>>;
	/** Error as ForgeError for consistent error handling */
	error: DeepReadonly<Ref<ForgeError | null>>;
	/** Whether currently loading */
	loading: DeepReadonly<Ref<boolean>>;
	/** Full Axios response (shallow ref for performance) */
	response: DeepReadonly<Ref<AxiosResponse<T> | null>>;
	/** Execute the request (with optional override config) */
	execute: (overrideConfig?: AxiosRequestConfig) => Promise<T>;
	/** Abort the current request */
	abort: () => void;
}

function getUrl(url: MaybeRef<string> | (() => string)): string {
	if (typeof url === 'function') {
		return url();
	}
	return unref(url);
}

export function useAxios<T = unknown>(options: UseAxiosOptions<T>): UseAxiosReturn<T> {
	const {
		url,
		method = 'GET',
		data: requestData,
		config: baseConfig = {},
		immediate,
		transform,
		client,
	} = options;

	// Default immediate based on method
	const shouldFetchImmediately = immediate ?? method === 'GET';

	const data = ref<T | null>(null) as Ref<T | null>;
	const error = ref<ForgeError | null>(null);
	const loading = ref(false);
	const response = shallowRef<AxiosResponse<T> | null>(null);

	let abortController: AbortController | null = null;

	const abort = (): void => {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	};

	const execute = async (overrideConfig: AxiosRequestConfig = {}): Promise<T> => {
		// Abort any pending request
		abort();

		const currentUrl = getUrl(url);
		if (!currentUrl) {
			throw new Error('URL is required');
		}

		loading.value = true;
		error.value = null;

		abortController = new AbortController();

		const axiosClient = client ?? (await getDefaultClient());

		try {
			const finalConfig: AxiosRequestConfig = {
				...baseConfig,
				...overrideConfig,
				url: currentUrl,
				method,
				signal: abortController.signal,
			};

			// Add request data for methods that support body
			if (['POST', 'PUT', 'PATCH'].includes(method)) {
				finalConfig.data = overrideConfig.data ?? unref(requestData);
			}

			const axiosResponse = await axiosClient.request<T>(finalConfig);
			response.value = axiosResponse;

			const responseData = transform ? transform(axiosResponse.data) : axiosResponse.data;
			data.value = responseData;

			return responseData;
		} catch (err) {
			// Check if request was aborted
			if (err instanceof Error && err.name === 'CanceledError') {
				// Request was aborted, don't update state
				throw err;
			}

			const forgeError = mapAxiosError(err);
			error.value = forgeError;
			data.value = null;
			throw forgeError;
		} finally {
			loading.value = false;
			abortController = null;
		}
	};

	// Watch for URL changes on GET requests
	let stopWatch: (() => void) | null = null;

	if (method === 'GET') {
		stopWatch = watch(
			() => getUrl(url),
			() => {
				execute().catch(() => {
					// Error already captured in state
				});
			},
			{ immediate: shouldFetchImmediately },
		);
	} else if (shouldFetchImmediately) {
		// For non-GET methods, execute once if immediate
		execute().catch(() => {
			// Error already captured in state
		});
	}

	onUnmounted(() => {
		stopWatch?.();
		abort();
	});

	return {
		data: readonly(data),
		error: readonly(error),
		loading: readonly(loading),
		response: readonly(response),
		execute,
		abort,
	};
}

// Lazy-load default axios to avoid circular deps
let defaultClient: AxiosInstance | null = null;

async function getDefaultClient(): Promise<AxiosInstance> {
	if (!defaultClient) {
		const axios = await import('axios');
		defaultClient = axios.default;
	}
	return defaultClient;
}

/**
 * Set the default Axios client for all useAxios calls.
 * Call this once in your app setup with your configured client.
 */
export function setDefaultAxiosClient(client: AxiosInstance): void {
	defaultClient = client;
}
