/**
 * Two-way sync between component state and Vue Router query params.
 *
 * @param options - Configuration options
 * @param options.key - The query parameter key
 * @param options.defaultValue - Default value when param is not present
 * @param options.transform - Optional encode/decode functions for non-string values
 * @returns Reactive value synced with URL query param
 *
 * @example
 * ```ts
 * // Simple string param
 * const { value: search } = useRouteQuery({
 *   key: 'q',
 *   defaultValue: ''
 * })
 *
 * // Number param with transform
 * const { value: page } = useRouteQuery({
 *   key: 'page',
 *   defaultValue: 1,
 *   transform: {
 *     encode: (v) => String(v),
 *     decode: (v) => parseInt(v, 10) || 1
 *   }
 * })
 *
 * // The URL will update when value changes
 * page.value = 2 // URL: ?page=2
 * ```
 */
import { ref, watch, onUnmounted, type Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export interface UseRouteQueryTransform<T> {
	/** Convert value to string for URL */
	encode: (value: T) => string;
	/** Convert string from URL to value */
	decode: (value: string) => T;
}

export interface UseRouteQueryOptions<T> {
	/** The query parameter key */
	key: string;
	/** Default value when param is not present */
	defaultValue: T;
	/** Encode/decode functions for non-string values */
	transform?: UseRouteQueryTransform<T>;
}

export interface UseRouteQueryReturn<T> {
	/** Reactive value synced with URL query param */
	value: Ref<T>;
}

// Default transform for strings
const stringTransform: UseRouteQueryTransform<string> = {
	encode: (v) => v,
	decode: (v) => v,
};

export function useRouteQuery<T>(options: UseRouteQueryOptions<T>): UseRouteQueryReturn<T> {
	const {
		key,
		defaultValue,
		transform = stringTransform as unknown as UseRouteQueryTransform<T>,
	} = options;

	const router = useRouter();
	const route = useRoute();

	// Initialize from current route
	const getValueFromRoute = (): T => {
		const queryValue = route.query[key];
		if (queryValue === undefined || queryValue === null) {
			return defaultValue;
		}

		// Handle array values (take first)
		const stringValue = Array.isArray(queryValue) ? (queryValue[0] ?? '') : queryValue;
		return transform.decode(stringValue);
	};

	const value = ref<T>(getValueFromRoute()) as Ref<T>;

	// Watch for route changes
	const stopRouteWatch = watch(
		() => route.query[key],
		() => {
			value.value = getValueFromRoute();
		},
	);

	// Watch for value changes and update route
	const stopValueWatch = watch(
		value,
		(newValue) => {
			const encoded = transform.encode(newValue);
			const currentValue = route.query[key];

			// Don't update if value hasn't changed
			if (encoded === currentValue) return;

			// Remove param if it's the default value
			const isDefault = JSON.stringify(newValue) === JSON.stringify(defaultValue) || encoded === '';

			const newQuery = { ...route.query };

			if (isDefault) {
				delete newQuery[key];
			} else {
				newQuery[key] = encoded;
			}

			// Use replace to avoid adding history entries
			router.replace({ query: newQuery }).catch(() => {
				// Ignore navigation errors (e.g., duplicate navigation)
			});
		},
		{ immediate: false },
	);

	onUnmounted(() => {
		stopRouteWatch();
		stopValueWatch();
	});

	return {
		value,
	};
}

// Common transform helpers
export const numberTransform: UseRouteQueryTransform<number> = {
	encode: (v) => String(v),
	decode: (v) => {
		const num = Number(v);
		return isNaN(num) ? 0 : num;
	},
};

export const booleanTransform: UseRouteQueryTransform<boolean> = {
	encode: (v) => (v ? 'true' : 'false'),
	decode: (v) => v === 'true',
};

export const arrayTransform: UseRouteQueryTransform<string[]> = {
	encode: (v) => v.join(','),
	decode: (v) => (v ? v.split(',').filter(Boolean) : []),
};
