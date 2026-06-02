import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import SplitButton from './SplitButton.vue';
import type { SplitButtonAction } from './split-button.js';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'ghost'] as const;
const ALL_SIZES = ['xs', 'sm', 'default', 'lg'] as const;

const mergeActions: SplitButtonAction[] = [
	{
		value: 'merge',
		label: 'Merge pull request',
		description:
			'All commits from this branch will be added to the base branch via a merge commit.',
	},
	{
		value: 'squash',
		label: 'Squash and merge',
		description:
			'The 6 commits from this branch will be combined into one commit in the base branch.',
	},
	{
		value: 'rebase',
		label: 'Rebase and merge',
		description: 'The 6 commits from this branch will be rebased and added to the base branch.',
	},
];

const meta = {
	title: 'General/Split Button',
	component: SplitButton,
	tags: ['!autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Primary action plus a dropdown menu of secondary actions. Click the main button to fire `click`; click the chevron (or press ArrowDown on the main button) to open the menu. Built on Button + DropdownMenu.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Applies to both the primary button and the dropdown trigger.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density tier.',
		},
		align: {
			control: 'select',
			options: ['start', 'center', 'end'],
			description: 'Dropdown alignment relative to the trigger.',
		},
		disabled: { control: 'boolean' },
		loading: { control: 'boolean' },
		triggerAriaLabel: { control: 'text' },
		onClick: { action: 'click' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		actions: mergeActions,
		variant: 'default',
		size: 'default',
		align: 'end',
		disabled: false,
		loading: false,
		triggerAriaLabel: 'More merge options',
		onClick: fn(),
		'onUpdate:modelValue': fn(),
	},
	render: (args) => ({
		components: { SplitButton },
		setup() {
			const selected = ref('merge');
			return { args, selected };
		},
		template: `
      <SplitButton
        v-bind="args"
        v-model="selected"
        @click="args.onClick"
        @update:modelValue="args['onUpdate:modelValue']"
      />
    `,
	}),
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: { description: { story: 'All standard Button variants apply to both halves.' } },
	},
	render: () => ({
		components: { SplitButton },
		setup() {
			const selected = ref('merge');
			return { ALL_VARIANTS, mergeActions, selected };
		},
		template: `
      <div class="flex flex-wrap gap-3">
        <SplitButton v-for="v in ALL_VARIANTS" :key="v" :variant="v" :actions="mergeActions" v-model="selected" trigger-aria-label="More options" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Density tiers — same as Button.' } },
	},
	render: () => ({
		components: { SplitButton },
		setup() {
			const selected = ref('merge');
			return { ALL_SIZES, mergeActions, selected };
		},
		template: `
      <div class="flex flex-wrap items-center gap-3">
        <SplitButton v-for="s in ALL_SIZES" :key="s" :size="s" :actions="mergeActions" v-model="selected" trigger-aria-label="More options" />
      </div>
    `,
	}),
};

export const Loading: Story = {
	args: { loading: true },
	parameters: {
		docs: {
			description: {
				story:
					'Loading state on the primary button. The chevron remains active so the user can switch action mid-flight.',
			},
		},
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: { docs: { description: { story: 'Disable the whole control.' } } },
};

export const WithDisabledOption: Story = {
	parameters: { docs: { description: { story: 'Per-action disabled state.' } } },
	render: () => ({
		components: { SplitButton },
		setup() {
			const selected = ref('export-csv');
			const actions: SplitButtonAction[] = [
				{ value: 'export-csv', label: 'Export CSV' },
				{ value: 'export-pdf', label: 'Export PDF' },
				{ value: 'export-xlsx', label: 'Export XLSX', disabled: true },
			];
			return { selected, actions };
		},
		template: `
      <SplitButton
        v-model="selected"
        :actions="actions"
        variant="outline"
        trigger-aria-label="More export options"
      />
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ─────────────────────

export const InteractiveClickEmitsPrimary: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const primary = canvasElement.querySelector(
			'[data-slot="split-button-primary"]',
		) as HTMLElement;
		await expect(primary).not.toBeNull();
		await userEvent.click(primary);
		await expect(args.onClick).toHaveBeenCalledOnce();
		// Payload is the currently-selected action value.
		await expect(args.onClick).toHaveBeenLastCalledWith('merge');
	},
};

