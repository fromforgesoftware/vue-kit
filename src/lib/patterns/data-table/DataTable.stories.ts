import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, computed, h } from 'vue';
import { expect, userEvent } from 'storybook/test';
import { type ColumnDef, type PaginationState, type SortingState } from '@tanstack/vue-table';
import { Plus } from '@lucide/vue';
import DataTable from './DataTable.vue';
import type { DataTableDataSource } from './data-table.js';
import type { ColumnConfig, FiltersState } from '../filter-bar/filter-bar.js';
import Checkbox from '../../form/checkbox/Checkbox.vue';
import Button from '../../general/button/Button.vue';
import Icon from '../../general/icon/Icon.vue';
import EmptyState from '../../general/empty-state/EmptyState.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

type Item = {
	id: string;
	name: string;
	email: string;
	location: string;
	flag: string;
	status: 'Active' | 'Inactive' | 'Pending';
	balance: number;
	department: string;
	role: string;
	joinDate: string;
	lastActive: string;
	performance: string;
	note: string;
};

const MOCK_DATA_SHORT: Item[] = [
	{
		id: '1',
		name: 'Alex Thompson',
		email: 'a.tompson@company.com',
		location: 'San Francisco, US',
		flag: '\u{1F1FA}\u{1F1F8}',
		status: 'Inactive',
		balance: 1750,
		department: 'Engineering',
		role: 'Senior Developer',
		joinDate: '2023-03-15',
		lastActive: '2025-01-06',
		performance: 'Excellent',
		note: 'Key team member in our San Francisco office.',
	},
	{
		id: '2',
		name: 'Sarah Chen',
		email: 'sarah.c@company.com',
		location: 'Singapore',
		flag: '\u{1F1F8}\u{1F1EC}',
		status: 'Active',
		balance: 600,
		department: 'Product',
		role: 'Product Manager',
		joinDate: '2023-06-22',
		lastActive: '2025-01-11',
		performance: 'Outstanding',
		note: 'Demonstrates exceptional leadership.',
	},
	{
		id: '3',
		name: 'James Wilson',
		email: 'j.wilson@company.com',
		location: 'London, UK',
		flag: '\u{1F1EC}\u{1F1E7}',
		status: 'Inactive',
		balance: 650,
		department: 'Marketing',
		role: 'Marketing Director',
		joinDate: '2023-09-01',
		lastActive: '2024-12-15',
		performance: 'Good',
		note: 'Effective in managing campaigns.',
	},
	{
		id: '4',
		name: 'Maria Garcia',
		email: 'm.garcia@company.com',
		location: 'Madrid, Spain',
		flag: '\u{1F1EA}\u{1F1F8}',
		status: 'Active',
		balance: 0,
		department: 'Design',
		role: 'UI/UX Designer',
		joinDate: '2024-01-10',
		lastActive: '2025-01-10',
		performance: 'Very Good',
		note: 'Collaborating with development team.',
	},
	{
		id: '5',
		name: 'Lars Nielsen',
		email: 'l.nielsen@company.com',
		location: 'Stockholm, SE',
		flag: '\u{1F1F8}\u{1F1EA}',
		status: 'Active',
		balance: 1000,
		department: 'Engineering',
		role: 'Frontend Developer',
		joinDate: '2023-11-15',
		lastActive: '2025-01-09',
		performance: 'Excellent',
		note: 'Leading frontend development.',
	},
];

