import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import ColorSwatchPicker from './ColorSwatchPicker.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const PALETTE = [
	'#ef4444',
	'#f97316',
	'#eab308',
	'#22c55e',
	'#14b8a6',
	'#3b82f6',
	'#6366f1',
	'#8b5cf6',
	'#ec4899',
	'#f43f5e',
	'#0f172a',
	'#ffffff',
];

const meta = {
	title: 'Color/Color Swatch Picker',
	component: ColorSwatchPicker,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: 'text' },
		colors: { control: 'object' },
		multiple: { control: 'boolean' },
		layout: { control: 'select', options: ['flow', 'grid'] },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		disabled: { control: 'boolean' },
		ariaLabel: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		colors: PALETTE,
		layout: 'flow',
		size: 'default',
		multiple: false,
		disabled: false,
		ariaLabel: 'Color palette',
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Grid of selectable colour swatches built on Reka UI. Use this for predefined palettes (theme tokens, brand colours, label colours).',
			},
		},
	},
	render: (args) => ({
		components: { ColorSwatchPicker },
		setup: () => ({ args }),
		template: `<ColorSwatchPicker v-bind="args" @update:modelValue="args['onUpdate:modelValue']" />`,
	}),
} satisfies Meta<typeof ColorSwatchPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {
	render: () => ({
		components: { ColorSwatchPicker },
		setup() {
			const color = ref('#3b82f6');
			return { color, PALETTE };
		},
		template: `
      <div class="grid gap-2">
        <ColorSwatchPicker v-model="color" :colors="PALETTE" />
        <p class="text-sm text-muted-foreground">Selected: {{ color }}</p>
      </div>
    `,
	}),
};

export const Multiple: Story = {
	args: { multiple: true },
	render: () => ({
		components: { ColorSwatchPicker },
		setup() {
			const colors = ref<string[]>(['#ef4444', '#3b82f6']);
			return { colors, PALETTE };
		},
		template: `
      <div class="grid gap-2">
        <ColorSwatchPicker v-model="colors" :colors="PALETTE" multiple />
        <p class="text-sm text-muted-foreground">Selected: {{ colors.join(', ') || 'none' }}</p>
      </div>
    `,
	}),
};

export const GridLayout: Story = {
	args: { layout: 'grid' },
	parameters: {
		docs: { description: { story: 'Strict 6-column grid for tightly packed palettes.' } },
	},
	render: () => ({
		components: { ColorSwatchPicker },
		setup() {
			const color = ref('#22c55e');
			return { color, PALETTE };
		},
		template: `<ColorSwatchPicker v-model="color" :colors="PALETTE" layout="grid" class="w-fit" />`,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { ColorSwatchPicker },
		setup() {
			const a = ref('#22c55e');
			const b = ref('#22c55e');
			const c = ref('#22c55e');
			return { a, b, c, PALETTE };
		},
		template: `
      <div class="grid gap-3">
        <ColorSwatchPicker v-model="a" :colors="PALETTE" size="sm" />
        <ColorSwatchPicker v-model="b" :colors="PALETTE" size="default" />
        <ColorSwatchPicker v-model="c" :colors="PALETTE" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true, modelValue: '#3b82f6' },
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="color-swatch-picker"]')).not.toBeNull();
		const items = canvasElement.querySelectorAll('[data-slot="color-swatch-picker-item"]');
		await expect(items.length).toBe(PALETTE.length);
		await expect(
			canvasElement.querySelector('[data-slot="color-swatch-picker-item-swatch"]'),
		).not.toBeNull();
	},
};

export const InteractiveSelectByClick: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ColorSwatchPicker },
		setup() {
			const color = ref('');
			const onUpdate = fn((v: string | string[]) => {
				color.value = Array.isArray(v) ? v[0] : v;
			});
			return { color, onUpdate, PALETTE };
		},
		template: `
      <div data-test-root>
        <ColorSwatchPicker :model-value="color" :colors="PALETTE" @update:modelValue="onUpdate" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll('[data-slot="color-swatch-picker-item"]');
		const second = items[1] as HTMLElement;
		await userEvent.click(second);
		// Selecting flips aria-selected on the chosen item.
		await expect(second.getAttribute('aria-selected')).toBe('true');
	},
};

export const InteractiveKeyboardNav: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Arrow keys move focus between swatches; Space/Enter selects.' },
		},
	},
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="color-swatch-picker-item"]',
		);
		const first = items[0];
		first.focus();
		await expect(first).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		// Reka roving tabindex moves focus.
		await expect(document.activeElement).not.toBe(first);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="color-swatch-picker-item"]',
		);
		for (const item of items) {
			expectMinTargetSize(item, 24);
		}
	},
};

export const InteractiveAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { ariaLabel: 'Brand palette' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="color-swatch-picker"]') as HTMLElement;
		await expect(root.getAttribute('aria-label')).toBe('Brand palette');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ColorSwatchPicker },
		setup() {
			return { PALETTE };
		},
		template: `
      <div data-test-root class="p-2">
        <ColorSwatchPicker default-value="#3b82f6" :colors="PALETTE" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const items = root.querySelectorAll('[data-slot="color-swatch-picker-item"]');
			await expect(items.length).toBe(PALETTE.length);
		});
	},
};
