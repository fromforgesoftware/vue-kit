<template>
	<div data-slot="data-table" :class="classes">
		<!-- Toolbar -->
		<div v-if="showToolbar" :class="toolbarClasses">
			<div class="flex flex-1 items-center gap-2">
				<slot name="toolbar-start" />
				<InputSearch
					v-if="showSearch"
					data-slot="data-table-search-input"
					class="w-full lg:max-w-64 flex-1"
					:placeholder="resolvedSearchPlaceholder"
					:model-value="searchQuery"
					@update:model-value="onSearchChange"
				/>
				<FilterBar
					v-if="filterColumns"
					render-as="trigger"
					:columns="filterColumns"
					:model-value="filters ?? []"
					@update:model-value="emit('update:filters', $event)"
				/>
			</div>
			<div class="flex items-center gap-2">
				<slot name="toolbar-end" />
				<DropdownMenu v-if="showColumnVisibility">
					<DropdownMenuTrigger as-child>
						<Button
							variant="outline"
							data-slot="data-table-columns-trigger"
							aria-label="Edit columns"
						>
							<Icon :icon="Settings2" size="sm" class="sm:mr-2" />
							<span class="hidden sm:inline">Edit columns</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-64">
						<div class="px-3 py-2">
							<h4 class="text-sm text-muted-foreground">Toggle columns</h4>
						</div>
						<DropdownMenuCheckboxItem
							v-for="column in getVisibleColumns()"
							:key="column.id"
							:checked="column.getIsVisible()"
							@update:checked="toggleColumnVisibility(column.id)"
						>
							{{
								typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
							}}
						</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>

		<!-- Filter chips row -->
		<Transition
			enter-active-class="transition-all duration-200 ease-out overflow-hidden"
			enter-from-class="max-h-0 opacity-0"
			enter-to-class="max-h-16 opacity-100"
			leave-active-class="transition-all duration-150 ease-in overflow-hidden"
			leave-from-class="max-h-16 opacity-100"
			leave-to-class="max-h-0 opacity-0"
		>
			<div
				v-if="filterColumns && filters && filters.length > 0"
				class="flex flex-wrap items-center gap-2 px-1"
			>
				<FilterBar
					render-as="chips"
					:columns="filterColumns"
					:model-value="filters"
					@update:model-value="emit('update:filters', $event)"
				/>
			</div>
		</Transition>

		<!-- Cross-page selection banner — opt-in via `fetchAllMatchingIds`.
         Shown when every visible row is selected and there are unseen
         matching rows on other pages, OR while in `all-matching` mode.
         Uses the shared `Alert` component for visual + a11y consistency. -->
		<Alert
			v-if="showSelectAllBanner"
			data-slot="data-table-select-all-banner"
			tone="soft"
			size="sm"
			class="flex flex-wrap items-center gap-x-2 gap-y-1"
		>
			<template v-if="selectionMode === 'all-matching'">
				<span class="text-foreground">
					All {{ dataSource.totalCount }} matching items are selected.
				</span>
				<Button variant="link" size="sm" @click="clearSelection"> Clear all </Button>
			</template>
			<template v-else>
				<span class="text-muted-foreground">
					All {{ table.getRowModel().rows.length }} items on this page are selected.
				</span>
				<Button variant="link" size="sm" @click="selectAllMatching">
					Select all {{ dataSource.totalCount }} matching
				</Button>
			</template>
		</Alert>

		<!-- Primary variant table -->
		<template v-if="effectiveVariant === 'primary'">
			<div
				ref="scrollContainerRef"
				:class="cn('relative w-full overflow-auto', isFillLayout && 'flex-1 min-h-0')"
			>
				<table
					class="w-full max-sm:min-w-[640px] caption-bottom text-sm table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b"
				>
					<thead>
						<tr
							v-for="headerGroup in table.getHeaderGroups()"
							:key="`${headerGroup.id}-${selectedCount}`"
						>
							<th
								v-for="header in headerGroup.headers"
								:ref="(el) => setHeaderCellRef(header.column.id, el as Element | null)"
								:key="header.id"
								data-slot="data-table-head"
								:class="
									cn(
										'h-9 px-3 text-left align-middle font-medium text-muted-foreground select-none bg-sidebar border-y border-border first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg [&:has([role=checkbox])]:pr-0',
										priorityHeaderClass(header.column.id, header.column.columnDef.meta?.priority),
										header.column.getCanSort() && 'cursor-pointer',
									)
								"
								:style="{ width: `${header.getSize()}px`, ...anchorStyle(header.column.id) }"
								@click="header.column.getToggleSortingHandler()?.($event)"
							>
								<template v-if="!header.isPlaceholder">
									<div
										:data-slot="header.column.getCanSort() ? 'data-table-sort' : undefined"
										class="flex items-center gap-1.5 truncate"
									>
										<span class="truncate">
											<FlexRender
												:render="header.column.columnDef.header"
												:props="header.getContext()"
											/>
										</span>
										<template v-if="header.column.getCanSort()">
											<Icon
												v-if="header.column.getIsSorted() === 'asc'"
												:icon="ArrowUp"
												size="xs-sm"
												class="shrink-0"
											/>
											<Icon
												v-else-if="header.column.getIsSorted() === 'desc'"
												:icon="ArrowDown"
												size="xs-sm"
												class="shrink-0"
											/>
											<Icon v-else :icon="ArrowUpDown" size="xs-sm" class="shrink-0 opacity-40" />
										</template>
									</div>
								</template>
							</th>
						</tr>
					</thead>
					<tbody aria-hidden="true" class="table-row h-1" />
					<tbody class="[&_tr:last-child]:border-0">
						<template v-if="table.getRowModel().rows.length">
							<tr
								v-for="row in table.getRowModel().rows"
								:key="`${row.id}-${!!rowSelection[row.id]}`"
								data-slot="data-table-row"
								:data-state="rowSelection[row.id] ? 'selected' : undefined"
								class="group/dt-row bg-background transition-colors [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg hover:bg-row-hover data-[state=selected]:bg-muted"
							>
								<td
									v-for="cell in row.getVisibleCells()"
									:key="cell.id"
									:class="
										cn(
											'p-3 align-middle [&:has([role=checkbox])]:pr-0',
											priorityCellClass(cell.column.id, cell.column.columnDef.meta?.priority),
										)
									"
									:style="anchorStyle(cell.column.id)"
								>
									<FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
								</td>
							</tr>
						</template>
						<tr v-else>
							<td :colspan="table.getAllColumns().length" class="p-0">
								<div
									class="sticky left-0 flex items-center justify-center"
									:style="emptyStateWrapperStyle"
								>
									<slot name="empty">
										<EmptyState
											v-if="hasActiveFilters"
											:icon="SearchX"
											title="No results found"
											description="Try adjusting your search or filters to find what you're looking for."
											size="sm"
										/>
										<EmptyState
											v-else
											:illustration="emptyIllustration"
											:title="emptyTitle"
											:description="emptyDescription"
											size="sm"
										>
											<Button v-if="emptyActionLabel" size="default" @click="emit('empty-action')">
												<Icon :icon="Plus" size="sm" />
												{{ emptyActionLabel }}
											</Button>
										</EmptyState>
									</slot>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>

		<!-- Outline variant table. Border + rounding live on the same element as
         the scroll container — interposing an `overflow-hidden` wrapper between
         the scroll ancestor and a sticky cell would break `position: sticky`,
         so the mobile anchor column wouldn't pin during horizontal scroll. -->
		<template v-else-if="effectiveVariant === 'outline'">
			<div
				ref="scrollContainerRef"
				:class="
					cn(
						'relative w-full overflow-auto bg-background rounded-md border',
						isFillLayout && 'flex-1 min-h-0',
					)
				"
			>
				<table class="w-full caption-bottom text-sm table-fixed">
					<thead class="[&_tr]:border-b">
						<tr
							v-for="headerGroup in table.getHeaderGroups()"
							:key="headerGroup.id"
							class="border-b transition-colors"
						>
							<th
								v-for="header in headerGroup.headers"
								:ref="(el) => setHeaderCellRef(header.column.id, el as Element | null)"
								:key="header.id"
								data-slot="data-table-head"
								:class="
									cn(
										'h-11 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
										priorityHeaderClass(header.column.id, header.column.columnDef.meta?.priority),
										header.column.getCanSort() && 'cursor-pointer',
									)
								"
								:style="{ width: `${header.getSize()}px`, ...anchorStyle(header.column.id) }"
								@click="header.column.getToggleSortingHandler()?.($event)"
							>
								<template v-if="!header.isPlaceholder">
									<div
										:data-slot="header.column.getCanSort() ? 'data-table-sort' : undefined"
										class="flex items-center justify-between gap-1.5 truncate"
									>
										<span class="truncate">
											<FlexRender
												:render="header.column.columnDef.header"
												:props="header.getContext()"
											/>
										</span>
										<template v-if="header.column.getCanSort()">
											<Icon
												v-if="header.column.getIsSorted() === 'asc'"
												:icon="ArrowUp"
												size="xs-sm"
												class="shrink-0"
											/>
											<Icon
												v-else-if="header.column.getIsSorted() === 'desc'"
												:icon="ArrowDown"
												size="xs-sm"
												class="shrink-0"
											/>
											<Icon v-else :icon="ArrowUpDown" size="xs-sm" class="shrink-0 opacity-40" />
										</template>
									</div>
								</template>
							</th>
						</tr>
					</thead>
					<tbody class="[&_tr:last-child]:border-0">
						<template v-if="table.getRowModel().rows.length">
							<tr
								v-for="row in table.getRowModel().rows"
								:key="`${row.id}-${!!rowSelection[row.id]}`"
								data-slot="data-table-row"
								:data-state="rowSelection[row.id] ? 'selected' : undefined"
								class="group/dt-row bg-background border-b transition-colors hover:bg-row-hover data-[state=selected]:bg-muted"
							>
								<td
									v-for="cell in row.getVisibleCells()"
									:key="cell.id"
									:class="
										cn(
											'p-3 align-middle [&:has([role=checkbox])]:pr-0',
											priorityCellClass(cell.column.id, cell.column.columnDef.meta?.priority),
										)
									"
									:style="anchorStyle(cell.column.id)"
								>
									<FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
								</td>
							</tr>
						</template>
						<tr v-else>
							<td :colspan="table.getAllColumns().length" class="p-0">
								<div
									class="sticky left-0 flex items-center justify-center"
									:style="emptyStateWrapperStyle"
								>
									<slot name="empty">
										<EmptyState
											v-if="hasActiveFilters"
											:icon="SearchX"
											title="No results found"
											description="Try adjusting your search or filters to find what you're looking for."
											size="sm"
										/>
										<EmptyState
											v-else
											:illustration="emptyIllustration"
											:title="emptyTitle"
											:description="emptyDescription"
											size="sm"
										>
											<Button v-if="emptyActionLabel" size="default" @click="emit('empty-action')">
												<Icon :icon="Plus" size="sm" />
												{{ emptyActionLabel }}
											</Button>
										</EmptyState>
									</slot>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>

		<!-- Card variant — rows render via the consumer's #row slot. Sorting, filters, search,
         pagination, and column-visibility plumbing are shared with the table
         variants — only the rendered shape changes. -->
		<template v-else-if="effectiveVariant === 'card'">
			<div
				v-if="table.getRowModel().rows.length"
				:class="
					cn(
						'flex flex-col gap-2',
						isFillLayout && 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1',
					)
				"
				data-slot="data-table-card-rows"
			>
				<slot
					v-for="row in table.getRowModel().rows"
					:key="row.id"
					name="row"
					:row="row.original"
					:selected="!!rowSelection[row.id]"
				/>
			</div>
			<slot v-else name="empty">
				<EmptyState
					v-if="hasActiveFilters"
					:icon="SearchX"
					title="No results found"
					description="Try adjusting your search or filters to find what you're looking for."
					size="sm"
				/>
				<EmptyState
					v-else
					:illustration="emptyIllustration"
					:title="emptyTitle"
					:description="emptyDescription"
					size="sm"
				>
					<Button v-if="emptyActionLabel" size="default" @click="emit('empty-action')">
						<Icon :icon="Plus" size="sm" />
						{{ emptyActionLabel }}
					</Button>
				</EmptyState>
			</slot>
		</template>

		<!-- Pagination — single row at every viewport. Labels collapse to
         sr-only below `sm` so the row fits without wrapping; the select +
         pagination controls themselves stay visible at every width. Hidden
         when there's nothing to paginate so the empty state stands alone. -->
		<div v-if="pagination && dataSource.totalCount > 0" :class="footerClasses">
			<div class="flex items-center gap-3 min-w-0">
				<Label for="rows-per-page" class="whitespace-nowrap max-sm:sr-only"> Rows per page </Label>
				<select
					id="rows-per-page"
					:value="pagination.pageSize"
					data-slot="data-table-page-size"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 w-16 px-2"
					@change="onPageSizeChange"
				>
					<option v-for="pageSize in [5, 10, 25, 50]" :key="pageSize" :value="pageSize">
						{{ pageSize }}
					</option>
				</select>
			</div>

			<div class="flex items-center gap-3 min-w-0">
				<Label class="whitespace-nowrap shrink-0 text-muted-foreground font-normal max-sm:sr-only">
					{{ startRow }}-{{ endRow }} of {{ dataSource.totalCount }}
				</Label>
				<Pagination
					:page="currentPage"
					:total="pages"
					:items-per-page="1"
					@update:page="onPageIndexChange"
				/>
			</div>
		</div>
	</div>

	<!-- Selection Panel (sticky bottom) -->
	<Transition
		enter-active-class="transition duration-300 ease-out"
		enter-from-class="translate-y-full opacity-0"
		enter-to-class="translate-y-0 opacity-100"
		leave-active-class="transition duration-200 ease-in"
		leave-from-class="translate-y-0 opacity-100"
		leave-to-class="translate-y-full opacity-0"
	>
		<div
			v-if="showSelectionPanel"
			class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-center justify-center pb-4"
		>
			<div
				class="pointer-events-auto flex items-center divide-x divide-background/20 rounded-xl border border-background/20 bg-foreground px-4 py-1 shadow-lg max-sm:mx-4 max-sm:flex-wrap max-sm:justify-center max-sm:divide-x-0 max-sm:gap-2 max-sm:py-2"
			>
				<div class="flex items-center gap-3 pr-3">
					<Checkbox
						class="border-background/40 data-[state=checked]:border-background data-[state=checked]:bg-background data-[state=checked]:text-foreground"
						:checked="true"
						aria-label="Select items"
					/>
					<span class="text-sm font-medium text-background">
						{{ effectiveCount }} item(s) selected
					</span>
				</div>
				<div class="flex items-center gap-1 px-3">
					<slot
						name="selection-actions"
						:selected-count="selectedCount"
						:selected-rows="selectedRows"
						:selection-mode="selectionMode"
						:effective-count="effectiveCount"
					/>
				</div>
				<div class="pl-3">
					<Button
						variant="ghost"
						size="icon"
						data-slot="data-table-clear-selection"
						aria-label="Clear all"
						class="size-8 rounded-full hover:bg-background/20 hover:text-background text-background"
						@click="clearSelection"
					>
						<Icon :icon="X" size="sm" />
					</Button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts" generic="T">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { Settings2, X, ArrowUp, ArrowDown, ArrowUpDown, SearchX, Plus } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import EmptyState from '../../general/empty-state/EmptyState.vue';
