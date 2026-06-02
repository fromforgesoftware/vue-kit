import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import {
	CircleDot,
	CircleDashed,
	Circle,
	CircleDotDashed,
	CircleCheck,
	Users,
	Tag,
	Heading1,
	Clock,
	CalendarDays,
} from '@lucide/vue';
import FilterBar from './FilterBar.vue';
import type { ColumnConfig, FiltersState } from './filter-bar';
import { defaultDateRangePresets } from '../../dates/date-range-picker/date-range-picker';
import {
	inBody,
	expectMinTargetSize,
	forEachViewport,
	expectNoHorizontalOverflow,
} from '../../../test-utils/playHelpers';

// ── Module-level fixtures ─────────────────────────────────────────────────────

const COLUMNS: ColumnConfig[] = [
	{
		id: 'title',
		type: 'text',
		displayName: 'Title',
		icon: Heading1,
	},
	{
		id: 'status',
		type: 'option',
		displayName: 'Status',
		icon: CircleDotDashed,
		options: [
			{ value: 'backlog', label: 'Backlog', icon: CircleDashed },
			{ value: 'todo', label: 'Todo', icon: Circle },
			{ value: 'in_progress', label: 'In Progress', icon: CircleDot },
			{ value: 'done', label: 'Done', icon: CircleCheck },
		],
	},
	{
		id: 'assignee',
		type: 'option',
		displayName: 'Assignee',
		icon: Users,
		options: [
			{ value: 'john', label: 'John Smith' },
			{ value: 'jane', label: 'Jane Doe' },
			{ value: 'bob', label: 'Bob Wilson' },
		],
	},
	{
		id: 'labels',
		type: 'multiOption',
		displayName: 'Labels',
		icon: Tag,
		options: [
			{ value: 'bug', label: 'Bug' },
			{ value: 'feature', label: 'Feature' },
			{ value: 'enhancement', label: 'Enhancement' },
			{ value: 'documentation', label: 'Documentation' },
		],
	},
	{
		id: 'estimatedHours',
		type: 'number',
		displayName: 'Estimated hours',
		icon: Clock,
	},
	{
		id: 'startDate',
		type: 'date',
		displayName: 'Start Date',
		icon: CalendarDays,
	},
	{
		id: 'dateRange',
		type: 'daterange',
		displayName: 'Date Range',
		icon: CalendarDays,
	},
];

const ACTIVE_FILTERS: FiltersState = [
	{ columnId: 'status', type: 'option', operator: 'is any of', values: ['backlog', 'todo'] },
];

const IS_EMPTY_FILTERS: FiltersState = [
	{ columnId: 'title', type: 'text', operator: 'is empty', values: [] },
	{ columnId: 'estimatedHours', type: 'number', operator: 'is', values: ['8'] },
];

const NUMBER_FILTERS: FiltersState = [
	{ columnId: 'estimatedHours', type: 'number', operator: 'is greater than', values: ['4'] },
];

const meta = {
	title: 'Patterns/FilterBar',
	component: FilterBar,
	tags: ['!autodocs'],
	argTypes: {
		columns: { control: false, description: 'Column configuration for available filters.' },
		modelValue: { control: false, description: 'Active filters (v-model).' },
		facets: { control: false, description: 'Faceted counts per column value.' },
		renderAs: {
			control: 'select',
			options: ['all', 'trigger', 'chips'],
			description: 'Render mode: all (trigger + chips), trigger only, or chips only.',
		},
		variant: {
			control: 'select',
			options: ['default', 'panel'],
			description: 'Visual variant: default = inline row; panel = header with chips below.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onClear: { action: 'clear' },
	},
	args: {
		columns: COLUMNS,
		modelValue: [],
		renderAs: 'all',
		variant: 'default',
		'onUpdate:modelValue': fn(),
		onClear: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'An inline filter bar with a dropdown trigger to add filters and chip-based active filter display. Supports text, numeric, option, multi-option, date, and date-range column types.',
			},
		},
	},
	render: (args) => ({
		components: { FilterBar },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-4xl">
        <FilterBar v-bind="args" @update:modelValue="args['onUpdate:modelValue']" @clear="args.onClear" />
      </div>
    `,
	}),
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ──────────────────────────────────────────────────────────────

export const Default: Story = {
	args: { modelValue: [] },
};

export const WithActiveFilters: Story = {
	args: { modelValue: ACTIVE_FILTERS },
};

export const PanelVariant: Story = {
	args: { variant: 'panel', modelValue: [] },
	render: (args) => ({
		components: { FilterBar },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-96 border border-border rounded-lg overflow-hidden">
        <FilterBar v-bind="args" @update:modelValue="args['onUpdate:modelValue']" @clear="args.onClear">
          <template #header>
            <span class="text-sm font-semibold">Inbox</span>
          </template>
        </FilterBar>
        <div class="p-4 text-sm text-muted-foreground">Content goes here.</div>
      </div>
    `,
	}),
};

