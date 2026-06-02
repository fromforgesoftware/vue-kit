import { cva, type VariantProps } from 'class-variance-authority';
import type { RowData } from '@tanstack/vue-table';

// Re-export TanStack types for consumer convenience
export {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	type VisibilityState,
	type CellContext,
	type HeaderContext,
	FlexRender,
	getCoreRowModel,
} from '@tanstack/vue-table';

// Module-augment TanStack's `ColumnMeta` so consumers can declare a column
// as a "priority" column without us forking ColumnDef. Priority columns are
// always visible (including at < sm); non-priority columns get
// `hidden sm:table-cell` so they collapse out of view on mobile and the user
// can horizontally scroll the rest. The first priority column also becomes
// sticky on mobile so the row label stays anchored while scrolling.
//
// Usage:
//   const columns: ColumnDef<Employee>[] = [
//     { id: 'name', header: 'Name', meta: { priority: true } },
//     { id: 'group', header: 'Group' },
//   ]
declare module '@tanstack/vue-table' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		/** Always visible at every viewport. Non-priority columns hide below `sm`. */
		priority?: boolean;
	}
}

/**
 * Visual variant for {@link DataTable} container.
 *
 * - `default` / `primary` — standard table with rounded sidebar headers.
 * - `outline` — bordered table contained inside a card surface.
 * - `card` — card-row layout instead of a `<table>`. Uses the `#row` slot
 *   at every breakpoint. Pick this when the row's content has more than
 *   one line of text (notes, descriptions) and column alignment isn't
 *   useful — common for per-entity detail views.
 */
export type DataTableVariant = 'default' | 'primary' | 'outline' | 'card';

/** Paginated data source — `data` is the current page, `totalCount` powers the pagination footer. */
export interface DataTableDataSource<T> {
	data: T[];
	totalCount: number;
}

/**
 * Selection mode used for cross-page bulk actions.
 *
 * - `page` — the consumer should target the IDs currently in `rowSelection`.
 * - `all-matching` — the user has opted into "every row matching the current
 *   filter context"; the consumer's `fetchAllMatchingIds` callback resolves
 *   the actual id list when the bulk action runs.
 */
export type SelectionMode = 'page' | 'all-matching';

/** Slot scope passed to the `selection-actions` slot in {@link DataTable}. */
export interface DataTableSelectionActionsScope<T> {
	/** Number of currently selected rows on the current page. */
	selectedCount: number;
	/** The selected row payloads for the current page. */
	selectedRows: T[];
	/** Active selection mode. */
	selectionMode: SelectionMode;
	/** Effective target count: `selectedCount` in `page` mode, `totalCount` in `all-matching`. */
	effectiveCount: number;
}

/**
 * Layout for {@link DataTable}.
 *
 * - `default` — natural height; the whole table flows in document order. The
 *   surrounding page is responsible for any scrolling.
 * - `fill` — the table claims its parent's full height and pins the toolbar
 *   and pagination row, leaving only the rows region scrollable. Use this
 *   inside a height-constrained parent (e.g. a dialog body) where the
 *   filters/pagination must stay visible while the user scrolls a long list.
 */
export type DataTableLayout = 'default' | 'fill';

/** Wrapper variants for {@link DataTable}. */
export const dataDataTableVariant = cva('space-y-4', {
	variants: {
		variant: {
			default: '',
			primary: '',
			outline: '',
			card: '',
		},
		layout: {
			default: '',
			// `flex-1` (not `h-full`) so the table claims its parent's free space in
			// both flex-row and flex-col containers without depending on a resolved
			// parent height. `!space-y-0` overrides the default vertical spacing so
			// pinned regions sit flush; `gap-4` reintroduces it via the flex layout.
			fill: 'flex flex-col flex-1 min-h-0 min-w-0 !space-y-0 gap-4',
		},
	},
	defaultVariants: {
		variant: 'default',
		layout: 'default',
	},
});

/** Toolbar above the table — search, filters, column-visibility menu. */
export const dataTableToolbarVariants = cva(
	'flex flex-wrap items-center justify-between gap-4 mb-4',
	{
		variants: {},
		defaultVariants: {},
	},
);

/**
 * Footer with rows-per-page + pagination. `gap-3` (not `gap-8`) keeps both
 * groups on the same line at narrow viewports.
 */
export const dataTableFooterVariants = cva('flex items-center justify-between gap-3', {
	variants: {},
	defaultVariants: {},
});

export type DataTableVariantProps = VariantProps<typeof dataDataTableVariant>;