import type { IllustrationName } from '../../general/empty-state/empty-state';
import {
	useVueTable,
	getCoreRowModel,
	getFilteredRowModel,
	FlexRender,
	type ColumnDef,
	type PaginationState,
	type SortingState,
	type VisibilityState,
	type RowSelectionState,
} from '@tanstack/vue-table';
import { cn } from '../../../helpers/cn';
import Alert from '../../general/alert/Alert.vue';
import Button from '../../general/button/Button.vue';
import Checkbox from '../../form/checkbox/Checkbox.vue';
import Label from '../../form/label/Label.vue';
import InputSearch from '../../form/input-search/InputSearch.vue';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
} from '../../general/dropdown-menu';
import Pagination from '../../general/pagination/Pagination.vue';
import FilterBar from '../filter-bar/FilterBar.vue';
import {
	dataDataTableVariant,
	dataTableToolbarVariants,
	dataTableFooterVariants,
	type DataTableDataSource,
	type DataTableLayout,
	type DataTableVariant,
	type SelectionMode,
} from './data-table';
import type { ColumnConfig, FiltersState } from '../filter-bar/filter-bar';

export interface DataTableProps<T = unknown> {
	columns: ColumnDef<T, unknown>[];
	dataSource: DataTableDataSource<T>;
	variant?: DataTableVariant;
	/**
	 * Structural layout. `default` flows naturally; `fill` makes the table
	 * claim its parent's full height and pins the toolbar + pagination row,
	 * leaving only the rows region scrollable. Use `fill` inside a
	 * height-constrained parent (e.g. dialog body) where the filter bar and
	 * pagination must stay visible while the user scrolls a long list.
	 */
	layout?: DataTableLayout;
	showToolbar?: boolean;
	showSearch?: boolean;
	showColumnVisibility?: boolean;
	searchPlaceholder?: string;
	pagination?: PaginationState;
	sorting?: SortingState;
	columnVisibility?: VisibilityState;
	filterColumns?: ColumnConfig[];
	filters?: FiltersState;
	/**
	 * Maps a row to its stable entity id. Required when `enableSelectAllMatching`
	 * is true so `rowSelection` keys reference entity IDs (not row indices) —
	 * the consumer's bulk handler reads them via `selectedRows` in `page` mode.
	 * Forwarded to tanstack's `useVueTable`.
	 */
	getRowId?: (row: T) => string;
	/**
	 * Opt into Gmail-style cross-page selection. When the user selects every
	 * row on the current page and `dataSource.totalCount > currentPageRowCount`,
	 * a banner appears offering to extend selection to every matching row.
	 *
	 * The consumer is then responsible for branching on `selectionMode` in the
	 * `selection-actions` slot:
	 *   - `page`: act on the IDs in `selectedRows`.
	 *   - `all-matching`: send the current filter/search to a filter-aware bulk
	 *     endpoint — DataTable does NOT enumerate IDs (it would scale poorly).
	 */
	enableSelectAllMatching?: boolean;
	/**
	 * Set `true` when the consumer re-fetches from the API in response to
	 * `@search` (e.g. Employees, Shifts). The table emits `@search` and skips
	 * its own client-side global filter so the rows aren't double-filtered.
	 * Default `false` → search filters `dataSource.data` in-memory via
	 * TanStack's `globalFilter`.
	 */
	serverSearch?: boolean;
	/**
	 * Default empty-state illustration shown when there's no data and no active
	 * search/filter. Override with the `#empty` slot for fully custom content.
	 */
	emptyIllustration?: IllustrationName;
	/** Title for the no-data empty state. */
	emptyTitle?: string;
	/** Description for the no-data empty state. */
	emptyDescription?: string;
	/**
	 * Label for the call-to-action button in the no-data empty state.
	 * Set to an empty string to hide the button. Clicking emits `@empty-action`.
	 */
	emptyActionLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<DataTableProps<T>>(), {
	variant: 'default',
	layout: 'default',
	showToolbar: true,
	showSearch: true,
	showColumnVisibility: true,
	filterColumns: undefined,
	filters: undefined,
	getRowId: undefined,
	enableSelectAllMatching: false,
	serverSearch: false,
	emptyIllustration: 'empty-datatable',
	emptyTitle: 'No data yet',
	emptyDescription: 'Get started by creating your first item.',
	emptyActionLabel: 'Create new',
});