const MOCK_DATA_FULL: Item[] = [
	...MOCK_DATA_SHORT,
	{
		id: '6',
		name: 'Eva Kowalski',
		email: 'e.kowalski@company.com',
		location: 'Seoul, KR',
		flag: '\u{1F1F0}\u{1F1F7}',
		status: 'Active',
		balance: 920,
		department: 'Sales',
		role: 'Sales Manager',
		joinDate: '2023-07-25',
		lastActive: '2025-01-08',
		performance: 'Good',
		note: 'Successfully expanded our client base in the APAC region.',
	},
	{
		id: '7',
		name: 'Emma Laurent',
		email: 'e.laurent@company.com',
		location: 'Berlin, DE',
		flag: '\u{1F1E9}\u{1F1EA}',
		status: 'Active',
		balance: 1200,
		department: 'HR',
		role: 'HR Manager',
		joinDate: '2023-10-12',
		lastActive: '2025-01-07',
		performance: 'Very Good',
		note: 'Implementing new employee wellness programs.',
	},
	{
		id: '8',
		name: 'Marco Rossi',
		email: 'm.rossi@company.com',
		location: 'Madrid, Spain',
		flag: '\u{1F1EA}\u{1F1F8}',
		status: 'Active',
		balance: 2100,
		department: 'Finance',
		role: 'Financial Analyst',
		joinDate: '2023-08-20',
		lastActive: '2025-01-05',
		performance: 'Excellent',
		note: 'Providing valuable financial insights to support business growth.',
	},
	{
		id: '9',
		name: 'Yuki Tanaka',
		email: 'y.tanaka@company.com',
		location: 'Warsaw, PL',
		flag: '\u{1F1F5}\u{1F1F1}',
		status: 'Active',
		balance: 450,
		department: 'IT',
		role: 'IT Specialist',
		joinDate: '2023-05-15',
		lastActive: '2025-01-04',
		performance: 'Good',
		note: 'Effective in resolving technical issues and improving system efficiency.',
	},
	{
		id: '10',
		name: 'Mike Allison',
		email: 'm.allison@company.com',
		location: 'San Francisco, US',
		flag: '\u{1F1FA}\u{1F1F8}',
		status: 'Inactive',
		balance: 1250,
		department: 'Engineering',
		role: 'Backend Developer',
		joinDate: '2023-04-10',
		lastActive: '2024-12-20',
		performance: 'Very Good',
		note: 'Key contributor to our backend infrastructure development.',
	},
	{
		id: '11',
		name: 'Anna Visconti',
		email: 'anna.visconti@company.com',
		location: 'Rome, IT',
		flag: '\u{1F1EE}\u{1F1F9}',
		status: 'Active',
		balance: 0,
		department: 'Marketing',
		role: 'Marketing Specialist',
		joinDate: '2024-02-20',
		lastActive: '2025-01-03',
		performance: 'Good',
		note: 'Supporting marketing campaigns across European markets.',
	},
	{
		id: '12',
		name: 'David Kim',
		email: 'd.kim@company.com',
		location: 'Paris, FR',
		flag: '\u{1F1EB}\u{1F1F7}',
		status: 'Active',
		balance: 890,
		department: 'Sales',
		role: 'Sales Representative',
		joinDate: '2023-06-15',
		lastActive: '2025-01-02',
		performance: 'Very Good',
		note: 'Consistently meeting sales targets.',
	},
	{
		id: '13',
		name: 'Lucia Sorna',
		email: 'lucia.sorna@company.com',
		location: 'Copenhagen, DK',
		flag: '\u{1F1E9}\u{1F1F0}',
		status: 'Inactive',
		balance: 1890,
		department: 'Finance',
		role: 'Financial Manager',
		joinDate: '2023-03-20',
		lastActive: '2024-12-18',
		performance: 'Excellent',
		note: 'Providing strategic financial guidance.',
	},
	{
		id: '14',
		name: 'Samuel Carteron',
		email: 'sa.carteron@company.com',
		location: 'San Francisco, US',
		flag: '\u{1F1FA}\u{1F1F8}',
		status: 'Inactive',
		balance: 1250,
		department: 'Engineering',
		role: 'DevOps Engineer',
		joinDate: '2023-04-25',
		lastActive: '2024-12-15',
		performance: 'Very Good',
		note: 'Leading our cloud infrastructure optimization project.',
	},
	{
		id: '15',
		name: 'Alex Allan',
		email: 'alex.allan@company.com',
		location: 'S\u00e3o Paulo, BR',
		flag: '\u{1F1E7}\u{1F1F7}',
		status: 'Active',
		balance: 2100,
		department: 'Sales',
		role: 'Sales Director',
		joinDate: '2023-07-10',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Outstanding performance in Latin American markets.',
	},
	{
		id: '16',
		name: 'Olivia Brown',
		email: 'o.brown@company.com',
		location: 'Sydney, AU',
		flag: '\u{1F1E6}\u{1F1FA}',
		status: 'Active',
		balance: 1600,
		department: 'Marketing',
		role: 'Marketing Coordinator',
		joinDate: '2023-09-15',
		lastActive: '2025-01-01',
		performance: 'Good',
		note: 'Supporting marketing campaigns across APAC markets.',
	},
	{
		id: '17',
		name: 'Hiroshi Yamamoto',
		email: 'h.yamamoto@company.com',
		location: 'Osaka, JP',
		flag: '\u{1F1EF}\u{1F1F5}',
		status: 'Active',
		balance: 2200,
		department: 'Engineering',
		role: 'Software Engineer',
		joinDate: '2023-10-25',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Key developer for our Asian market localization project.',
	},
	{
		id: '18',
		name: 'Sophie Dubois',
		email: 's.dubois@company.com',
		location: 'Montreal, CA',
		flag: '\u{1F1E8}\u{1F1E6}',
		status: 'Inactive',
		balance: 950,
		department: 'HR',
		role: 'HR Specialist',
		joinDate: '2023-05-20',
		lastActive: '2024-12-12',
		performance: 'Very Good',
		note: 'Supporting employee onboarding and training programs.',
	},
	{
		id: '19',
		name: 'Diego Mendoza',
		email: 'd.mendoza@company.com',
		location: 'Mexico City, MX',
		flag: '\u{1F1F2}\u{1F1FD}',
		status: 'Active',
		balance: 1800,
		department: 'Sales',
		role: 'Sales Representative',
		joinDate: '2023-08-15',
		lastActive: '2025-01-01',
		performance: 'Good',
		note: 'Consistently meeting sales targets in Latin American markets.',
	},
	{
		id: '20',
		name: 'Lena M\u00fcller',
		email: 'l.mueller@company.com',
		location: 'Vienna, AT',
		flag: '\u{1F1E6}\u{1F1F9}',
		status: 'Active',
		balance: 1350,
		department: 'Marketing',
		role: 'Marketing Specialist',
		joinDate: '2023-11-10',
		lastActive: '2025-01-01',
		performance: 'Very Good',
		note: 'Supporting marketing campaigns across European markets.',
	},
	{
		id: '21',
		name: 'Raj Patel',
		email: 'r.patel@company.com',
		location: 'Mumbai, IN',
		flag: '\u{1F1EE}\u{1F1F3}',
		status: 'Active',
		balance: 2500,
		department: 'Engineering',
		role: 'Software Engineer',
		joinDate: '2023-12-15',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Key developer for our Indian market localization project.',
	},
	{
		id: '22',
		name: 'Astrid Andersen',
		email: 'a.andersen@company.com',
		location: 'Oslo, NO',
		flag: '\u{1F1F3}\u{1F1F4}',
		status: 'Inactive',
		balance: 1100,
		department: 'Finance',
		role: 'Financial Analyst',
		joinDate: '2023-06-20',
		lastActive: '2024-12-10',
		performance: 'Good',
		note: 'Providing financial analysis and insights.',
	},
	{
		id: '23',
		name: 'Fatima Al-Sayed',
		email: 'f.alsayed@company.com',
		location: 'Cairo, EG',
		flag: '\u{1F1EA}\u{1F1EC}',
		status: 'Active',
		balance: 1950,
		department: 'Sales',
		role: 'Sales Manager',
		joinDate: '2023-09-10',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Outstanding performance in Middle Eastern markets.',
	},
	{
		id: '24',
		name: 'Javier Fern\u00e1ndez',
		email: 'j.fernandez@company.com',
		location: 'Buenos Aires, AR',
		flag: '\u{1F1E6}\u{1F1F7}',
		status: 'Active',
		balance: 1700,
		department: 'Marketing',
		role: 'Marketing Coordinator',
		joinDate: '2023-10-20',
		lastActive: '2025-01-01',
		performance: 'Good',
		note: 'Supporting marketing campaigns across Latin American markets.',
	},
	{
		id: '25',
		name: 'Zoe Williams',
		email: 'z.williams@company.com',
		location: 'Auckland, NZ',
		flag: '\u{1F1F3}\u{1F1FF}',
		status: 'Active',
		balance: 2300,
		department: 'Engineering',
		role: 'Software Engineer',
		joinDate: '2023-11-25',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Key developer for our Australian market localization project.',
	},
	{
		id: '26',
		name: 'Nikolai Petrov',
		email: 'n.petrov@company.com',
		location: 'Moscow, RU',
		flag: '\u{1F1F7}\u{1F1FA}',
		status: 'Active',
		balance: 3100,
		department: 'Sales',
		role: 'Sales Director',
		joinDate: '2023-12-10',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Outstanding performance in European markets.',
	},
	{
		id: '27',
		name: 'Isabella Rossi',
		email: 'i.rossi@company.com',
		location: 'Milan, IT',
		flag: '\u{1F1EE}\u{1F1F9}',
		status: 'Inactive',
		balance: 1850,
		department: 'Finance',
		role: 'Financial Manager',
		joinDate: '2023-07-20',
		lastActive: '2024-12-08',
		performance: 'Very Good',
		note: 'Providing strategic financial guidance.',
	},
	{
		id: '28',
		name: 'Cheng Wei',
		email: 'c.wei@company.com',
		location: 'Shanghai, CN',
		flag: '\u{1F1E8}\u{1F1F3}',
		status: 'Active',
		balance: 2700,
		department: 'Engineering',
		role: 'Software Engineer',
		joinDate: '2023-11-15',
		lastActive: '2025-01-01',
		performance: 'Excellent',
		note: 'Key developer for our Asian market localization project.',
	},
	{
		id: '29',
		name: 'Licia Patel',
		email: 'l.patel@company.com',
		location: 'Nairobi, KE',
		flag: '\u{1F1F0}\u{1F1EA}',
		status: 'Active',
		balance: 1400,
		department: 'Sales',
		role: 'Sales Representative',
		joinDate: '2023-10-15',
		lastActive: '2025-01-01',
		performance: 'Good',
		note: 'Successfully expanding our presence in East African markets.',
	},
	{
		id: '30',
		name: 'Mateo Gonzalez',
		email: 'm.gonzalez@company.com',
		location: 'Bogot\u00e1, CO',
		flag: '\u{1F1E8}\u{1F1F4}',
		status: 'Active',
		balance: 2050,
		department: 'Marketing',
		role: 'Marketing Specialist',
		joinDate: '2023-11-20',
		lastActive: '2025-01-01',
		performance: 'Very Good',
		note: 'Leading digital marketing initiatives across Latin America.',
	},
];

