import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import StatTrend from './StatTrend.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_DIRECTIONS = ['up', 'down', 'flat'] as const;
const ALL_TONES = ['soft', 'solid', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;
const meta = {
	title: 'General/StatTrend',
	component: StatTrend,
	tags: ['!autodocs'],
	argTypes: {
		value: { control: 'number' },
		direction: { control: 'select', options: ALL_DIRECTIONS },
		format: { control: 'select', options: ['percent', 'absolute'] },
		tone: {
			control: 'select',
			options: ALL_TONES,
			description:
				'Visual emphasis. `soft` for inline metric badges; `solid` for high contrast; `ghost` for table cells.',
		},
		size: { control: 'select', options: ALL_SIZES },
		invertSentiment: {
			control: 'boolean',
			description: 'Flip the colour mapping — for metrics where lower is better (errors, latency).',
		},
	},
	args: {
		value: 12.5,
		direction: 'up',
		format: 'percent',
		tone: 'soft',
		size: 'default',
		invertSentiment: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Compact badge that shows the direction and magnitude of a change. Use next to a stat value in dashboards.',
			},
		},
	},
	render: (args) => ({
		components: { StatTrend },
		setup: () => ({ args }),
		template: `<StatTrend v-bind="args" />`,
	}),
} satisfies Meta<typeof StatTrend>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Directions: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three directions. `up`/`down` use semantic colour; `flat` uses neutral.',
			},
		},
	},
	render: () => ({
		components: { StatTrend },
		template: `
      <div class="flex flex-wrap items-center gap-3">
        <StatTrend :value="15.1" direction="up" />
        <StatTrend :value="2" direction="down" />
        <StatTrend :value="0" direction="flat" />
      </div>
    `,
	}),
};

export const Tones: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`soft` (default) for general use; `solid` for high contrast in dense layouts; `ghost` for inline use in tables.',
			},
		},
	},
	render: () => ({
		components: { StatTrend },
		setup: () => ({ ALL_TONES }),
		template: `
      <div class="flex flex-col gap-2">
        <div v-for="t in ALL_TONES" :key="t" class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-16">{{ t }}</span>
          <StatTrend :tone="t" :value="15.1" direction="up" />
          <StatTrend :tone="t" :value="2" direction="down" />
          <StatTrend :tone="t" :value="0" direction="flat" />
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three densities. `sm` for inline use in tables; `lg` for dashboard hero metrics.',
			},
		},
	},
	render: () => ({
		components: { StatTrend },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex items-center gap-3">
        <StatTrend v-for="s in ALL_SIZES" :key="s" :size="s" :value="12.8" direction="up" />
      </div>
    `,
	}),
};

export const Formats: Story = {
	parameters: {
		docs: {
			description: { story: '`percent` adds a `%` suffix; `absolute` shows the raw number.' },
		},
	},
	render: () => ({
		components: { StatTrend },
		template: `
      <div class="flex items-center gap-3">
        <StatTrend :value="15.1" direction="up" format="percent" />
        <StatTrend :value="39" direction="up" format="absolute" />
      </div>
    `,
	}),
};

export const Severity: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Optional `severity` prop swaps the icon family. `undefined` keeps the legacy arrows. `normal` / `warning` / `critical` render single / double / triple chevrons — useful for surfacing anomaly intensity alongside the change value.',
			},
		},
	},
	render: () => ({
		components: { StatTrend },
		template: `
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-20">arrows</span>
          <StatTrend :value="3.1" direction="up" />
          <StatTrend :value="2.4" direction="down" />
          <StatTrend :value="0" direction="flat" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-20">normal</span>
          <StatTrend :value="3.1" direction="up" severity="normal" />
          <StatTrend :value="2.4" direction="down" severity="normal" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-20">warning</span>
          <StatTrend :value="9.7" direction="up" severity="warning" />
          <StatTrend :value="8.2" direction="down" severity="warning" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-20">critical</span>
          <StatTrend :value="22.3" direction="up" severity="critical" />
          <StatTrend :value="18.6" direction="down" severity="critical" />
        </div>
      </div>
    `,
	}),
};

export const WithHover: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Pass `hover` to wrap the indicator in a HoverCard. Use the `#hover` slot to render whatever content you want — text, sparklines, links.',
			},
		},
	},
	render: () => ({
		components: { StatTrend },
		template: `
      <div class="flex items-center justify-center p-12">
        <StatTrend :value="9.7" direction="up" severity="warning" hover>
          <template #hover>
            <div class="space-y-1.5">
              <p class="text-xs font-medium">vs same week last month</p>
              <p class="text-xs text-muted-foreground">+9.7% (vs 184)</p>
              <div class="h-12 w-36 rounded bg-muted/40 grid place-items-center text-2xs text-muted-foreground">
                sparkline goes here
              </div>
            </div>
          </template>
        </StatTrend>
      </div>
    `,
	}),
};

export const InvertedSentiment: Story = {
	args: { invertSentiment: true },
	parameters: {
		docs: {
			description: {
				story:
					'For metrics where lower is better (errors, churn), pass `invert-sentiment` so "down" becomes positive and "up" becomes negative.',
			},
		},
	},
	render: () => ({
		components: { StatTrend },
		template: `
      <div class="flex items-center gap-3">
        <StatTrend :value="3.2" direction="down" invert-sentiment />
        <StatTrend :value="1.8" direction="up" invert-sentiment />
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="stat-trend"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await expect(root).toHaveAttribute('role', 'status');
		const icon = canvasElement.querySelector('[data-slot="stat-trend-icon"]') as SVGElement;
		await expect(icon).toBeInTheDocument();
		await expect(icon).toHaveAttribute('aria-hidden', 'true');
	},
};

export const InteractiveAriaLabel: Story = {
	tags: ['!autodocs', 'test'],
	args: { value: 15.1, direction: 'up' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="stat-trend"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-label', 'increased by 15.1%');
	},
};

export const InteractiveAbsoluteFormat: Story = {
	tags: ['!autodocs', 'test'],
	args: { value: 39, direction: 'up', format: 'absolute' },
	play: async ({ canvasElement }) => {
		const value = canvasElement.querySelector('[data-slot="stat-trend-value"]') as HTMLElement;
		await expect(value.textContent?.trim()).toBe('39');
	},
};

export const InteractiveInvertSentiment: Story = {
	tags: ['!autodocs', 'test'],
	args: { value: 3.2, direction: 'down', invertSentiment: true },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="stat-trend"]') as HTMLElement;
		// Inverted: "down" is positive, so success colour should be applied.
		await expect(root.className).toContain('text-success');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { StatTrend },
		template: `
      <div data-test-root class="flex flex-wrap items-center gap-3 p-2">
        <StatTrend :value="15.1" direction="up" />
        <StatTrend :value="2" direction="down" />
        <StatTrend :value="0" direction="flat" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trends = root.querySelectorAll('[data-slot="stat-trend"]');
			await expect(trends.length).toBe(3);
		});
	},
};
