import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Progress from './Progress.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'success', 'warning', 'destructive', 'info'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'General/Progress',
	component: Progress,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: { type: 'range', min: 0, max: 100, step: 1 } },
		size: { control: 'select', options: ALL_SIZES },
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Semantic colour. Use to convey health/risk on the metric.',
		},
		indeterminate: {
			control: 'boolean',
			description: 'Render an indeterminate animation. Ignores `modelValue`.',
		},
	},
	args: {
		modelValue: 60,
		size: 'default',
		variant: 'default',
		indeterminate: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Determinate progress bar that visualises a known percentage. For unknown progress (waiting on a request), use `indeterminate` or a `Spinner`.',
			},
		},
	},
	render: (args) => ({
		components: { Progress },
		setup: () => ({ args }),
		template: `<div class="w-80"><Progress v-bind="args" /></div>`,
	}),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Five semantic variants. Match the colour to the health of the metric (warning = at risk; destructive = over).',
			},
		},
	},
	render: () => ({
		components: { Progress },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-3 w-80">
        <div v-for="v in ALL_VARIANTS" :key="v" class="space-y-1">
          <span class="text-xs text-muted-foreground">{{ v }}</span>
          <Progress :variant="v" :model-value="60" />
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three heights. `sm` for inline list rows; `default` for general use; `lg` for headline metrics.',
			},
		},
	},
	render: () => ({
		components: { Progress },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-3 w-80">
        <div v-for="s in ALL_SIZES" :key="s" class="space-y-1">
          <span class="text-xs text-muted-foreground">{{ s }}</span>
          <Progress :size="s" :model-value="60" />
        </div>
      </div>
    `,
	}),
};

export const ProgressValues: Story = {
	parameters: {
		docs: { description: { story: 'Range from 0 to 100.' } },
	},
	render: () => ({
		components: { Progress },
		template: `
      <div class="flex flex-col gap-3 w-80">
        <Progress :model-value="0" />
        <Progress :model-value="25" />
        <Progress :model-value="50" />
        <Progress :model-value="75" />
        <Progress :model-value="100" />
      </div>
    `,
	}),
};

export const Indeterminate: Story = {
	args: { indeterminate: true },
	parameters: {
		docs: {
			description: {
				story:
					'Set `indeterminate` for unknown-duration tasks. Animation respects `prefers-reduced-motion`.',
			},
		},
	},
};

export const WithLabel: Story = {
	parameters: {
		docs: { description: { story: 'Compose a label row above the bar.' } },
	},
	render: () => ({
		components: { Progress },
		template: `
      <div class="w-80 space-y-2">
        <div class="flex justify-between text-sm">
          <span>Project progress</span>
          <span class="text-muted-foreground">60%</span>
        </div>
        <Progress :model-value="60" />
      </div>
    `,
	}),
};

export const InCard: Story = {
	parameters: {
		docs: { description: { story: 'Common dashboard pattern — heading + sub-text + progress.' } },
	},
	render: () => ({
		components: { Progress },
		template: `
      <div class="w-80 rounded-lg border p-4 space-y-4">
        <div class="space-y-1">
          <h4 class="font-medium">Storage used</h4>
          <p class="text-xs text-muted-foreground">3.2 GB of 5 GB</p>
        </div>
        <Progress variant="warning" :model-value="64" />
        <p class="text-xs text-muted-foreground">1.8 GB remaining</p>
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="progress"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		const indicator = canvasElement.querySelector(
			'[data-slot="progress-indicator"]',
		) as HTMLElement;
		await expect(indicator).toBeInTheDocument();
	},
};

export const InteractiveTransformReflectsValue: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: 50 },
	play: async ({ canvasElement }) => {
		const indicator = canvasElement.querySelector(
			'[data-slot="progress-indicator"]',
		) as HTMLElement;
		await expect(indicator.getAttribute('style')).toContain('translateX(-50%)');
	},
};

export const InteractiveIndeterminateNoTransform: Story = {
	tags: ['!autodocs', 'test'],
	args: { indeterminate: true },
	play: async ({ canvasElement }) => {
		const indicator = canvasElement.querySelector(
			'[data-slot="progress-indicator"]',
		) as HTMLElement;
		await expect(indicator.className).toContain('progress-indeterminate');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Progress },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="flex flex-col gap-3 p-2">
        <Progress v-for="v in ALL_VARIANTS" :key="v" :variant="v" :model-value="60" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const bars = root.querySelectorAll('[data-slot="progress"]');
			await expect(bars.length).toBe(5);
		});
	},
};
