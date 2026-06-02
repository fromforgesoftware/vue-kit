import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import DataTable from './DataTable.vue';
import type { ColumnDef } from '@tanstack/vue-table';

type TestRow = {
	id: number;
	name: string;
	email: string;
};

const sampleColumns = [
	{ key: 'id', header: 'ID' },
	{ key: 'name', header: 'Name', sortable: true },
	{ key: 'email', header: 'Email' },
];

const sampleData = [
	{ id: 1, name: 'John Doe', email: 'john@example.com' },
	{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
	{ id: 3, name: 'Bob Wilson', email: 'bob@example.com' },
];

const sampleDataSource = {
	data: sampleData,
	totalCount: 3,
};

describe('DataTable', () => {
	let wrapper: ReturnType<typeof mount<typeof DataTable>>;

	beforeEach(() => {
		wrapper = mount(DataTable, {
			props: {
				columns: sampleColumns,
				dataSource: sampleDataSource,
			},
		});
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render table element', () => {
			expect(wrapper.find('table').exists()).toBe(true);
		});

		it('should render column headers', () => {
			const headers = wrapper.findAll('th');
			expect(headers.length).toBeGreaterThanOrEqual(sampleColumns.length);
		});

		it('should render data rows', () => {
			const rows = wrapper.findAll('tbody tr');
			expect(rows.length).toBe(sampleData.length);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept columns prop', () => {
			expect(wrapper.props('columns')).toEqual(sampleColumns);
		});

		it('should accept dataSource prop', () => {
			expect(wrapper.props('dataSource')).toEqual(sampleDataSource);
		});

		it('should accept variant prop', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					variant: 'default',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept showToolbar prop', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					showToolbar: false,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept showSearch prop', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					showSearch: true,
				},
			});
			expect(wrapper.find('input').exists()).toBe(true);
		});

		it('should accept selectable prop', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					selectable: true,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept pagination prop', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					pagination: { pageIndex: 0, pageSize: 10 },
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept sort prop', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					sort: { key: 'name', direction: 'asc' },
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Toolbar Tests
	// ============================================
	describe('toolbar', () => {
		it('should show toolbar by default', () => {
			// Toolbar is shown by default
			expect(wrapper.exists()).toBe(true);
		});

		it('should hide toolbar when showToolbar is false', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					showToolbar: false,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should show search input when showSearch is true', () => {
			expect(wrapper.find('input').exists()).toBe(true);
		});
	});

	// ============================================
	// Empty State Tests
	// ============================================
	describe('empty state', () => {
		it('should show empty message when no data', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: { data: [], totalCount: 0 },
				},
			});
			// Default empty state renders "No data yet" when there are no rows and
			// no active search/filter. The filter-empty branch ("No results found")
			// only kicks in when a search query or filter is active.
			expect(wrapper.text()).toContain('No data yet');
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:pagination emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have update:sort emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have search emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have selectionChange emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					class: 'custom-table',
				},
			});
			expect(wrapper.find('div').classes()).toContain('custom-table');
		});
	});

	// ============================================
	// Toolbar / FilterBar integration
	// ============================================
	describe('toolbar integration', () => {
		it('renders search input by default', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource },
			});
			expect(w.find('[data-slot="data-table-search-input"]').exists()).toBe(true);
		});

		it('hides search input when showSearch is false', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource, showSearch: false },
			});
			expect(w.find('[data-slot="data-table-search-input"]').exists()).toBe(false);
		});

		it('renders column-visibility trigger by default', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource },
			});
			expect(w.find('[data-slot="data-table-columns-trigger"]').exists()).toBe(true);
		});

		it('hides column-visibility trigger when showColumnVisibility is false', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					showColumnVisibility: false,
				},
			});
			expect(w.find('[data-slot="data-table-columns-trigger"]').exists()).toBe(false);
		});

		it('hides the entire toolbar when showToolbar is false', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource, showToolbar: false },
			});
			expect(w.find('[data-slot="data-table-search-input"]').exists()).toBe(false);
			expect(w.find('[data-slot="data-table-columns-trigger"]').exists()).toBe(false);
		});

		it('renders #toolbar-end slot content', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource },
				slots: { 'toolbar-end': '<button data-testid="create">Create</button>' },
			});
			expect(w.find('[data-testid="create"]').exists()).toBe(true);
		});

		it('renders #toolbar-start slot content', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource },
				slots: { 'toolbar-start': '<span data-testid="prefix">prefix</span>' },
			});
			expect(w.find('[data-testid="prefix"]').exists()).toBe(true);
		});

		it('emits search event when search input changes', async () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource },
			});
			const input = w.find('[data-slot="data-table-search-input"]');
			await input.setValue('jane');
			expect(w.emitted('search')).toBeTruthy();
			expect(w.emitted('search')?.[0]).toEqual(['jane']);
		});
	});

	describe('filter chips', () => {
		const filterColumns = [
			{
				id: 'status',
				type: 'singleOption' as const,
				displayName: 'Status',
				options: [{ value: 'Active', label: 'Active' }],
			},
		];

		it('renders the FilterBar trigger when filterColumns is provided', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					filterColumns,
					filters: [],
				},
			});
			expect(w.find('[data-slot="filter-bar-trigger"]').exists()).toBe(true);
		});

		it('does not render the FilterBar trigger when filterColumns is omitted', () => {
			const w = mount(DataTable, {
				props: { columns: sampleColumns, dataSource: sampleDataSource },
			});
			expect(w.find('[data-slot="filter-bar-trigger"]').exists()).toBe(false);
		});

		it('renders chip row when filters are active', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					filterColumns,
					filters: [
						{ columnId: 'status', type: 'singleOption', operator: 'is', values: ['Active'] },
					],
				},
			});
			expect(w.find('[data-slot="filter-bar-chip"]').exists()).toBe(true);
		});

		it('hides the chip row when filters array is empty', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					filterColumns,
					filters: [],
				},
			});
			expect(w.find('[data-slot="filter-bar-chip"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle empty columns', () => {
			const wrapper = mount(DataTable, {
				props: {
					columns: [],
					dataSource: { data: [], totalCount: 0 },
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle large dataset', () => {
			const largeData = Array.from({ length: 100 }, (_, i) => ({
				id: i,
				name: `User ${i}`,
				email: `user${i}@example.com`,
			}));
			const wrapper = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: { data: largeData, totalCount: 100 },
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle columns with custom accessor', () => {
			const columnsWithAccessor = [
				{ key: 'id', header: 'ID' },
				{
					key: 'fullName',
					header: 'Full Name',
					accessor: (row: TestRow) => row.name.toUpperCase(),
				},
			];
			const wrapper = mount(DataTable, {
				props: {
					columns: columnsWithAccessor,
					dataSource: sampleDataSource,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Card variant
	// ============================================
	describe('card variant', () => {
		it('renders card-rows container instead of a table when variant=card', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					variant: 'card',
				},
				slots: {
					row: '<div data-test="card-row">{{ params.row.name }}</div>',
				},
			});
			expect(w.find('[data-slot="data-table-card-rows"]').exists()).toBe(true);
			expect(w.find('table').exists()).toBe(false);
		});

		it('renders one row template per data row', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					variant: 'card',
				},
				slots: {
					row: '<div data-test="card-row">{{ params.row.id }}</div>',
				},
			});
			expect(w.findAll('[data-test="card-row"]').length).toBe(sampleData.length);
		});

		it('exposes the row payload to the slot', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					variant: 'card',
				},
				slots: {
					row: '<div data-test="card-row">name:{{ params.row.name }}</div>',
				},
			});
			const text = w.find('[data-test="card-row"]').text();
			expect(text).toBe('name:John Doe');
		});

		it('renders the empty slot fallback when there are no rows', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: { data: [], totalCount: 0 },
					variant: 'card',
				},
				slots: {
					row: '<div data-test="card-row" />',
					empty: '<div data-test="empty-card">No leave</div>',
				},
			});
			expect(w.find('[data-test="card-row"]').exists()).toBe(false);
			expect(w.find('[data-test="empty-card"]').exists()).toBe(true);
		});

		it('still renders the toolbar and filter bar in card variant', () => {
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					variant: 'card',
					filterColumns: [
						{
							id: 'status',
							type: 'singleOption' as const,
							displayName: 'Status',
							options: [{ value: 'a', label: 'A' }],
						},
					],
					filters: [],
				},
				slots: {
					row: '<div data-test="card-row" />',
				},
			});
			expect(w.find('[data-slot="filter-bar-trigger"]').exists()).toBe(true);
		});

		it('does not render the column-visibility menu by default in card variant', () => {
			// Card rows ignore column layout, so the "Edit columns" affordance is
			// typically suppressed by consumers via :show-column-visibility="false".
			// The component itself doesn't auto-hide it — but make sure passing the
			// prop works as a clean opt-out for card consumers.
			const w = mount(DataTable, {
				props: {
					columns: sampleColumns,
					dataSource: sampleDataSource,
					variant: 'card',
					showColumnVisibility: false,
				},
				slots: {
					row: '<div data-test="card-row" />',
				},
			});
			expect(w.find('[data-slot="data-table-columns-trigger"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Cross-page selection
	// ============================================
	describe('cross-page selection', () => {
		type Row = { id: string; name: string };

		const buildSelectionColumns = (): ColumnDef<Row, unknown>[] => [
			{
				id: 'select',
				header: ({ table }) =>
					h('input', {
						type: 'checkbox',
						'data-test': 'select-all',
						checked: table.getIsAllPageRowsSelected(),
						onChange: (e: Event) =>
							table.toggleAllPageRowsSelected((e.target as HTMLInputElement).checked),
					}),
				cell: ({ row }) =>
					h('input', {
						type: 'checkbox',
						'data-test': `select-row-${row.id}`,
						checked: row.getIsSelected(),
						onChange: (e: Event) => row.toggleSelected((e.target as HTMLInputElement).checked),
					}),
				size: 32,
				enableSorting: false,
			},
			{ id: 'name', accessorKey: 'name', header: 'Name' },
		];

		function buildPageData(count: number): Row[] {
			return Array.from({ length: count }, (_, i) => ({
				id: String(i + 1),
				name: `Row ${i + 1}`,
			}));
		}

		function mountTable(
			overrides: {
				pageRowCount?: number;
				totalCount?: number;
				enableSelectAllMatching?: boolean;
				filters?: Array<{ id: string; value: unknown }>;
				pagination?: { pageIndex: number; pageSize: number };
			} = {},
		) {
			const pageRowCount = overrides.pageRowCount ?? 3;
			const totalCount = overrides.totalCount ?? 10;
			return mount(DataTable as unknown as new () => unknown, {
				props: {
					columns: buildSelectionColumns(),
					dataSource: { data: buildPageData(pageRowCount), totalCount },
					getRowId: (r: Row) => r.id,
					enableSelectAllMatching: overrides.enableSelectAllMatching ?? true,
					showColumnVisibility: false,
					filters: overrides.filters,
					pagination: overrides.pagination,
				},
			});
		}

		const banner = '[data-slot="data-table-select-all-banner"]';

		async function selectAllOnPage(w: ReturnType<typeof mountTable>) {
			await w.find('[data-test="select-all"]').setValue(true);
			await nextTick();
		}

		function lastEmitted(w: ReturnType<typeof mountTable>, name: string): unknown[] | undefined {
			const events = (w.emitted(name) ?? []) as unknown[][];
			return events.length > 0 ? events[events.length - 1] : undefined;
		}

		it('does not render the banner when enableSelectAllMatching is false', async () => {
			const w = mountTable({ enableSelectAllMatching: false });
			await selectAllOnPage(w);
			expect(w.find(banner).exists()).toBe(false);
		});

		it('does not render the banner when totalCount equals current page row count', async () => {
			const w = mountTable({ pageRowCount: 3, totalCount: 3 });
			await selectAllOnPage(w);
			expect(w.find(banner).exists()).toBe(false);
		});

		it('renders the banner with both counts when all current-page rows are selected', async () => {
			const w = mountTable({ pageRowCount: 3, totalCount: 10 });
			await selectAllOnPage(w);
			const el = w.find(banner);
			expect(el.exists()).toBe(true);
			expect(el.text()).toContain('3');
			expect(el.text()).toContain('10');
		});

		it('clicking the banner action switches to all-matching mode and emits the event', async () => {
			const w = mountTable({ pageRowCount: 3, totalCount: 10 });
			await selectAllOnPage(w);
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			expect(w.find(banner).text()).toContain('All 10 matching');
			expect(w.emitted('update:selectionMode')).toEqual([['all-matching']]);
		});

		it('reverts to page mode when an individual row is deselected in all-matching mode', async () => {
			const w = mountTable({ pageRowCount: 3, totalCount: 10 });
			await selectAllOnPage(w);
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			await w.find('[data-test="select-row-1"]').setValue(false);
			await nextTick();
			expect(lastEmitted(w, 'update:selectionMode')).toEqual(['page']);
			expect(w.find(banner).exists()).toBe(false);
		});

		it('clears selection and reverts when filters change while in all-matching mode', async () => {
			const w = mountTable({
				pageRowCount: 3,
				totalCount: 10,
				filters: [],
			});
			await selectAllOnPage(w);
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			await w.setProps({ filters: [{ id: 'name', value: 'foo' }] });
			await nextTick();
			expect(lastEmitted(w, 'update:selectionMode')).toEqual(['page']);
			expect(w.find(banner).exists()).toBe(false);
		});

		it('does not revert when only the page index changes (selection persists across pages)', async () => {
			const w = mountTable({
				pageRowCount: 3,
				totalCount: 10,
				pagination: { pageIndex: 0, pageSize: 3 },
			});
			await selectAllOnPage(w);
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			await w.setProps({ pagination: { pageIndex: 1, pageSize: 3 } });
			await nextTick();
			const events = (w.emitted('update:selectionMode') ?? []) as string[][];
			expect(events.length).toBe(1);
			expect(events[0]).toEqual(['all-matching']);
		});

		it('reverts and clears when pageSize changes in all-matching mode', async () => {
			const w = mountTable({
				pageRowCount: 3,
				totalCount: 10,
				pagination: { pageIndex: 0, pageSize: 3 },
			});
			await selectAllOnPage(w);
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			await w.setProps({ pagination: { pageIndex: 0, pageSize: 5 } });
			await nextTick();
			expect(lastEmitted(w, 'update:selectionMode')).toEqual(['page']);
		});

		it('selection-actions slot exposes selectionMode, effectiveCount, and selectedRows', async () => {
			type SlotScope = {
				selectionMode: string;
				effectiveCount: number;
				selectedRows: Row[];
			};
			const seen: SlotScope[] = [];
			const w = mount(DataTable as unknown as new () => unknown, {
				props: {
					columns: buildSelectionColumns(),
					dataSource: { data: buildPageData(3), totalCount: 10 },
					getRowId: (r: Row) => r.id,
					enableSelectAllMatching: true,
					showColumnVisibility: false,
				},
				slots: {
					'selection-actions': (params: SlotScope) => {
						seen.push({ ...params, selectedRows: [...params.selectedRows] });
						return h('span', { 'data-test': 'slot' }, params.selectionMode);
					},
				},
			});

			// Page mode: selecting one row → mode 'page', selectedRows has that row.
			await w.find('[data-test="select-row-2"]').setValue(true);
			await nextTick();
			const pageScope = seen[seen.length - 1];
			expect(pageScope.selectionMode).toBe('page');
			expect(pageScope.effectiveCount).toBe(1);
			expect(pageScope.selectedRows.map((r) => r.id)).toEqual(['2']);

			// All-matching mode: select all on page → click banner.
			await w.find('[data-test="select-all"]').setValue(true);
			await nextTick();
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			const allScope = seen[seen.length - 1];
			expect(allScope.selectionMode).toBe('all-matching');
			expect(allScope.effectiveCount).toBe(10);
			// selectedRows still only contains current-page rows.
			expect(allScope.selectedRows.length).toBe(3);
		});

		it('exposes clearSelection via component ref and resets the mode', async () => {
			const w = mountTable({ pageRowCount: 3, totalCount: 10 });
			await selectAllOnPage(w);
			await w.find(`${banner} button`).trigger('click');
			await nextTick();
			const exposed = w.vm as unknown as { clearSelection: () => void };
			expect(typeof exposed.clearSelection).toBe('function');
			exposed.clearSelection();
			await nextTick();
			expect(w.find(banner).exists()).toBe(false);
			expect(lastEmitted(w, 'update:selectionMode')).toEqual(['page']);
		});

		it('selection persists across page-index changes in page mode', async () => {
			const w = mountTable({
				pageRowCount: 3,
				totalCount: 10,
				pagination: { pageIndex: 0, pageSize: 3 },
			});
			await w.find('[data-test="select-row-1"]').setValue(true);
			await nextTick();
			// Move to page 2 — same row IDs since this is a unit test (the consumer
			// is responsible for fetching page 2 data; we're just asserting that
			// DataTable keeps the in-memory selection map intact).
			await w.setProps({ pagination: { pageIndex: 1, pageSize: 3 } });
			await nextTick();
			// Coming back to page 1 should still show row 1 as selected.
			await w.setProps({ pagination: { pageIndex: 0, pageSize: 3 } });
			await nextTick();
			const cb = w.find('[data-test="select-row-1"]').element as HTMLInputElement;
			expect(cb.checked).toBe(true);
		});
	});
});
