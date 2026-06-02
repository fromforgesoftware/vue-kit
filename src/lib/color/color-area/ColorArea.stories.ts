import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import ColorArea from './ColorArea.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const meta = {
	title: 'Color/Color Area',
	component: ColorArea,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: 'text' },
		defaultValue: { control: 'text' },
		colorSpace: { control: 'select', options: ['hsl', 'hsb'] },
		size: { control: 'select', options: ['sm', 'default', 'lg', 'full'] },
		disabled: { control: 'boolean' },
		ariaLabel: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		defaultValue: '#ff0000',
		colorSpace: 'hsl',
		size: 'default',
		disabled: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Two-dimensional colour picker (saturation × value). Built on Reka UI. Drag the thumb or use arrow keys to adjust both axes; combine with a hue ColorSlider to cover the full HSB space.',
			},
		},
	},
	render: (args) => ({
		components: { ColorArea },
		setup: () => ({ args }),
		template: `<ColorArea v-bind="args" @update:modelValue="args['onUpdate:modelValue']" />`,
	}),
} satisfies Meta<typeof ColorArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {
	render: () => ({
		components: { ColorArea },
		setup() {
			const color = ref('#ff0000');
			return { color };
		},
		template: `
      <div class="flex flex-col gap-2">
        <ColorArea v-model="color" />
        <p class="text-sm text-muted-foreground tabular-nums">{{ color }}</p>
      </div>
    `,
	}),
};

export const HSB: Story = {
	parameters: {
		docs: { description: { story: 'HSB colour space — adjusts saturation and brightness.' } },
	},
	render: () => ({
		components: { ColorArea },
		setup() {
			const color = ref('#3b82f6');
			return { color };
		},
		template: `<ColorArea v-model="color" color-space="hsb" />`,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three preset square sizes plus `full` (fills container).' } },
	},
	render: () => ({
		components: { ColorArea },
		template: `
      <div class="flex flex-wrap items-end gap-4">
        <ColorArea default-value="#22c55e" size="sm" />
        <ColorArea default-value="#3b82f6" size="default" />
        <ColorArea default-value="#a855f7" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: '#ef4444' },
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveKeyboardArrows: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Arrow keys adjust saturation and lightness — provides a non-pointer alternative to drag (WCAG 2.5.7).',
			},
		},
	},
	play: async ({ args, canvasElement }) => {
		const thumb = canvasElement.querySelector('[data-slot="color-area-thumb"]') as HTMLElement;
		thumb.focus();
		await expect(thumb).toHaveFocus();
		const before = args['onUpdate:modelValue'] as ReturnType<typeof fn>;
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{ArrowUp}');
		await expect(before).toHaveBeenCalled();
	},
};

export const InteractiveAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { ariaLabel: 'Brand colour picker' },
	play: async ({ canvasElement }) => {
		const thumb = canvasElement.querySelector('[data-slot="color-area-thumb"]') as HTMLElement;
		await expect(thumb).toBeInTheDocument();
		await expect(thumb.getAttribute('role')).toBe('slider');
		// The thumb has its own aria-label combining x/y channel names. The root
		// exposes the consumer-supplied label via aria-label so axe finds a name.
		const root = canvasElement.querySelector('[data-slot="color-area"]') as HTMLElement;
		await expect(root.getAttribute('aria-label')).toBe('Brand colour picker');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="color-area"]') as HTMLElement;
		await expect(root.getAttribute('data-disabled')).not.toBeNull();
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="color-area"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="color-area-area"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="color-area-thumb"]')).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Renders at every viewport without horizontal overflow.' } },
	},
	render: () => ({
		components: { ColorArea },
		template: `
      <div data-test-root class="p-2">
        <ColorArea default-value="#3b82f6" size="full" class="max-w-xs" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const area = root.querySelector('[data-slot="color-area-area"]') as HTMLElement;
			const r = area.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThan(0);
		});
	},
};
