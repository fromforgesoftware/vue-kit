/**
 * Sort field and direction toggling for table/list views.
 *
 * @param options - Configuration options
 * @param options.initialField - Initial sort field
 * @param options.initialDirection - Initial sort direction (default: 'asc')
 * @returns Sort state and toggle/reset methods
 *
 * @example
 * ```ts
 * const { sortField, sortDirection, toggle, reset } = useSort<'name' | 'date' | 'status'>({
 *   initialField: 'name',
 *   initialDirection: 'asc'
 * })
 *
 * // Toggle sort on column click
 * // - First click: set field, direction = asc
 * // - Second click on same field: toggle to desc
 * // - Third click: toggle back to asc
 * toggle('name')
 *
 * // Use in API calls
 * const { data } = useFetch(() =>
 *   `/api/items?sort=${sortField.value}&order=${sortDirection.value}`
 * )
 * ```
 */
import { ref, type Ref } from 'vue';

export type SortDirection = 'asc' | 'desc';

export interface UseSortOptions<T extends string = string> {
	/** Initial sort field (optional) */
	initialField?: T;
	/** Initial sort direction (default: 'asc') */
	initialDirection?: SortDirection;
}

export interface UseSortReturn<T extends string = string> {
	/** Current sort field (null if not sorting) */
	sortField: Ref<T | null>;
	/** Current sort direction */
	sortDirection: Ref<SortDirection>;
	/** Toggle sort for a field */
	toggle: (field: T) => void;
	/** Reset to initial state */
	reset: () => void;
}

export function useSort<T extends string = string>(
	options: UseSortOptions<T> = {},
): UseSortReturn<T> {
	const { initialField = null, initialDirection = 'asc' } = options;

	const sortField = ref<T | null>(initialField as T | null) as Ref<T | null>;
	const sortDirection = ref<SortDirection>(initialDirection);

	const toggle = (field: T): void => {
		if (sortField.value === field) {
			// Same field: toggle direction
			sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
		} else {
			// Different field: set new field with ascending order
			sortField.value = field;
			sortDirection.value = 'asc';
		}
	};

	const reset = (): void => {
		sortField.value = initialField as T | null;
		sortDirection.value = initialDirection;
	};

	return {
		sortField,
		sortDirection,
		toggle,
		reset,
	};
}
