import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { Ellipsis } from '@lucide/vue';
import StatCard from './StatCard.vue';
import StatCardGroup from './StatCardGroup.vue';
import StatTrend from '../general/stat-trend/StatTrend.vue';
import Icon from '../general/icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'muted', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Statistic Card/StatCard',
	component: StatCard,
	tags: ['!autodocs'],
	argTypes: {
		label: { control: 'text' },
		value: { control: 'text' },
		unit: { control: 'text' },
		description: { control: 'text' },
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description:
				'Surface style. `default` for primary; `muted` for secondary; `ghost` for embedded.',
		},
		size: { control: 'select', options: ALL_SIZES, description: 'Density.' },
		interactive: {
			control: 'boolean',
			description: 'Treat the card as a clickable surface — adds hover/focus and emits `click`.',
		},
		loading: { control: 'boolean', description: 'Show skeleton state.' },
		onClick: { action: 'click' },
	},
	args: {
		label: 'All Orders',
		value: '122,380',
		variant: 'default',
		size: 'default',
		interactive: false,
		loading: false,
		onClick: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Base statistic card. Renders a label, primary value, optional unit/description, and slots for trend, action, and footer. See ColoredStatCard for tinted surface, IconStatCard for leading icon, ProgressStatCard for progress visualisation.',
			},
		},
	},
	render: (args) => ({
		components: { StatCard },
		setup: () => ({ args }),
		template: `<StatCard v-bind="args" class="w-64" @click="args.onClick" />`,
	}),
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three surface styles. `muted` for secondary panels nested inside a primary card; `ghost` to drop the border entirely.',
			},
		},
	},
	render: () => ({
		components: { StatCard },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-3 w-64">
        <StatCard v-for="v in ALL_VARIANTS" :key="v" :variant="v" :label="v" value="42" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Three densities. `sm` for dense dashboards; `lg` for hero KPIs.' },
		},
	},
	render: () => ({
		components: { StatCard },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-3 w-64">
        <StatCard v-for="s in ALL_SIZES" :key="s" :size="s" :label="'size: ' + s" value="42" />
      </div>
    `,
	}),
};

export const WithTrend: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Compose a StatTrend in the `trend` slot to surface period-over-period change.',
			},
		},
	},
	render: () => ({
		components: { StatCard, StatTrend },
		template: `
      <StatCard label="All Orders" value="122,380" class="w-64">
        <template #trend><StatTrend :value="15.1" direction="up" /></template>
        <template #footer>Vs last month: <strong>105,922</strong></template>
      </StatCard>
    `,
	}),
};

export const WithNegativeTrend: Story = {
	render: () => ({
		components: { StatCard, StatTrend },
		template: `
      <StatCard label="Order Created" value="1.9M" class="w-64">
        <template #trend><StatTrend :value="2" direction="down" /></template>
        <template #footer>Vs last month: <strong>2.0M</strong></template>
      </StatCard>
    `,
	}),
};

export const WithAction: Story = {
	parameters: {
		docs: {
			description: { story: 'Use the `action` slot for a top-right control (menu, expand, etc).' },
		},
	},
	render: () => ({
		components: { StatCard, StatTrend, Icon },
		setup: () => ({ Ellipsis }),
		template: `
      <StatCard label="Active Users" value="48,210" class="w-64">
        <template #action>
          <button class="rounded-md p-1 hover:bg-muted" aria-label="More">
            <Icon :icon="Ellipsis" size="sm" class="text-muted-foreground" />
          </button>
        </template>
        <template #trend><StatTrend :value="3.7" direction="up" /></template>
        <template #footer>Vs last month: <strong>46,480</strong></template>
      </StatCard>
    `,
	}),
};

export const WithDescription: Story = {
	args: {
		description: 'Sales completed across all channels in the last 30 days.',
	},
};

export const Loading: Story = {
	args: { loading: true },
	parameters: {
		docs: {
			description: {
				story:
					'Skeleton state with `aria-busy="true"` and an `sr-only` "Loading {label}" announcement.',
			},
		},
	},
};

export const Interactive: Story = {
	args: { interactive: true },
	parameters: {
		docs: {
			description: {
				story:
					'Set `interactive` to make the whole card focusable and clickable — adds hover border, focus ring, `role="button"`, `tabindex="0"`, and emits `click`.',
			},
		},
	},
};

export const Grid: Story = {
	name: 'Grid (4 columns)',
	parameters: {
		docs: {
			description: {
				story:
					'Use a CSS grid for separated cards, or `StatCardGroup layout="connected"` for one shared surface.',
			},
		},
	},
	render: () => ({
		components: { StatCard, StatTrend, Icon },
		setup: () => ({ Ellipsis }),
		template: `
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="All Orders" value="122,380">
          <template #trend><StatTrend :value="15.1" direction="up" /></template>
          <template #footer>Vs last month: <strong>105,922</strong></template>
        </StatCard>
        <StatCard label="Order Created" value="1.9M">
          <template #trend><StatTrend :value="2" direction="down" /></template>
          <template #footer>Vs last month: <strong>2.0M</strong></template>
        </StatCard>
        <StatCard label="Organic Sales" value="$98.1M">
          <template #trend><StatTrend :value="0.4" direction="up" /></template>
          <template #footer>Vs last month: <strong>$97.8M</strong></template>
        </StatCard>
        <StatCard label="Active Users" value="48,210">
          <template #trend><StatTrend :value="3.7" direction="up" /></template>
          <template #footer>Vs last month: <strong>46,480</strong></template>
        </StatCard>
      </div>
    `,
	}),
};

export const Connected: Story = {
	name: 'Connected (3 columns)',
	parameters: {
		docs: {
			description: {
				story:
					'Wrap StatCards in a StatCardGroup for one connected surface with dividers between cards.',
			},
		},
	},
	render: () => ({
		components: { StatCard, StatCardGroup, StatTrend },
		template: `
      <StatCardGroup :columns="3" class="max-w-3xl">
        <StatCard label="Total Sales & Cost" value="$956.82k">
          <template #trend><StatTrend :value="5.4" direction="up" /></template>
          <template #footer>+8.20k vs prev. 60 days</template>
        </StatCard>
        <StatCard label="New Customers" value="1,245">
          <template #trend><StatTrend :value="3.2" direction="up" /></template>
          <template #footer>+39 vs last quarter</template>
        </StatCard>
        <StatCard label="Churn Rate" value="2.8%">
          <template #trend><StatTrend :value="1.1" direction="down" /></template>
          <template #footer>-0.3% vs prev. 30 days</template>
        </StatCard>
      </StatCardGroup>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="stat-card"]') as HTMLElement;
		await expect(card).toBeInTheDocument();
		await expect(card.tagName).toBe('ARTICLE');
		await expect(canvasElement.querySelector('[data-slot="stat-card-label"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="stat-card-value"]')).toBeInTheDocument();
	},
};