const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? 'Search');

// Selection columns (`id === 'select'`) are auto-treated as priority so the
// bulk-update checkbox is always visible — consumers don't need to flag it.
function isAlwaysVisibleColumn(columnId: string | undefined): boolean {
	return columnId === 'select';
}

// Anchor columns stay sticky on mobile so the row identifier stays in view
// when scrolling horizontally. Includes the select column (if any) AND the
// first non-select priority column, in their natural order — so checkbox +
// row label both stay pinned together.
const anchorColumnIds = ref<string[]>([]);
const lastAnchorColumnId = ref<string | undefined>(undefined);

// Actual rendered widths of each sticky header cell — used to compute the
// `left` offset for sibling sticky cells. We measure the DOM rather than
// trusting `column.getSize()` because `table-fixed` + `w-full` distributes
// any leftover width proportionally, so the rendered widths drift from the
// configured sizes whenever the visible columns don't already fill the
// table's available width.
const anchorRenderedWidths = ref<Record<string, number>>({});
const anchorColumnLeftOffsets = computed<Record<string, number>>(() => {
	const offsets: Record<string, number> = {};
	let running = 0;
	for (const id of anchorColumnIds.value) {
		offsets[id] = running;
		running += anchorRenderedWidths.value[id] ?? 0;
	}
	return offsets;
});
// When the consumer opts in by flagging at least one column with meta.priority,
// the mobile view hides non-priority columns. When no column is flagged, we
// keep all columns visible and rely on horizontal scroll instead — otherwise
// tables built without priority hints render empty on mobile.
const hasOptedInToPriority = ref(false);

