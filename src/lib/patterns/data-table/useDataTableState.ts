import { ref, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import type { PaginationState, SortingState, VisibilityState } from '@tanstack/vue-table';

export interface UseDataTableStateOptions {
	/** Stable identifier for this table; becomes part of the storage key. */
	key: string;
	defaultPageSize?: number;
	defaultSorting?: SortingState;
	defaultVisibility?: VisibilityState;
}

/**
 * Persists DataTable v-model state (page size, sorting, column visibility) to
 * localStorage. Pagination index is intentionally NOT persisted — only the page
 * size — so revisiting a list lands on page 1 with the user's preferred size.
 *
 * Usage:
 *   const { pagination, sorting, columnVisibility } = useDataTableState({ key: 'employees' })
 *   <DataTable
 *     :pagination="pagination"
 *     :sorting="sorting"
 *     :column-visibility="columnVisibility"
 *     @update:pagination="pagination = $event"
 *     @update:sorting="sorting = $event"
 *     @update:column-visibility="columnVisibility = $event"
 *   />
 */
export function useDataTableState(opts: UseDataTableStateOptions) {
	const base = `trading-bot:datatable:${opts.key}`;

	const pageSize = useStorage<number>(`${base}:pageSize`, opts.defaultPageSize ?? 25);
	const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: pageSize.value });
	watch(
		() => pagination.value.pageSize,
		(v) => {
			pageSize.value = v;
		},
	);

	const sorting = useStorage<SortingState>(`${base}:sorting`, opts.defaultSorting ?? []);
	const columnVisibility = useStorage<VisibilityState>(
		`${base}:visibility`,
		opts.defaultVisibility ?? {},
	);

	return { pagination, sorting, columnVisibility };
}