export const InteractiveLabelAndValueText: Story = {
	tags: ['!autodocs', 'test'],
	args: { label: 'Total Orders', value: '99,000' },
	play: async ({ canvasElement }) => {
		const label = canvasElement.querySelector('[data-slot="stat-card-label"]') as HTMLElement;
		const value = canvasElement.querySelector('[data-slot="stat-card-value"]') as HTMLElement;
		await expect(label.textContent?.trim()).toBe('Total Orders');
		await expect(value.textContent?.trim()).toBe('99,000');
	},
};

export const InteractiveLoadingShowsSkeleton: Story = {
	tags: ['!autodocs', 'test'],
	args: { loading: true, label: 'Orders', value: '122,380' },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('aria-busy', 'true');
		await expect(canvasElement.querySelector('.animate-pulse')).toBeInTheDocument();
		await expect(card.textContent).not.toContain('122,380');
		const sr = canvasElement.querySelector('.sr-only') as HTMLElement;
		await expect(sr.textContent).toContain('Loading Orders');
	},
};

export const InteractiveClickEmitsAndFocusable: Story = {
	tags: ['!autodocs', 'test'],
	args: { interactive: true, label: 'Click me', value: '42' },
	play: async ({ args, canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('role', 'button');
		await expect(card).toHaveAttribute('tabindex', '0');
		expectMinTargetSize(card, 24);
		await userEvent.click(card);
		await expect(args.onClick).toHaveBeenCalledOnce();
		card.focus();
		await expect(card).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(args.onClick).toHaveBeenCalledTimes(2);
		await userEvent.keyboard(' ');
		await expect(args.onClick).toHaveBeenCalledTimes(3);
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
		components: { StatCard, StatTrend },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="p-2">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard v-for="v in ALL_VARIANTS" :key="v" :variant="v" :label="v" value="122,380">
            <template #trend><StatTrend :value="3.7" direction="up" /></template>
            <template #footer>Vs last month</template>
          </StatCard>
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cards = root.querySelectorAll('[data-slot="stat-card"]');
			await expect(cards.length).toBe(3);
		});
	},
};
