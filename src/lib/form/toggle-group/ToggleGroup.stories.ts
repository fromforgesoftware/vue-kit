import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import {
	AlignLeft,
	AlignCenter,
	AlignRight,
	Bold,
	Italic,
	Underline,
	Strikethrough,
} from '@lucide/vue';
import ToggleGroup from './ToggleGroup.vue';
import ToggleGroupItem from './ToggleGroupItem.vue';
import Icon from '../../general/icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Form/ToggleGroup',
	component: ToggleGroup,
	// Disable autodocs because this component has a curated `About.mdx`.
	tags: ['!autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['single', 'multiple'],
			description:
				'Selection mode. `single` enforces at most one active item; `multiple` allows any combination.',
		},
		orientation: {
			control: 'select',
			options: ['horizontal', 'vertical'],
			description: 'Layout axis. Arrow keys navigate along this axis.',
		},
		disabled: { control: 'boolean', description: 'Disable every item in the group.' },
		loop: {
			control: 'boolean',
			description: 'Loop arrow-key navigation back to the start at the end.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		type: 'single',
		orientation: 'horizontal',
		disabled: false,
		loop: true,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A connected row (or column) of Toggle items with single- or multi-select semantics. Built on Reka `ToggleGroup`. Items inherit the Toggle CVA so density and variants stay consistent.',
			},
		},
	},
	render: (args) => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup() {
			const value = ref('center');
			return { args, value, AlignLeft, AlignCenter, AlignRight };
		},
		template: `
      <ToggleGroup v-model="value" v-bind="args" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left"><Icon :icon="AlignLeft" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center"><Icon :icon="AlignCenter" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right"><Icon :icon="AlignRight" /></ToggleGroupItem>
      </ToggleGroup>
    `,
	}),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Single: Story = {
	parameters: {
		docs: { description: { story: 'Single-select. At most one item can be active at a time.' } },
	},
};

export const Multiple: Story = {
	parameters: {
		docs: { description: { story: 'Multi-select. Each item toggles independently.' } },
	},
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup() {
			const value = ref<string[]>(['bold']);
			return { value, Bold, Italic, Underline, Strikethrough };
		},
		template: `
      <div class="flex flex-col items-start gap-2">
        <ToggleGroup v-model="value" type="multiple" aria-label="Text formatting">
          <ToggleGroupItem value="bold" aria-label="Bold"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Icon :icon="Italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Icon :icon="Underline" /></ToggleGroupItem>
          <ToggleGroupItem value="strikethrough" aria-label="Strikethrough"><Icon :icon="Strikethrough" /></ToggleGroupItem>
        </ToggleGroup>
        <p class="text-xs text-muted-foreground">Active: {{ value.join(', ') || '—' }}</p>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Density tracks the Input ramp — apply the same `size` to every item in a group.',
			},
		},
	},
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup: () => ({ Bold, Italic, Underline }),
		template: `
      <div class="flex flex-col items-start gap-3">
        <ToggleGroup type="multiple" aria-label="Small">
          <ToggleGroupItem value="bold" size="sm" aria-label="Bold"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" size="sm" aria-label="Italic"><Icon :icon="Italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" size="sm" aria-label="Underline"><Icon :icon="Underline" /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="Default">
          <ToggleGroupItem value="bold" aria-label="Bold"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Icon :icon="Italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Icon :icon="Underline" /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="Large">
          <ToggleGroupItem value="bold" size="lg" aria-label="Bold"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" size="lg" aria-label="Italic"><Icon :icon="Italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" size="lg" aria-label="Underline"><Icon :icon="Underline" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
	}),
};

export const Vertical: Story = {
	args: { orientation: 'vertical' },
	parameters: {
		docs: { description: { story: 'Vertical layout. Arrow keys move along the vertical axis.' } },
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'Setting `disabled` on the group disables every item.' } },
	},
};