function createColumns(): ColumnDef<Item>[] {
	return [
		{
			id: 'select',
			header: ({ table }) => {
				return h(Checkbox, {
					class: 'flex',
					checked:
						table.getIsAllRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
					'onUpdate:checked': (value: boolean | 'indeterminate') =>
						table.toggleAllRowsSelected(!!value),
					ariaLabel: 'Select all',
				});
			},
			cell: ({ row }) => {
				return h(Checkbox, {
					class: 'flex',
					checked: row.getIsSelected(),
					'onUpdate:checked': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
					ariaLabel: 'Select row',
				});
			},
			size: 28,
			enableSorting: false,
			enableHiding: false,
		},
		{
			header: 'Name',
			accessorKey: 'name',
			cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name') as string),
		},
		{
			header: 'Email',
			accessorKey: 'email',
			size: 200,
		},
		{
			header: 'Location',
			accessorKey: 'location',
			cell: ({ row }) =>
				h('div', {}, [
					h('span', { class: 'text-lg leading-none' }, row.original.flag),
					` ${row.getValue('location')}`,
				]),
			size: 180,
		},
		{
			header: 'Balance',
			accessorKey: 'balance',
			cell: ({ row }) => {
				const amount = parseFloat(row.getValue('balance'));
				const formatted = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
				}).format(amount);
				return h('div', { class: 'text-right' }, formatted);
			},
			size: 120,
		},
	];
}

