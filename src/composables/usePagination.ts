/**
 * Pure pagination logic for page, pageSize, offset calculation, and navigation.
 *
 * @param options - Configuration options
 * @param options.initialPage - Starting page number (default: 1)
 * @param options.initialPageSize - Items per page (default: 10)
 * @param options.total - Total item count (can be reactive)
 * @returns Pagination state and navigation methods
 *
 * @example
 * ```ts
 * const total = ref(100)
 * const {
 *   page,
 *   pageSize,
 *   offset,
 *   totalPages,
 *   hasNext,
 *   hasPrev,
 *   next,
 *   prev,
 *   goTo
 * } = usePagination({ total })
 *
 * // Navigate
 * next() // page 2
 * prev() // page 1
 * goTo(5) // page 5
 *
 * // Use offset for API calls
 * const { data } = useFetch(() => `/api/items?offset=${offset.value}&limit=${pageSize.value}`)
 * ```
 */
import { ref, computed, unref, type Ref, type ComputedRef, type MaybeRef } from 'vue';

export interface UsePaginationOptions {
	/** Starting page number (default: 1) */
	initialPage?: number;
	/** Items per page (default: 10) */
	initialPageSize?: number;
	/** Total item count (reactive or static) */
	total: MaybeRef<number>;
}

export interface UsePaginationReturn {
	/** Current page number (1-indexed) */
	page: Ref<number>;
	/** Items per page */
	pageSize: Ref<number>;
	/** Zero-based offset for API calls */
	offset: ComputedRef<number>;
	/** Total number of pages */
	totalPages: ComputedRef<number>;
	/** Whether there is a next page */
	hasNext: ComputedRef<boolean>;
	/** Whether there is a previous page */
	hasPrev: ComputedRef<boolean>;
	/** Go to next page */
	next: () => void;
	/** Go to previous page */
	prev: () => void;
	/** Go to specific page */
	goTo: (targetPage: number) => void;
}

export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
	const { initialPage = 1, initialPageSize = 10, total } = options;

	const page = ref(Math.max(1, initialPage));
	const pageSize = ref(Math.max(1, initialPageSize));

	const totalPages = computed(() => {
		const totalValue = unref(total);
		if (totalValue <= 0) return 1;
		return Math.ceil(totalValue / pageSize.value);
	});

	const offset = computed(() => (page.value - 1) * pageSize.value);

	const hasNext = computed(() => page.value < totalPages.value);
	const hasPrev = computed(() => page.value > 1);

	const next = (): void => {
		if (hasNext.value) {
			page.value++;
		}
	};

	const prev = (): void => {
		if (hasPrev.value) {
			page.value--;
		}
	};

	const goTo = (targetPage: number): void => {
		const clamped = Math.min(Math.max(1, targetPage), totalPages.value);
		page.value = clamped;
	};

	return {
		page,
		pageSize,
		offset,
		totalPages,
		hasNext,
		hasPrev,
		next,
		prev,
		goTo,
	};
}