function isAnchorColumn(columnId: string | undefined): boolean {
	return columnId !== undefined && anchorColumnIds.value.includes(columnId);
}

// Inline left offset for sticky anchor columns. Tailwind's `max-sm:sticky`
// only activates `position: sticky` at < sm, so the inline `left` value is
// inert on desktop (where position resolves to static).
function anchorStyle(columnId: string | undefined): Record<string, string> | undefined {
	if (!isAnchorColumn(columnId)) return undefined;
	return { left: `${anchorColumnLeftOffsets.value[columnId!] ?? 0}px` };
}

function priorityCellClass(columnId: string | undefined, _priority: boolean | undefined): string {
	if (!isAnchorColumn(columnId)) return '';
	// The row paints opaque colours for every state (idle bg-background, hover
	// color-mix, selected bg-muted) so the sticky cell can simply inherit — the
	// visual will always match the rest of the row, and no scrolling content
	// can bleed through because every state is opaque. Only the LAST anchor
	// gets the right-side seam against scrolling content.
	return cn(
		'max-sm:sticky max-sm:z-10 max-sm:bg-inherit',
		columnId === lastAnchorColumnId.value && 'max-sm:border-r max-sm:border-border',
	);
}

function priorityHeaderClass(columnId: string | undefined, _priority: boolean | undefined): string {
	if (!isAnchorColumn(columnId)) return '';
	return cn(
		'max-sm:sticky max-sm:z-20 max-sm:bg-sidebar',
		columnId === lastAnchorColumnId.value && 'max-sm:border-r max-sm:border-border',
	);
}

