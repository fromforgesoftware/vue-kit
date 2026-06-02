import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { ref } from 'vue';
import ColorPicker from './ColorPicker.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Color/Color Picker',
	component: ColorPicker,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: 'text' },
		defaultValue: { control: 'text' },
		colorSpace: { control: 'select', options: ['hsl', 'hsb'] },
		disabled: { control: 'boolean' },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		shape: { control: 'select', options: ['default', 'square'] },
		align: { control: 'select', options: ['start', 'center', 'end'] },
		ariaLabel: { control: 'text' },
		showAlpha: { control: 'boolean' },
		showEyeDropper: { control: 'boolean' },
		showChannels: { control: 'select', options: ['hex', 'all', false] },
		presets: { control: 'object' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		defaultValue: '#3b82f6',
		colorSpace: 'hsb',
		disabled: false,
		size: 'default',
		shape: 'default',
		align: 'start',
		showAlpha: true,
		showEyeDropper: true,
		showChannels: 'all',
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Composite colour picker: a trigger button shows the current colour, opening a popover (desktop) or bottom-sheet (mobile) with a Color Area, eyedropper, hue + alpha sliders, tabbed Hex/RGB/HSL/HSB inputs, and an optional preset palette. Built from the other Color primitives.',
			},
		},
	},
	render: (args) => ({
		components: { ColorPicker },
		setup: () => ({ args }),
		template: `<ColorPicker v-bind="args" @update:modelValue="args['onUpdate:modelValue']" />`,
	}),
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {
	render: () => ({
		components: { ColorPicker },
		setup() {
			const color = ref('#3b82f6');
			return { color };
		},
		template: `
      <div class="flex items-center gap-3">
        <ColorPicker v-model="color" />
        <span class="text-sm text-muted-foreground tabular-nums">{{ color }}</span>
      </div>
    `,
	}),
};

export const Square: Story = {
	args: { shape: 'square' },
	parameters: {
		docs: {
			description: {
				story: 'Icon-button-sized trigger — fits in toolbars next to other icon buttons.',
			},
		},
	},
};

export const Sizes: Story = {
	render: () => ({
		components: { ColorPicker },
		template: `
      <div class="flex items-center gap-3">
        <ColorPicker default-value="#22c55e" size="sm" />
        <ColorPicker default-value="#3b82f6" size="default" />
        <ColorPicker default-value="#a855f7" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: '#ef4444' },
};

export const WithAlpha: Story = {
	args: { showAlpha: true },
	parameters: { docs: { description: { story: 'Adds an alpha slider stacked under hue.' } } },
};

export const WithEyeDropper: Story = {
	args: { showEyeDropper: true },
	parameters: {
		docs: {
			description: {
				story:
					'Adds the screen colour-picker button. Renders nothing in browsers without `window.EyeDropper` (Firefox / Safari).',
			},
		},
	},
};

export const WithChannelTabs: Story = {
	args: { showChannels: 'all' },
	parameters: {
		docs: {
			description: {
				story: 'Switches the single hex field for tabbed Hex / RGB / HSL / HSB inputs.',
			},
		},
	},
};

export const WithPresets: Story = {
	args: {
		presets: [
			'#ef4444',
			'#f97316',
			'#eab308',
			'#22c55e',
			'#06b6d4',
			'#3b82f6',
			'#a855f7',
			'#ec4899',
			'#1f2937',
			'#ffffff',
		],
	},
	parameters: { docs: { description: { story: 'Renders a preset palette under the inputs.' } } },
};

export const FullFeatured: Story = {
	args: {
		showAlpha: true,
		showEyeDropper: true,
		showChannels: 'all',
		presets: [
			'#ef4444',
			'#f97316',
			'#eab308',
			'#22c55e',
			'#06b6d4',
			'#3b82f6',
			'#a855f7',
			'#ec4899',
			'#1f2937',
			'#ffffff',
		],
	},
	parameters: {
		docs: {
			description: {
				story: 'Every optional feature enabled: alpha, eyedropper, channel tabs, presets.',
			},
		},
	},
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="color-picker"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="color-picker-trigger"]')).not.toBeNull();
	},
};

export const InteractiveOpenClosePopover: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story: 'Trigger click opens popover; Escape closes; clicking outside closes.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="color-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		// Popover content portals to document.body — query via inBody().
		await waitFor(() => {
			const el = inBody().getByLabelText('Color picker');
			if (!el) throw new Error('popover content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="popover-content"]')).toBeNull();
		});
	},
};

export const InteractiveAccessibleTrigger: Story = {
	tags: ['!autodocs', 'test'],
	args: { ariaLabel: 'Brand colour' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Brand colour' });
		await expect(trigger).toBeInTheDocument();
		expectMinTargetSize(trigger, 24);
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="color-picker-trigger"]',
		) as HTMLButtonElement;
		await expect(trigger.disabled).toBe(true);
		await userEvent.click(trigger).catch(() => {});
		const opened = document.body.querySelector('[data-slot="popover-content"]');
		await expect(opened).toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ColorPicker },
		template: `
      <div data-test-root class="p-2">
        <ColorPicker default-value="#3b82f6" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector('[data-slot="color-picker-trigger"]') as HTMLElement;
			const r = trigger.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThan(0);
		});
	},
};
