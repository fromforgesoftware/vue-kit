/**
 * Generic fetch wrapper for simple external API calls (no auth needed).
 * For authenticated internal API calls, use useAxios instead.
 *
 * @param options - Configuration options
 * @param options.url - URL to fetch (can be reactive or getter)
 * @param options.immediate - Whether to fetch immediately (default: true)
 * @param options.transform - Transform response data
 * @param options.onError - Error callback
 * @returns Data, loading, error state and control methods
 *
 * @example
 * ```ts
 * // Simple fetch
 * const { data, loading, error, refresh } = useFetch<User[]>({
 *   url: '/api/public/users'
 * })
 *
 * // Reactive URL
 * const userId = ref('123')
 * const { data } = useFetch<User>({
 *   url: () => `/api/public/users/${userId.value}`
 * })
 *
 * // With transform
 * const { data } = useFetch<string[]>({
 *   url: '/api/tags',
 *   transform: (raw) => (raw as { tags: string[] }).tags
 * })
 * ```
 */
import {
	ref,
	readonly,
	watch,
	onUnmounted,
	unref,
	type Ref,
	type DeepReadonly,
	type MaybeRef,
} from 'vue';

export interface UseFetchOptions<T> {
	/** URL to fetch (string, ref, or getter function) */
	url: MaybeRef<string> | (() => string);
	/** Whether to fetch immediately (default: true) */
	immediate?: boolean;
	/** Transform response data */
	transform?: (data: unknown) => T;
	/** Error callback */
	onError?: (error: Error) => void;
}

export interface UseFetchReturn<T> {
	/** Response data */
	data: DeepReadonly<Ref<T | null>>;
	/** Error if fetch failed */
	error: DeepReadonly<Ref<Error | null>>;
	/** Whether currently loading */
	loading: DeepReadonly<Ref<boolean>>;
	/** Re-fetch the URL */
	refresh: () => Promise<void>;
	/** Abort the current request */
	abort: () => void;
}

function getUrl(url: MaybeRef<string> | (() => string)): string {
	if (typeof url === 'function') {
		return url();
	}
	return unref(url);
}

export function useFetch<T = unknown>(options: UseFetchOptions<T>): UseFetchReturn<T> {
	const { url, immediate = true, transform, onError } = options;

	const data = ref<T | null>(null) as Ref<T | null>;
	const error = ref<Error | null>(null);
	const loading = ref(false);

	let abortController: AbortController | null = null;

	const abort = (): void => {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	};

	const refresh = async (): Promise<void> => {
		// Abort any pending request
		abort();

		const currentUrl = getUrl(url);
		if (!currentUrl) {
			return;
		}

		loading.value = true;
		error.value = null;

		abortController = new AbortController();

		try {
			const response = await fetch(currentUrl, {
				signal: abortController.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const json = await response.json();
			data.value = transform ? transform(json) : (json as T);
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				// Request was aborted, don't update state
				return;
			}

			const fetchError = err instanceof Error ? err : new Error(String(err));
			error.value = fetchError;
			data.value = null;
			onError?.(fetchError);
		} finally {
			loading.value = false;
			abortController = null;
		}
	};

	// Watch for URL changes
	const stopWatch = watch(
		() => getUrl(url),
		() => {
			refresh();
		},
		{ immediate: immediate },
	);

	onUnmounted(() => {
		stopWatch();
		abort();
	});

	return {
		data: readonly(data),
		error: readonly(error),
		loading: readonly(loading),
		refresh,
		abort,
	};
}