const emit = defineEmits<{
	'update:pagination': [pagination: PaginationState];
	'update:sorting': [sorting: SortingState];
	'update:columnVisibility': [visibility: VisibilityState];
	'update:filters': [filters: FiltersState];
	'update:selectionMode': [mode: SelectionMode];
	search: [query: string];
	'empty-action': [];
}>();

const searchQuery = ref('');

// True when the current emptiness is the result of a search/filter rather than
// a first-time empty dataset. Drives which default empty state is shown.
const hasActiveFilters = computed(() => {
	if (searchQuery.value.trim()) return true;
	if (props.filters && Object.keys(props.filters).length > 0) return true;
	return false;
});

const rowSelection = ref<RowSelectionState>({});

const columnVisibilityState = ref<VisibilityState>(props.columnVisibility ?? {});
watch(
	() => props.columnVisibility,
	(v) => {
		if (v) columnVisibilityState.value = v;
	},
);

const sortingState = ref<SortingState>(props.sorting ?? []);
watch(
	() => props.sorting,
	(v) => {
		if (v) sortingState.value = v;
	},
);

const table = useVueTable({
	get data() {
		return props.dataSource.data;
	},
	get columns() {
		return props.columns;
	},
	get getRowId() {
		return props.getRowId;
	},
	state: {
		get rowSelection() {
			return rowSelection.value;
		},
		get columnVisibility() {
			return columnVisibilityState.value;
		},
		get sorting() {
			return sortingState.value;
		},
		// When serverSearch is set, the consumer is filtering server-side and we
		// pass an empty global filter so TanStack doesn't double-filter.
		get globalFilter() {
			return props.serverSearch ? '' : searchQuery.value;
		},
	},
	enableRowSelection: true,
	onRowSelectionChange: (updater) => {
		rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater;
	},
	onColumnVisibilityChange: (updater) => {
		const newState = typeof updater === 'function' ? updater(columnVisibilityState.value) : updater;
		columnVisibilityState.value = newState;
		emit('update:columnVisibility', newState);
	},
	onSortingChange: (updater) => {
		const newState = typeof updater === 'function' ? updater(sortingState.value) : updater;
		sortingState.value = newState;
		emit('update:sorting', newState);
	},
	getCoreRowModel: getCoreRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	manualPagination: true,
	manualSorting: true,
	manualFiltering: false,
});