// When the dropdown is open, Reka's FocusScope marks the canvas root as
// `aria-hidden="true"`. The original trigger button is still in that root,
// which axe flags as `aria-hidden-focus`. In a real app the rest of the page
// is correctly inert; this is a Storybook iframe artifact. Disable the rule
// for the interactive stories that open the menu.
//
// Storybook's parameter merging replaces the rules array wholesale, so we
// also re-include `color-contrast: false` (the brand-decision suppression
// declared in `.storybook/preview.ts`) — otherwise white-on-orange flags here.
const A11Y_HIDDEN_FOCUS_BYPASS = {
	a11y: {
		config: {
			rules: [
				{ id: 'aria-hidden-focus', enabled: false },
				{ id: 'color-contrast', enabled: false },
			],
		},
	},
};

export const InteractiveArrowDownOpensMenu: Story = {
	tags: ['!autodocs', 'test'],
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const primary = canvasElement.querySelector(
			'[data-slot="split-button-primary"]',
		) as HTMLElement;
		primary.focus();
		await expect(primary).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');

		// Reka portals the menu to body. Wait a tick.
		await new Promise<void>((r) => requestAnimationFrame(() => r()));
		const items = inBody().queryAllByRole('menuitemradio');
		await expect(items.length).toBe(3);
	},
};

export const InteractiveChevronOpensMenu: Story = {
	tags: ['!autodocs', 'test'],
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="split-button-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);

		await new Promise<void>((r) => requestAnimationFrame(() => r()));
		const items = inBody().queryAllByRole('menuitemradio');
		await expect(items.length).toBe(3);
	},
};

export const InteractiveMenuKeyboardNavigation: Story = {
	tags: ['!autodocs', 'test'],
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="split-button-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await new Promise<void>((r) => requestAnimationFrame(() => r()));

		const items = inBody().queryAllByRole('menuitemradio') as HTMLElement[];
		await expect(items.length).toBe(3);

		// Each item is reachable via arrow keys — focus the first explicitly to
		// sidestep variability in which item is auto-focused.
		items[0].focus();
		await expect(items[0]).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect(items[1]).toHaveFocus();
		await userEvent.keyboard('{ArrowDown}');
		await expect(items[2]).toHaveFocus();
		await userEvent.keyboard('{ArrowUp}');
		await expect(items[1]).toHaveFocus();
	},
};

export const InteractiveMenuItemSelectionEmitsModel: Story = {
	tags: ['!autodocs', 'test'],
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ args, canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="split-button-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await new Promise<void>((r) => requestAnimationFrame(() => r()));

		const items = inBody().queryAllByRole('menuitemradio') as HTMLElement[];
		await userEvent.click(items[1]);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('squash');
	},
};

export const InteractiveTriggerAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="split-button-trigger"]',
		) as HTMLElement;
		await expect(trigger.getAttribute('aria-label')).toBe('More merge options');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: { docs: { description: { story: 'WCAG 2.5.8 — both halves clear 24×24.' } } },
	play: async ({ canvasElement }) => {
		const primary = canvasElement.querySelector(
			'[data-slot="split-button-primary"]',
		) as HTMLElement;
		const trigger = canvasElement.querySelector(
			'[data-slot="split-button-trigger"]',
		) as HTMLElement;
		expectMinTargetSize(primary, 24);
		expectMinTargetSize(trigger, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { SplitButton },
		setup() {
			const selected = ref('merge');
			return { selected, mergeActions };
		},
		template: `
      <div data-test-root class="w-full p-2">
        <SplitButton v-model="selected" :actions="mergeActions" trigger-aria-label="More options" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const primary = root.querySelector('[data-slot="split-button-primary"]') as HTMLElement;
			const trigger = root.querySelector('[data-slot="split-button-trigger"]') as HTMLElement;
			await expect(primary.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
			await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
		});
	},
};