const meta: Meta = {
	title: 'Patterns/Data Table',
	component: DataTable as unknown as Meta['component'],
	tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		components: { DataTable, Button },
		setup() {
			const fullData = ref<Item[]>(MOCK_DATA_FULL);
			const pagination = ref<PaginationState>({
				pageIndex: 0,
				pageSize: 5,
			});
			const sorting = ref<SortingState>([{ id: 'name', desc: false }]);
			const columns = createColumns();

			const paginatedDataSource = computed<DataTableDataSource<Item>>(() => {
				const start = pagination.value.pageIndex * pagination.value.pageSize;
				const end = start + pagination.value.pageSize;
				return {
					data: fullData.value.slice(start, end),
					totalCount: fullData.value.length,
				};
			});

			const handlePaginationChange = (newPagination: PaginationState) => {
				pagination.value = newPagination;
			};

			return {
				paginatedDataSource,
				columns,
				pagination,
				sorting,
				handlePaginationChange,
			};
		},
		template: `
      <DataTable
        :data-source="paginatedDataSource"
        :columns="columns"
        :pagination="pagination"
        :sorting="sorting"
        @update:pagination="handlePaginationChange"
      >
        <template #selection-actions="{ selectedCount }">
          <Button
            variant="ghost"
            size="sm"
            class="text-background hover:bg-accent/20 hover:text-background"
          >
            Download ({{ selectedCount }})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="text-background hover:bg-accent/20 hover:text-background"
          >
            Archive
          </Button>
        </template>
      </DataTable>
    `,
	}),
};