watchEffect(() => {
	const leafs = table.getAllLeafColumns();
	hasOptedInToPriority.value = leafs.some((c) => c.columnDef.meta?.priority);

	const anchors: string[] = [];
	// Select column always anchors when present so the bulk-action checkbox
	// stays in view alongside the row label.
	const selectCol = leafs.find((c) => isAlwaysVisibleColumn(c.id));
	if (selectCol) anchors.push(selectCol.id);
	// First non-select priority column also anchors. When the consumer hasn't
	// opted in via meta.priority, anchor the first non-select column instead.
	const firstNonSelectPriority = hasOptedInToPriority.value
		? leafs.find((c) => c.columnDef.meta?.priority && !isAlwaysVisibleColumn(c.id))
		: leafs.find((c) => !isAlwaysVisibleColumn(c.id));
	if (firstNonSelectPriority && !anchors.includes(firstNonSelectPriority.id)) {
		anchors.push(firstNonSelectPriority.id);
	}

	anchorColumnIds.value = anchors;
	lastAnchorColumnId.value = anchors[anchors.length - 1];
});

// Tracks all rendered <th> elements keyed by column id. Non-reactive Map —
// mutations are driven by the function ref during render and we don't want
// them to trigger reactive updates (would cause render loops).
const headerCellRefs = new Map<string, HTMLElement>();
let resizeObserver: ResizeObserver | null = null;

// The empty-state cell spans all columns, so on mobile (where columns can
// overflow horizontally) it inherits the full table width and slides under
// horizontal scroll. We pin its content with `position: sticky; left: 0` and
// constrain the wrapper to the scroll container's clientWidth so the empty
// state stays centered in the visible scrollport regardless of scroll offset.
const scrollContainerRef = ref<HTMLElement | null>(null);
const scrollContainerWidth = ref(0);
let scrollContainerObserver: ResizeObserver | null = null;

const emptyStateWrapperStyle = computed(() =>
	scrollContainerWidth.value > 0 ? { width: `${scrollContainerWidth.value}px` } : undefined,
);

