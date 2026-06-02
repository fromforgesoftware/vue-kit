/**
 * Generic key-value filter state with URL serialization support.
 *
 * @param options - Configuration options
 * @param options.initialFilters - Initial filter values
 * @returns Filter state and manipulation methods
 *
 * @example
 * ```ts
 * const {
 *   filters,
 *   activeCount,
 *   setFilter,
 *   resetFilters,
 *   toQueryParams,
 *   fromQueryParams
 * } = useFilters({
 *   initialFilters: {
 *     status: '',
 *     department: '',
 *     search: ''
 *   }
 * })
 *
 * // Set individual filter
 * setFilter('status', 'active')
 *
 * // Check how many filters are active
 * console.log(activeCount.value) // 1
 *
 * // Sync with URL
 * const queryParams = toQueryParams()
 * // { status: 'active' }
 *
 * // Restore from URL
 * fromQueryParams({ status: 'inactive', department: 'sales' })
 * ```
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue';

export interface UseFiltersOptions<T extends Record<string, unknown>> {
	/** Initial filter values */
	initialFilters: T;
}

export interface UseFiltersReturn<T extends Record<string, unknown>> {
	/** Reactive filter state */
	filters: Ref<T>;
	/** Count of non-empty/active filters */
	activeCount: ComputedRef<number>;
	/** Set a single filter value */
	setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
	/** Reset all filters to initial values */
	resetFilters: () => void;
	/** Convert filters to URL query params (excludes empty values) */
	toQueryParams: () => Record<string, string>;
	/** Restore filters from URL query params */
	fromQueryParams: (params: Record<string, string>) => void;
}

function isEmptyValue(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string' && value.trim() === '') return true;
	if (Array.isArray(value) && value.length === 0) return true;
	if (typeof value === 'boolean' && value === false) return true;
	return false;
}

export function useFilters<T extends Record<string, unknown>>(
	options: UseFiltersOptions<T>,
): UseFiltersReturn<T> {
	const { initialFilters } = options;

	// Deep clone initial filters to prevent mutation
	const filters = ref<T>({ ...initialFilters }) as Ref<T>;

	const activeCount = computed(() => {
		return Object.values(filters.value).filter((v) => !isEmptyValue(v)).length;
	});

	const setFilter = <K extends keyof T>(key: K, value: T[K]): void => {
		filters.value[key] = value;
	};

	const resetFilters = (): void => {
		filters.value = { ...initialFilters };
	};

	const toQueryParams = (): Record<string, string> => {
		const params: Record<string, string> = {};

		for (const [key, value] of Object.entries(filters.value)) {
			if (!isEmptyValue(value)) {
				if (Array.isArray(value)) {
					params[key] = value.join(',');
				} else if (typeof value === 'object') {
					params[key] = JSON.stringify(value);
				} else {
					params[key] = String(value);
				}
			}
		}

		return params;
	};

	const fromQueryParams = (params: Record<string, string>): void => {
		const newFilters = { ...initialFilters };

		for (const key of Object.keys(initialFilters)) {
			if (key in params) {
				const paramValue = params[key];
				const initialValue = initialFilters[key];

				// Try to restore the correct type based on initialFilters
				if (Array.isArray(initialValue)) {
					(newFilters as Record<string, unknown>)[key] = paramValue.split(',').filter(Boolean);
				} else if (typeof initialValue === 'number') {
					const num = Number(paramValue);
					(newFilters as Record<string, unknown>)[key] = isNaN(num) ? initialValue : num;
				} else if (typeof initialValue === 'boolean') {
					(newFilters as Record<string, unknown>)[key] = paramValue === 'true';
				} else if (typeof initialValue === 'object' && initialValue !== null) {
					try {
						(newFilters as Record<string, unknown>)[key] = JSON.parse(paramValue);
					} catch {
						(newFilters as Record<string, unknown>)[key] = initialValue;
					}
				} else {
					(newFilters as Record<string, unknown>)[key] = paramValue;
				}
			}
		}

		filters.value = newFilters;
	};

	return {
		filters,
		activeCount,
		setFilter,
		resetFilters,
		toQueryParams,
		fromQueryParams,
	};
}