export const Primary: Story = {
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({
				pageIndex: 0,
				pageSize: 5,
			});
			const sorting = ref<SortingState>([{ id: 'name', desc: false }]);

			return { columns, dataSource, pagination, sorting };
		},
		template: `
      <DataTable
        variant="primary"
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :sorting="sorting"
      />
    `,
	}),
};

export const Outline: Story = {
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({
				pageIndex: 0,
				pageSize: 5,
			});
			const sorting = ref<SortingState>([{ id: 'name', desc: false }]);

			return { columns, dataSource, pagination, sorting };
		},
		template: `
      <DataTable
        variant="outline"
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :sorting="sorting"
      />
    `,
	}),
};

// ── Card variant ───────────────────────────────────────────────────────
//
// Card-row layout. Renders consumer-supplied row templates (via the `#row`
// slot) instead of a `<table>` at every breakpoint. Filters, pagination,
// sorting, and column-visibility logic stay identical to the table variants
// — only the render shape changes. Pick this when each row carries
// multi-line content (notes, descriptions) or column alignment isn't useful.

export const Card: Story = {
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const fullData = ref<Item[]>(MOCK_DATA_FULL);
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			const sorting = ref<SortingState>([{ id: 'name', desc: false }]);

			const filterColumns: ColumnConfig[] = [
				{
					id: 'status',
					type: 'singleOption',
					displayName: 'Status',
					options: [
						{ value: 'Active', label: 'Active' },
						{ value: 'Inactive', label: 'Inactive' },
						{ value: 'Pending', label: 'Pending' },
					],
				},
			];
			const filters = ref<FiltersState>([]);

			const dataSource = computed<DataTableDataSource<Item>>(() => {
				const start = pagination.value.pageIndex * pagination.value.pageSize;
				const end = start + pagination.value.pageSize;
				return { data: fullData.value.slice(start, end), totalCount: fullData.value.length };
			});

			return { columns, dataSource, pagination, sorting, filterColumns, filters };
		},
		template: `
      <DataTable
        variant="card"
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :sorting="sorting"
        :filter-columns="filterColumns"
        :filters="filters"
        :show-column-visibility="false"
        @update:pagination="pagination = $event"
        @update:filters="filters = $event"
      >
        <template #row="{ row }">
          <div
            class="rounded-md border border-border bg-card p-3 flex items-start justify-between gap-3"
            :data-test="'card-row-' + row.id"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium">{{ row.name }}</span>
                <span class="text-xs text-muted-foreground">{{ row.role }}</span>
              </div>
              <p class="text-xs text-muted-foreground truncate">{{ row.note }}</p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :class="
                row.status === 'Active'
                  ? 'bg-success/10 text-success'
                  : row.status === 'Pending'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-muted text-muted-foreground'
              "
            >{{ row.status }}</span>
          </div>
        </template>
      </DataTable>
    `,
	}),
};

/**
 * `layout="fill"` makes the table claim its parent's full height. The toolbar
 * and pagination row stay pinned, and only the rows region scrolls. Use it
 * inside a height-constrained parent (dialog body, side panel) where the
 * filter bar and pagination must remain visible while the user scrolls a
 * long list. The surrounding box (`h-[480px]` here) simulates a dialog body.
 */