function refreshAnchorWidths() {
	const next: Record<string, number> = {};
	for (const id of anchorColumnIds.value) {
		const el = headerCellRefs.get(id);
		// getBoundingClientRect().width gives a fractional value — required when
		// `table-fixed` + `w-full` redistributes leftover px and the cell renders
		// at a non-integer width. offsetWidth would round and the next sticky
		// cell's `left` would be off by ~0.5px, causing a visible overlap.
		if (el) next[id] = el.getBoundingClientRect().width;
	}
	// Skip the assignment if nothing changed — keeps consumers of
	// `anchorRenderedWidths` from re-rendering for free.
	const prev = anchorRenderedWidths.value;
	const sameKeys = Object.keys(prev).length === Object.keys(next).length;
	const sameValues = sameKeys && Object.keys(next).every((k) => prev[k] === next[k]);
	if (!sameValues) anchorRenderedWidths.value = next;
}

function setHeaderCellRef(columnId: string | undefined, el: Element | null) {
	if (!columnId) return;
	const existing = headerCellRefs.get(columnId);
	if (existing === el) return; // ref didn't change — avoid the observer churn
	if (existing) {
		resizeObserver?.unobserve(existing);
		headerCellRefs.delete(columnId);
	}
	if (el instanceof HTMLElement) {
		headerCellRefs.set(columnId, el);
		resizeObserver?.observe(el);
	}
	// Width refresh happens via the ResizeObserver callback (async, post-layout)
	// — never synchronously inside the ref function, to avoid recursive renders.
}

onMounted(() => {
	if (typeof ResizeObserver === 'undefined') return;
	resizeObserver = new ResizeObserver(refreshAnchorWidths);
	for (const el of headerCellRefs.values()) {
		resizeObserver.observe(el);
	}
	refreshAnchorWidths();

	scrollContainerObserver = new ResizeObserver(() => {
		if (scrollContainerRef.value) {
			scrollContainerWidth.value = scrollContainerRef.value.clientWidth;
		}
	});
	if (scrollContainerRef.value) {
		scrollContainerObserver.observe(scrollContainerRef.value);
		scrollContainerWidth.value = scrollContainerRef.value.clientWidth;
	}
});

onUnmounted(() => {
	resizeObserver?.disconnect();
	resizeObserver = null;
	scrollContainerObserver?.disconnect();
	scrollContainerObserver = null;
});

// Variant switches between primary/outline remount the scroll container, so
// rebind the observer to the new element and refresh the cached width.
watch(scrollContainerRef, (el, prevEl) => {
	if (prevEl && scrollContainerObserver) scrollContainerObserver.unobserve(prevEl);
	if (el && scrollContainerObserver) {
		scrollContainerObserver.observe(el);
		scrollContainerWidth.value = el.clientWidth;
	} else if (!el) {
		scrollContainerWidth.value = 0;
	}
});

// When the anchor set changes (e.g. column visibility toggle), re-measure
// once the new layout is committed.
watch(anchorColumnIds, () => refreshAnchorWidths(), { flush: 'post' });

const classes = computed(() =>
	cn(dataDataTableVariant({ variant: props.variant, layout: props.layout }), props.class),
);
const isFillLayout = computed(() => props.layout === 'fill');
const toolbarClasses = computed(() => cn(dataTableToolbarVariants()));
const footerClasses = computed(() => cn(dataTableFooterVariants()));

const currentPage = computed(() => {
	if (!props.pagination) return 1;
	return props.pagination.pageIndex + 1;
});

const pages = computed(() => {
	if (!props.pagination || props.pagination.pageSize <= 0) return 1;
	return Math.ceil(props.dataSource.totalCount / props.pagination.pageSize);
});

const startRow = computed(() => {
	if (!props.pagination || props.dataSource.data.length === 0) return 0;
	return props.pagination.pageIndex * props.pagination.pageSize + 1;
});

const endRow = computed(() => {
	if (!props.pagination) return props.dataSource.data.length;
	return props.pagination.pageIndex * props.pagination.pageSize + props.dataSource.data.length;
});

const selectedCount = computed(() => Object.keys(rowSelection.value).length);
const selectedRows = computed(() =>
	table
		.getRowModel()
		.rows.filter((row) => rowSelection.value[row.id])
		.map((row) => row.original),
);

// ── Cross-page selection ───────────────────────────────────────────────────
//
// `page` mode: selection is the entries currently in `rowSelection` (which
//   does persist across page changes — tanstack keeps unseen page IDs in
//   the map).
// `all-matching` mode: the user has explicitly opted into "every row matching
//   the current filter context"; the consumer's `fetchAllMatchingIds`
//   callback resolves the actual id list when the bulk action runs.
const selectionMode = ref<SelectionMode>('page');

const allCurrentPageRowsSelected = computed(() => {
	const rows = table.getRowModel().rows;
	if (rows.length === 0) return false;
	return rows.every((row) => rowSelection.value[row.id]);
});

const canSelectAllMatching = computed(() => {
	if (!props.enableSelectAllMatching) return false;
	const pageRowCount = table.getRowModel().rows.length;
	return pageRowCount > 0 && props.dataSource.totalCount > pageRowCount;
});