// Date-range columns can carry an optional preset list. When present the
// picker renders preset shortcuts (Today / Last 7 / This Year / …) alongside
// the calendar so common ranges are one click instead of two date selections.
export const WithDateRangePresets: Story = {
	args: {
		columns: [
			...COLUMNS.filter((c) => c.id !== 'dateRange'),
			{
				id: 'dateRange',
				type: 'daterange',
				displayName: 'Date Range',
				icon: CalendarDays,
				presets: defaultDateRangePresets,
			},
		],
		modelValue: [],
	},
};

export const PanelWithFilters: Story = {
	args: { variant: 'panel', modelValue: ACTIVE_FILTERS },
	render: (args) => ({
		components: { FilterBar },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-96 border border-border rounded-lg overflow-hidden">
        <FilterBar v-bind="args" @update:modelValue="args['onUpdate:modelValue']" @clear="args.onClear">
          <template #header>
            <span class="text-sm font-semibold">Inbox</span>
          </template>
        </FilterBar>
        <div class="p-4 text-sm text-muted-foreground">Filtered content area.</div>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ──────────────────────────

export const InteractiveOpensFilterMenu: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: [] },
	parameters: {
		// The filter dropdown intentionally hosts a free-form search input
		// alongside menuitems. Wrapping the input in role="group" keeps direct
		// children of role="menu" valid, but axe still walks deeper and flags
		// the underlying <input>. This is a known false-positive interaction
		// between rich filter dropdowns and the menu role; the menu remains
		// keyboard-operable and the input is independently labelled.
		a11y: {
			config: { rules: [{ id: 'aria-required-children', enabled: false }] },
		},
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="filter-bar-trigger"]') as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		expectMinTargetSize(trigger);
		await userEvent.click(trigger);

		const body = inBody();
		const menu = body.getByRole('menu');
		await expect(menu).toBeInTheDocument();
	},
};

export const InteractiveClearFilter: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: ACTIVE_FILTERS },
	play: async ({ args, canvasElement }) => {
		const chip = canvasElement.querySelector('[data-slot="filter-bar-chip"]') as HTMLElement;
		await expect(chip).toBeInTheDocument();

		const removeBtn = chip.querySelector('[aria-label="Remove filter"]') as HTMLElement;
		await expect(removeBtn).toBeInTheDocument();
		await userEvent.click(removeBtn);

		await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith([]);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: ACTIVE_FILTERS },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="filter-bar-trigger"]') as HTMLElement;
		expectMinTargetSize(trigger);

		const chip = canvasElement.querySelector('[data-slot="filter-bar-chip"]') as HTMLElement;
		if (chip) expectMinTargetSize(chip);
	},
};

// Verifies the daterange `presets` prop on ColumnConfig actually wires
// through — the trigger menu's daterange submenu should render the preset
// list alongside the calendar when set.
export const InteractiveDateRangePresets: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		columns: [
			{
				id: 'dateRange',
				type: 'daterange',
				displayName: 'Date Range',
				icon: CalendarDays,
				presets: defaultDateRangePresets,
			},
		],
		modelValue: [],
	},
	parameters: {
		a11y: {
			config: { rules: [{ id: 'aria-required-children', enabled: false }] },
		},
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="filter-bar-trigger"]') as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);

		// Expand the daterange column submenu — its label is the displayName.
		const body = inBody();
		const subTrigger = await body.findByText('Date Range');
		await userEvent.hover(subTrigger);

		// Preset shortcuts render alongside the RangeCalendar inside the
		// submenu — they live in the body portal, not in canvasElement.
		const presetItems = document.querySelectorAll('[data-slot="date-range-picker-preset-item"]');
		await expect(presetItems.length).toBeGreaterThan(0);
	},
};

export const WithNumberFilter: Story = {
	args: { modelValue: NUMBER_FILTERS },
};

export const IsEmptyOperator: Story = {
	args: { modelValue: IS_EMPTY_FILTERS },
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: ACTIVE_FILTERS },
	render: (args) => ({
		components: { FilterBar },
		setup: () => ({ args }),
		template: `
      <div data-test-root class="w-full max-w-4xl">
        <FilterBar v-bind="args" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
		});
	},
};