export const CardFillLayout: Story = {
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const fullData = ref<Item[]>(MOCK_DATA_FULL);
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 25 });
			const sorting = ref<SortingState>([{ id: 'name', desc: false }]);

			const filterColumns: ColumnConfig[] = [
				{
					id: 'status',
					type: 'singleOption',
					displayName: 'Status',
					options: [
						{ value: 'Active', label: 'Active' },
						{ value: 'Inactive', label: 'Inactive' },
						{ value: 'Pending', label: 'Pending' },
					],
				},
			];
			const filters = ref<FiltersState>([]);

			const dataSource = computed<DataTableDataSource<Item>>(() => ({
				data: fullData.value,
				totalCount: fullData.value.length,
			}));

			return { columns, dataSource, pagination, sorting, filterColumns, filters };
		},
		template: `
      <div class="h-120 w-full max-w-2xl flex flex-col rounded-lg border border-border p-4 bg-card overflow-hidden">
        <DataTable
          variant="card"
          layout="fill"
          :data-source="dataSource"
          :columns="columns"
          :pagination="pagination"
          :sorting="sorting"
          :filter-columns="filterColumns"
          :filters="filters"
          :show-column-visibility="false"
          @update:pagination="pagination = $event"
          @update:filters="filters = $event"
        >
          <template #row="{ row }">
            <div class="rounded-md border border-border bg-background p-3 flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ row.name }}</div>
                <div class="text-xs text-muted-foreground truncate">{{ row.email }}</div>
              </div>
              <span class="text-xs text-muted-foreground shrink-0">{{ row.role }}</span>
            </div>
          </template>
        </DataTable>
      </div>
    `,
	}),
};

export const Empty: Story = {
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: [],
				totalCount: 0,
			});

			return { columns, dataSource };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
      />
    `,
	}),
};

export const EmptyCustom: Story = {
	name: 'Empty (Custom Slot)',
	render: () => ({
		components: { DataTable, EmptyState, Button, Icon },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: [],
				totalCount: 0,
			});

			return { columns, dataSource, Plus };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
      >
        <template #empty>
          <EmptyState
            illustration="empty-datatable"
            title="No employees yet"
            description="Get started by adding your first employee to the system."
          >
            <Button size="default">
              <Icon :icon="Plus" size="sm" />
              Add employee
            </Button>
          </EmptyState>
        </template>
      </DataTable>
    `,
	}),
};

export const EmptyOutline: Story = {
	name: 'Empty (Outline)',
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: [],
				totalCount: 0,
			});

			return { columns, dataSource };
		},
		template: `
      <DataTable
        variant="outline"
        :data-source="dataSource"
        :columns="columns"
      />
    `,
	}),
};

export const WithToolbarActions: Story = {
	name: 'Toolbar with action buttons',
	render: () => ({
		components: { DataTable, Button, Icon },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			return { columns, dataSource, pagination, Plus };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        search-placeholder="Search employees..."
      >
        <template #toolbar-end>
          <Button size="sm">
            <Icon :icon="Plus" size="sm" />
            Create
          </Button>
        </template>
      </DataTable>
    `,
	}),
};

const FILTER_COLUMNS: ColumnConfig[] = [
	{ id: 'name', type: 'text', displayName: 'Name' },
	{
		id: 'status',
		type: 'singleOption',
		displayName: 'Status',
		options: [
			{ value: 'Active', label: 'Active' },
			{ value: 'Inactive', label: 'Inactive' },
			{ value: 'Pending', label: 'Pending' },
		],
	},
	{ id: 'balance', type: 'number', displayName: 'Balance' },
];

export const WithFilters: Story = {
	name: 'Toolbar with filters (chips)',
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			const filters = ref<FiltersState>([
				{ columnId: 'status', operator: 'is', values: ['Active'], type: 'singleOption' },
			]);
			function onFilters(next: FiltersState) {
				filters.value = next;
			}
			return { columns, dataSource, pagination, filters, FILTER_COLUMNS, onFilters };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :filter-columns="FILTER_COLUMNS"
        :filters="filters"
        @update:filters="onFilters"
      />
    `,
	}),
};