const showSelectAllBanner = computed(
	() =>
		props.enableSelectAllMatching &&
		(selectionMode.value === 'all-matching' ||
			(allCurrentPageRowsSelected.value && canSelectAllMatching.value)),
);

const effectiveCount = computed(() =>
	selectionMode.value === 'all-matching' ? props.dataSource.totalCount : selectedCount.value,
);

const showSelectionPanel = computed(() => effectiveCount.value > 0);

function selectAllMatching(): void {
	if (!props.enableSelectAllMatching) return;
	selectionMode.value = 'all-matching';
	emit('update:selectionMode', 'all-matching');
}

// While in `all-matching` mode, every row on every page should *appear*
// selected — the user's intent is "act on every match", and paginating is
// just browsing through it. We honour that by auto-toggling each newly
// loaded page's rows on. This also keeps `row.getIsSelected()` aligned with
// what the user sees, so a deselect click flows through tanstack's normal
// machinery (key removal in `rowSelection`) and trips the revert below.
watch(
	() => props.dataSource.data,
	() => {
		if (selectionMode.value !== 'all-matching') return;
		if (!allCurrentPageRowsSelected.value) {
			table.toggleAllPageRowsSelected(true);
		}
	},
);

// Revert to `page` mode when the user deselects an individual row while
// in `all-matching`. We detect "user deselected" specifically as a key
// disappearing from `rowSelection` — page changes never remove keys (we
// auto-toggle them on above), so this watcher only fires for genuine
// user-initiated deselects. Matches the user's "I changed my mind" intent
// without tracking exclusions.
let prevSelectionKeys = new Set<string>(Object.keys(rowSelection.value));
watch(
	rowSelection,
	(next) => {
		const nextKeys = new Set(Object.keys(next));
		if (selectionMode.value === 'all-matching') {
			for (const key of prevSelectionKeys) {
				if (!nextKeys.has(key)) {
					selectionMode.value = 'page';
					emit('update:selectionMode', 'page');
					break;
				}
			}
		}
		prevSelectionKeys = nextKeys;
	},
	{ deep: true },
);

// Filter / search / sort / pageSize changes invalidate the all-matching
// selection — the IDs in `rowSelection` no longer correspond to the new
// query. Page-index changes alone do NOT clear (selection persists across
// pages by design).
watch(
	[() => props.filters, () => props.sorting, () => props.pagination?.pageSize, searchQuery],
	(_next, prev) => {
		if (!prev) return;
		if (selectionMode.value !== 'all-matching') return;
		table.resetRowSelection();
		selectionMode.value = 'page';
		emit('update:selectionMode', 'page');
	},
);

// Dev-time guard: enableSelectAllMatching without getRowId would key the
// rowSelection map by tanstack row indices, so consumers' `selectedRows`-based
// page-mode handlers would send wrong IDs.
if (
	typeof process !== 'undefined' &&
	process.env?.NODE_ENV !== 'production' &&
	props.enableSelectAllMatching &&
	!props.getRowId
) {
	console.warn(
		'[DataTable] `enableSelectAllMatching` is true without `getRowId`. ' +
			'Pass `:get-row-id="(r) => r.id"` (or equivalent) so page-mode selection ' +
			'keys align with your entity IDs.',
	);
}

const effectiveVariant = computed(() => (props.variant === 'default' ? 'primary' : props.variant));

function onPageIndexChange(page: number): void {
	if (!props.pagination) return;
	emit('update:pagination', {
		pageIndex: page - 1,
		pageSize: props.pagination.pageSize,
	});
}

function onPageSizeChange(event: Event): void {
	if (!props.pagination) return;
	const value = (event.target as HTMLSelectElement).value;
	emit('update:pagination', {
		pageIndex: 0,
		pageSize: Number(value),
	});
}

function onSearchChange(value: string): void {
	searchQuery.value = value;
	emit('search', value);
}

function toggleColumnVisibility(columnId: string): void {
	const column = table.getColumn(columnId);
	if (column) column.toggleVisibility();
}

function getVisibleColumns() {
	return table.getAllColumns().filter(
		(col) =>
			col.getCanHide() &&
			col.id !== 'select' &&
			// Priority columns (e.g. Name) anchor the row on mobile and must stay
			// visible — exclude them from the toggle list.
			!col.columnDef.meta?.priority,
	);
}

function clearSelection(): void {
	table.resetRowSelection();
	if (selectionMode.value !== 'page') {
		selectionMode.value = 'page';
		emit('update:selectionMode', 'page');
	}
}

defineExpose({
	clearSelection,
	selectionMode: computed(() => selectionMode.value),
});
</script>
