import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { Clock, CaseSensitive, Flag } from '@lucide/vue';
import Sort from './Sort.vue';
import type { SortFieldOption, SortField } from './sort';
import {
	expectMinTargetSize,
	forEachViewport,
	expectNoHorizontalOverflow,
} from '../../../test-utils/playHelpers';

// ── Module-level fixtures ─────────────────────────────────────────────────────

const FIELDS: SortFieldOption[] = [
	{ name: 'Created At', icon: Clock },
	{ name: 'Name', icon: CaseSensitive },
	{ name: 'Priority', icon: Flag },
];

const INITIAL_SORT: SortField[] = [{ field: FIELDS[0], direction: 'ASC' }];

const TWO_FIELDS: SortField[] = [
	{ field: FIELDS[0], direction: 'ASC' },
	{ field: FIELDS[1], direction: 'DESC' },
];

const meta = {
	title: 'Patterns/Sort',
	component: Sort,
	tags: ['!autodocs'],
	argTypes: {
		availableFields: { control: false, description: 'Available fields that can be sorted.' },
		modelValue: { control: false, description: 'The current sort value (v-model).' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		availableFields: FIELDS,
		modelValue: undefined,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A popover-based multi-field sort control with drag-to-reorder, field selection, and ASC/DESC direction toggles.',
			},
		},
	},
	render: (args) => ({
		components: { Sort },
		setup: () => ({ args }),
		template: `<Sort v-bind="args" @update:modelValue="args['onUpdate:modelValue']" />`,
	}),
} satisfies Meta<typeof Sort>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ──────────────────────────────────────────────────────────────

export const Default: Story = {
	args: {
		modelValue: undefined,
	},
};

export const WithActiveSort: Story = {
	args: {
		modelValue: INITIAL_SORT,
	},
};

export const MultipleSortFields: Story = {
	args: {
		modelValue: TWO_FIELDS,
	},
};

// ── Interactive (hidden from autodocs, run as tests) ──────────────────────────

export const InteractiveOpensPopover: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: undefined },
	play: async ({ canvasElement }) => {
		// PopoverTrigger renders `as-child` so the `data-slot="sort-trigger"` lands
		// directly on the rendered button — no descendant selector needed.
		const trigger = canvasElement.querySelector('[data-slot="sort-trigger"]') as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);

		const addBtn = document.querySelector('[data-slot="sort-add"]') as HTMLElement;
		await expect(addBtn).toBeInTheDocument();
	},
};

export const InteractiveAddSortField: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: undefined },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="sort-trigger"]') as HTMLElement;
		await userEvent.click(trigger);

		const rowsBefore = document.querySelectorAll('[data-slot="sort-row"]');

		const addBtn = document.querySelector('[data-slot="sort-add"]') as HTMLElement;
		await expect(addBtn).toBeInTheDocument();
		await userEvent.click(addBtn);

		const rowsAfter = document.querySelectorAll('[data-slot="sort-row"]');
		await expect(rowsAfter.length).toBeGreaterThan(rowsBefore.length);
	},
};

export const InteractiveDeleteSortField: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: TWO_FIELDS },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="sort-trigger"]') as HTMLElement;
		await userEvent.click(trigger);

		const rowsBefore = document.querySelectorAll('[data-slot="sort-row"]');
		await expect(rowsBefore.length).toBe(2);

		const deleteBtn = document.querySelector('[data-slot="sort-delete"]') as HTMLElement;
		await userEvent.click(deleteBtn);

		const rowsAfter = document.querySelectorAll('[data-slot="sort-row"]');
		await expect(rowsAfter.length).toBeLessThan(2);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: INITIAL_SORT },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="sort-trigger"]') as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		expectMinTargetSize(trigger);
		await userEvent.click(trigger);

		const deleteBtn = document.querySelector('[data-slot="sort-delete"]') as HTMLElement;
		if (deleteBtn) expectMinTargetSize(deleteBtn);

		const addBtn = document.querySelector('[data-slot="sort-add"]') as HTMLElement;
		if (addBtn) expectMinTargetSize(addBtn);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: undefined },
	render: () => ({
		components: { Sort },
		setup: () => ({ FIELDS }),
		template: `<div data-test-root class="flex flex-wrap gap-2 p-2"><Sort :available-fields="FIELDS" /></div>`,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
		});
	},
};