export const MinimalToolbar: Story = {
	name: 'Toolbar disabled',
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			return { columns, dataSource, pagination };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :show-toolbar="false"
      />
    `,
	}),
};

// ── Interactive tests ──────────────────────────────────────────────────

export const InteractiveSortColumn: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const sorting = ref<SortingState>([]);
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			function onSort(s: SortingState) {
				sorting.value = s;
			}
			return { columns, dataSource, sorting, pagination, onSort };
		},
		template: `
      <DataTable
        variant="outline"
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
        :sorting="sorting"
        @update:sorting="onSort"
      />
    `,
	}),
	play: async ({ canvasElement }) => {
		// The Name column header is sortable
		const heads = canvasElement.querySelectorAll('[data-slot="data-table-head"]');
		await expect(heads.length).toBeGreaterThan(0);
		let sortableHead: HTMLElement | null = null;
		for (const h of heads) {
			if (h.querySelector('[data-slot="data-table-sort"]')) {
				sortableHead = h as HTMLElement;
				break;
			}
		}
		await expect(sortableHead).not.toBeNull();
		await userEvent.click(sortableHead!);
		// After click, sort indicator should change — we just assert no error and slot remains
		await expect(sortableHead!.querySelector('[data-slot="data-table-sort"]')).toBeInTheDocument();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			return { columns, dataSource, pagination };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
      />
    `,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('button');
		await expect(buttons.length).toBeGreaterThan(0);
		for (const b of buttons) {
			const el = b as HTMLElement;
			const r = el.getBoundingClientRect();
			// Skip hidden buttons
			if (r.width === 0 && r.height === 0) continue;
			// Checkboxes paint a 16 px square inside a 24×24 hit area expanded via
			// a transparent ::before pseudo-element. `getBoundingClientRect()` does
			// not include pseudo-elements, so the bounds report 16×16 even though
			// the click target is ≥ 24×24 — skip them in this size assertion.
			if (el.dataset.slot === 'checkbox') continue;
			expectMinTargetSize(el, 24);
		}
	},
};

export const InteractiveSearchEmits: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const lastSearch = ref('');
			function onSearch(query: string) {
				lastSearch.value = query;
			}
			return { columns, dataSource, lastSearch, onSearch };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        search-placeholder="Search employees..."
        @search="onSearch"
      />
      <div data-testid="last-search">{{ lastSearch }}</div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector(
			'[data-slot="data-table-search-input"]',
		) as HTMLInputElement;
		await expect(input).not.toBeNull();
		await userEvent.type(input, 'alex');
		const out = canvasElement.querySelector('[data-testid="last-search"]') as HTMLElement;
		await expect(out.textContent).toBe('alex');
	},
};

export const InteractiveFilterChipsRender: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const filters = ref<FiltersState>([
				{ columnId: 'status', operator: 'is', values: ['Active'], type: 'singleOption' },
			]);
			return { columns, dataSource, filters, FILTER_COLUMNS };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :filter-columns="FILTER_COLUMNS"
        :filters="filters"
      />
    `,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="filter-bar-trigger"]');
		await expect(trigger).not.toBeNull();
		const chip = canvasElement.querySelector('[data-slot="filter-bar-chip"]');
		await expect(chip).not.toBeNull();
	},
};

export const InteractiveToolbarHidden: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			return { columns, dataSource };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :show-toolbar="false"
      />
    `,
	}),
	play: async ({ canvasElement }) => {
		const search = canvasElement.querySelector('[data-slot="data-table-search-input"]');
		await expect(search).toBeNull();
		const colsTrigger = canvasElement.querySelector('[data-slot="data-table-columns-trigger"]');
		await expect(colsTrigger).toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			return { columns, dataSource, pagination };
		},
		template: `
      <DataTable
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
      />
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="data-table"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await forEachViewport(async () => {
			// The data-table root contains an overflow-auto wrapper for the table.
			// Assert no overflow on the root container itself.
			expectNoHorizontalOverflow(root);
		});
	},
};

// ── Outline variant: same responsive contract as primary ──────────────
//
// Outline owns its own responsiveness via `meta.priority` columns + a sticky
// anchor column for horizontal scroll. This mirrors `InteractiveResponsive`
// for primary so we don't regress the mobile behaviour when refactoring the
// outline wrapper (a stray `overflow-hidden` between the scroll ancestor and
// the sticky cell would silently break `position: sticky`).
export const InteractiveOutlineResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			return { columns, dataSource, pagination };
		},
		template: `
      <DataTable
        variant="outline"
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
      />
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="data-table"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await forEachViewport(async () => {
			// The data-table root contains an overflow-auto wrapper for the table.
			// Assert no overflow on the root container itself, mirroring the
			// primary-variant responsive story.
			expectNoHorizontalOverflow(root);
		});
	},
};