export const ItemDisabled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Disable a single item by passing `disabled` to the item — the rest stay interactive.',
			},
		},
	},
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup() {
			const value = ref('left');
			return { value, AlignLeft, AlignCenter, AlignRight };
		},
		template: `
      <ToggleGroup v-model="value" type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left"><Icon :icon="AlignLeft" /></ToggleGroupItem>
        <ToggleGroupItem value="center" disabled aria-label="Center (disabled)"><Icon :icon="AlignCenter" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right"><Icon :icon="AlignRight" /></ToggleGroupItem>
      </ToggleGroup>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveSingleSelect: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup() {
			const value = ref('left');
			return { value, AlignLeft, AlignCenter, AlignRight };
		},
		template: `
      <ToggleGroup v-model="value" type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left"><Icon :icon="AlignLeft" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center"><Icon :icon="AlignCenter" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right"><Icon :icon="AlignRight" /></ToggleGroupItem>
      </ToggleGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]');
		expect(items.length).toBe(3);
		expect(items[0]).toHaveAttribute('data-state', 'on');
		await userEvent.click(items[2]);
		expect(items[2]).toHaveAttribute('data-state', 'on');
		expect(items[0]).toHaveAttribute('data-state', 'off');
	},
};

export const InteractiveMultipleSelect: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup() {
			const value = ref<string[]>([]);
			return { value, Bold, Italic };
		},
		template: `
      <ToggleGroup v-model="value" type="multiple" aria-label="Formatting">
        <ToggleGroupItem value="bold" aria-label="Bold"><Icon :icon="Bold" /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><Icon :icon="Italic" /></ToggleGroupItem>
      </ToggleGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]');
		expect(items.length).toBe(2);
		await userEvent.click(items[0]);
		expect(items[0]).toHaveAttribute('data-state', 'on');
		await userEvent.click(items[1]);
		expect(items[0]).toHaveAttribute('data-state', 'on');
		expect(items[1]).toHaveAttribute('data-state', 'on');
	},
};

export const InteractiveArrowKeyNavigation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup() {
			const value = ref('');
			return { value, AlignLeft, AlignCenter, AlignRight };
		},
		template: `
      <ToggleGroup v-model="value" type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left"><Icon :icon="AlignLeft" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center"><Icon :icon="AlignCenter" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right"><Icon :icon="AlignRight" /></ToggleGroupItem>
      </ToggleGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]');
		items[0].focus();
		expect(items[0]).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		expect(items[1]).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		expect(items[2]).toHaveFocus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(items[1]).toHaveFocus();
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup: () => ({ AlignLeft, AlignCenter, AlignRight }),
		template: `
      <ToggleGroup type="single" disabled model-value="center" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left"><Icon :icon="AlignLeft" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center"><Icon :icon="AlignCenter" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right"><Icon :icon="AlignRight" /></ToggleGroupItem>
      </ToggleGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="toggle-group-item"]',
		);
		for (const i of items) {
			expect(i).toBeDisabled();
			expect(i).toHaveAttribute('data-disabled');
		}
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Every item meets WCAG 2.2 SC 2.5.8 (≥ 24×24 px) at every size.' },
		},
	},
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup: () => ({ Bold, Italic, Underline }),
		template: `
      <div data-test-root class="flex flex-col items-start gap-3 p-2">
        <ToggleGroup type="multiple" aria-label="sm">
          <ToggleGroupItem value="b" size="sm" aria-label="b"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="i" size="sm" aria-label="i"><Icon :icon="Italic" /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="default">
          <ToggleGroupItem value="b" aria-label="b"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="i" aria-label="i"><Icon :icon="Italic" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]');
		for (const i of items) expectMinTargetSize(i, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { ToggleGroup, ToggleGroupItem, Icon },
		setup: () => ({ AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline }),
		template: `
      <div data-test-root class="flex flex-wrap items-center gap-3 p-2">
        <ToggleGroup type="single" model-value="center" aria-label="Alignment">
          <ToggleGroupItem value="left" aria-label="Left"><Icon :icon="AlignLeft" /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center"><Icon :icon="AlignCenter" /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right"><Icon :icon="AlignRight" /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="Formatting">
          <ToggleGroupItem value="b" aria-label="Bold"><Icon :icon="Bold" /></ToggleGroupItem>
          <ToggleGroupItem value="i" aria-label="Italic"><Icon :icon="Italic" /></ToggleGroupItem>
          <ToggleGroupItem value="u" aria-label="Underline"><Icon :icon="Underline" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const groups = root.querySelectorAll<HTMLElement>('[data-slot="toggle-group"]');
			expect(groups.length).toBe(2);
		});
	},
};
