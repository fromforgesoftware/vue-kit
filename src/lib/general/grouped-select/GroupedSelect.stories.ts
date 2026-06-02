import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import GroupedSelect from './GroupedSelect.vue';
import GroupedSelectPanel from './GroupedSelectPanel.vue';
import type { GroupedItem, GroupedCategory } from './grouped-select';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

// ── Module-level fixtures ──────────────────────────────────────────────────

const CATEGORIES: GroupedCategory[] = [
	{ id: 'my-profile', label: 'My Profile', section: 'Account' },
	{ id: 'history', label: 'History', section: 'Analytics' },
	{ id: 'live-data', label: 'Live Data', section: 'Analytics' },
	{ id: 'group', label: 'Group', section: 'Dashboard' },
	{ id: 'employees', label: 'Employees', section: 'Data' },
	{ id: 'schedules', label: 'Schedules', section: 'Data' },
];

const ITEMS: GroupedItem[] = [
	{
		id: 'view-profile',
		label: 'View My Profile',
		description: 'View my dashboard and self-service',
		category: 'my-profile',
		displayOrder: 1,
	},
	{
		id: 'request-leave',
		label: 'Request Leave',
		description: 'Request leave for self',
		category: 'my-profile',
		displayOrder: 2,
	},
	{
		id: 'request-swap',
		label: 'Request Swap',
		description: 'Request shift swaps',
		category: 'my-profile',
		displayOrder: 3,
	},
	{
		id: 'view-history',
		label: 'View History',
		description: 'View historical data and reports',
		category: 'history',
	},
	{
		id: 'view-live',
		label: 'View Live Data',
		description: 'View real-time dashboard',
		category: 'live-data',
	},
	{
		id: 'view-group',
		label: 'View Group Dashboard',
		description: 'View group-level dashboard',
		category: 'group',
	},
	{
		id: 'view-employees',
		label: 'View Employees',
		description: 'View and manage employee profiles',
		category: 'employees',
	},
	{
		id: 'create-employee',
		label: 'Create Employee',
		description: 'Add new employee records',
		category: 'employees',
	},
	{
		id: 'edit-employee',
		label: 'Edit Employee',
		description: 'Edit existing employee data',
		category: 'employees',
	},
	{
		id: 'view-schedules',
		label: 'View Schedules',
		description: 'View schedule assignments',
		category: 'schedules',
	},
	{
		id: 'edit-schedules',
		label: 'Edit Schedules',
		description: 'Modify schedule assignments',
		category: 'schedules',
	},
];

const DEFAULT_SELECTION = [
	'view-profile',
	'request-leave',
	'request-swap',
	'view-history',
	'view-live',
];

const meta = {
	title: 'General/Grouped Select',
	component: GroupedSelect,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		items: { control: 'object', description: 'Selectable leaves grouped by their `category`.' },
		categories: {
			control: 'object',
			description: 'Top-level groupings, optionally clustered into `section`s.',
		},
		modelValue: { control: 'object', description: 'Currently selected item ids (`v-model`).' },
		placeholder: { control: 'text', description: 'Trigger placeholder when nothing is selected.' },
		searchPlaceholder: {
			control: 'text',
			description: 'Placeholder shown inside the popover search input.',
		},
		panelHeight: {
			control: 'text',
			description: 'Fixed height of the popover panel (CSS length).',
		},
		maxChips: {
			control: { type: 'number', min: 0, step: 1 },
			description: 'Max selected chips rendered before collapsing into `+N`.',
		},
		disabled: { control: 'boolean', description: 'Disable the trigger.' },
		class: { control: 'text', description: 'Extra classes on the trigger.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		items: ITEMS,
		categories: CATEGORIES,
		modelValue: DEFAULT_SELECTION,
		placeholder: 'Select permissions...',
		searchPlaceholder: 'Search...',
		panelHeight: '280px',
		maxChips: 3,
		disabled: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Trigger + popover for selecting many items grouped by category. Selected entries collapse into chips with an overflow counter; the panel supports search and section-grouped lists.',
			},
		},
	},
	render: (args) => ({
		components: { GroupedSelect },
		setup: () => ({ args }),
		template: `
      <GroupedSelect
        v-bind="args"
        @update:model-value="args['onUpdate:modelValue']"
      />
    `,
	}),
} satisfies Meta<typeof GroupedSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Empty: Story = {
	args: { modelValue: [] },
	parameters: {
		docs: { description: { story: 'No selection — placeholder is shown.' } },
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'Disabled trigger blocks pointer + keyboard interaction.' } },
	},
};

export const StandalonePanel: Story = {
	parameters: {
		docs: {
			description: {
				story: 'The same panel without the popover, e.g. inside a settings page or Drawer.',
			},
		},
	},
	render: (args) => ({
		components: { GroupedSelectPanel },
		setup: () => ({ args }),
		template: `
      <GroupedSelectPanel
        :items="args.items"
        :categories="args.categories"
        :model-value="args.modelValue"
        :search-placeholder="args.searchPlaceholder"
        :panel-height="args.panelHeight"
        @update:model-value="args['onUpdate:modelValue']"
      />
    `,
	}),
};

// ── Interactive (Pattern C: Composite / Portal) ─────────────────────────────

export const InteractiveOpensViaTrigger: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await userEvent.click(trigger);
		// Popover content is teleported to document.body by Reka.
		const body = inBody();
		const search = await body.findByPlaceholderText('Search...');
		await expect(search).toBeInTheDocument();
	},
};

export const InteractiveClosesOnEscape: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{Escape}');
		// Reka Presence animates the exit — assert via aria-expanded on the trigger
		// rather than DOM removal, which would race the animation.
		await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	},
};

export const InteractiveKeyboardNav: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		await expect(trigger).toHaveFocus();
		// Activate via keyboard.
		await userEvent.keyboard('{Enter}');
		const body = inBody();
		const search = await body.findByPlaceholderText('Search...');
		await expect(search).toBeInTheDocument();
		// Type to filter the panel.
		await userEvent.type(search, 'profile');
		await expect((search as HTMLInputElement).value).toBe('profile');
	},
};

export const InteractiveFocusTrapAndReturn: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		await userEvent.click(trigger);
		const body = inBody();
		await body.findByPlaceholderText('Search...');
		// Close — Reka returns focus to the trigger.
		await userEvent.keyboard('{Escape}');
		await new Promise((r) => setTimeout(r, 150));
		await expect(trigger).toHaveFocus();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Trigger fills its container and stays within ≥ 24×24 target size at all viewports.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.firstElementChild as HTMLElement;
			await expect(root).toBeVisible();
			expectNoHorizontalOverflow(root);
			const trigger = canvasElement.querySelector('button') as HTMLElement;
			await expect(trigger).toBeInTheDocument();
			expectMinTargetSize(trigger, 24);
		});
	},
};