export const InteractiveCardResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DataTable },
		setup() {
			const columns = createColumns();
			const dataSource = ref<DataTableDataSource<Item>>({
				data: MOCK_DATA_SHORT,
				totalCount: 5,
			});
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			return { columns, dataSource, pagination };
		},
		template: `
      <DataTable
        variant="card"
        :data-source="dataSource"
        :columns="columns"
        :pagination="pagination"
      >
        <template #row="{ row }">
          <div
            :data-test="'card-row-' + row.id"
            class="rounded-md border border-border bg-card p-3"
          >
            <span class="text-sm font-medium">{{ row.name }}</span>
          </div>
        </template>
      </DataTable>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="data-table"]') as HTMLElement;
		await expect(root).toBeInTheDocument();

		await forEachViewport(async () => {
			// Card variant must always render the row slot — never the table.
			const cards = canvasElement.querySelector('[data-slot="data-table-card-rows"]');
			const table = canvasElement.querySelector('table');
			await expect(cards).toBeInTheDocument();
			await expect(table).toBeNull();

			// Cards should be present at every width.
			const cardRows = canvasElement.querySelectorAll('[data-test^="card-row-"]');
			await expect(cardRows.length).toBe(MOCK_DATA_SHORT.length);

			// Mobile-first: no horizontal overflow at any viewport.
			expectNoHorizontalOverflow(root);
		});
	},
};

// ── Cross-page selection ─────────────────────────────────────────────────
//
// Demonstrates the Gmail-style banner: select every row on the current page,
// the strip offers to expand to every matching row across pages. The bulk
// action then resolves the IDs uniformly for both modes via
// `resolveSelectedIds()`. Consumers always call that — never `selectedRows`
// — when they need the full set.
export const CrossPageSelection: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Opt in via `fetchAllMatchingIds`. The banner appears once every page row is selected and `totalCount` exceeds the page size. The bulk-action handler reads `resolveSelectedIds()` from the slot scope so it works the same in `page` and `all-matching` modes.',
			},
		},
	},
	render: () => ({
		components: { DataTable, Button },
		setup() {
			const fullData = ref<Item[]>(MOCK_DATA_FULL);
			const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
			const columns = createColumns();
			const lastBulkResult = ref<string>('');

			const paginatedDataSource = computed<DataTableDataSource<Item>>(() => {
				const start = pagination.value.pageIndex * pagination.value.pageSize;
				const end = start + pagination.value.pageSize;
				return {
					data: fullData.value.slice(start, end),
					totalCount: fullData.value.length,
				};
			});

			// Simulate a real list-endpoint loop: 500 ms delay so the spinner
			// state inside the consumer's bulk button is observable.
			const fetchAllMatchingIds = async (): Promise<string[]> => {
				await new Promise((resolve) => setTimeout(resolve, 500));
				return fullData.value.map((r) => r.id);
			};

			const getRowId = (row: Item): string => row.id;

			return {
				paginatedDataSource,
				columns,
				pagination,
				fetchAllMatchingIds,
				getRowId,
				lastBulkResult,
			};
		},
		template: `
      <div class="space-y-3">
        <DataTable
          :data-source="paginatedDataSource"
          :columns="columns"
          :pagination="pagination"
          :get-row-id="getRowId"
          :fetch-all-matching-ids="fetchAllMatchingIds"
          @update:pagination="pagination = $event"
        >
          <template #selection-actions="{ effectiveCount, resolveSelectedIds }">
            <Button
              data-test="bulk-archive"
              variant="ghost"
              size="sm"
              class="text-background hover:bg-accent/20 hover:text-background"
              @click="async () => { lastBulkResult = (await resolveSelectedIds()).length + ' archived' }"
            >
              Archive ({{ effectiveCount }})
            </Button>
          </template>
        </DataTable>
        <p data-test="bulk-result" class="text-xs text-muted-foreground">{{ lastBulkResult }}</p>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="data-table"]') as HTMLElement;
		await expect(root).toBeInTheDocument();

		// Select every row on the current page.
		const headerCheckbox = root.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
		await userEvent.click(headerCheckbox);

		// Banner shows the page-full message + the "Select all matching" CTA.
		const banner = canvasElement.querySelector(
			'[data-slot="data-table-select-all-banner"]',
		) as HTMLElement;
		await expect(banner).toBeInTheDocument();
		await expect(banner.textContent).toContain('5');
		await expect(banner.textContent?.toLowerCase()).toContain('matching');

		// Click the banner's link → switches to all-matching mode.
		const cta = banner.querySelector('button') as HTMLButtonElement;
		await userEvent.click(cta);

		const bannerAfter = canvasElement.querySelector(
			'[data-slot="data-table-select-all-banner"]',
		) as HTMLElement;
		await expect(bannerAfter.textContent?.toLowerCase()).toContain('matching items are selected');
	},
};
