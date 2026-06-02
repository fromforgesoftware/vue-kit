import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import ColorSwatch from './ColorSwatch.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

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
] as const;

const meta = {
	title: 'Color/Color Swatch',
	component: ColorSwatch,
	tags: ['!autodocs'],
	argTypes: {
		color: {
			control: 'color',
			description: 'Any valid CSS colour (hex, rgb, hsl, named).',
		},
		label: {
			control: 'text',
			description: 'Accessible label. Defaults to a humanised name derived from the colour.',
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'default', 'lg', 'xl'],
		},
		shape: {
			control: 'select',
			options: ['square', 'circle'],
		},
	},
	args: {
		color: '#3b82f6',
		size: 'default',
		shape: 'square',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Display-only colour chip. Renders as `role="img"` with an accessible label. For pickable swatches, use ColorSwatchPicker.',
			},
		},
	},
	render: (args) => ({
		components: { ColorSwatch },
		setup: () => ({ args }),
		template: `<ColorSwatch v-bind="args" />`,
	}),
} satisfies Meta<typeof ColorSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Palette: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A row of swatches showing the inline-flex behaviour and ring-inset border.',
			},
		},
	},
	render: () => ({
		components: { ColorSwatch },
		setup: () => ({ PALETTE }),
		template: `
      <div class="flex flex-wrap gap-2">
        <ColorSwatch v-for="c in PALETTE" :key="c" :color="c" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Five density tiers from xs (16 px) to xl (48 px).' } },
	},
	render: (args) => ({
		components: { ColorSwatch },
		setup: () => ({ args }),
		template: `
      <div class="flex items-center gap-2">
        <ColorSwatch :color="args.color" size="xs" />
        <ColorSwatch :color="args.color" size="sm" />
        <ColorSwatch :color="args.color" size="default" />
        <ColorSwatch :color="args.color" size="lg" />
        <ColorSwatch :color="args.color" size="xl" />
      </div>
    `,
	}),
};

export const Shapes: Story = {
	parameters: {
		docs: { description: { story: '`square` (default) and `circle`.' } },
	},
	render: (args) => ({
		components: { ColorSwatch },
		setup: () => ({ args }),
		template: `
      <div class="flex items-center gap-2">
        <ColorSwatch :color="args.color" shape="square" />
        <ColorSwatch :color="args.color" shape="circle" />
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	args: { color: '#3b82f6', label: 'Brand blue' },
	parameters: {
		docs: { description: { story: 'Override the auto-derived label via the `label` prop.' } },
	},
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { color: '#3b82f6', label: 'Brand blue' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const swatch = canvas.getByRole('img', { name: 'Brand blue' });
		await expect(swatch).toBeInTheDocument();
		await expect(swatch.getAttribute('aria-roledescription')).toBe('color swatch');
	},
};

export const InteractiveDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const swatch = canvasElement.querySelector('[data-slot="color-swatch"]') as HTMLElement;
		await expect(swatch).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five standard viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { ColorSwatch },
		setup: () => ({ PALETTE }),
		template: `
      <div data-test-root class="flex flex-wrap gap-2 p-2">
        <ColorSwatch v-for="c in PALETTE" :key="c" :color="c" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const swatches = root.querySelectorAll('[data-slot="color-swatch"]');
			await expect(swatches.length).toBe(PALETTE.length);
		});
	},
};
