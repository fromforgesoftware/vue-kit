import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import {
	ShoppingCart,
	Package,
	Users,
	Cable,
	Database,
	CircleDollarSign,
	Megaphone,
} from '@lucide/vue';
import IconStatCard from './IconStatCard.vue';
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
	title: 'Statistic Card/IconStatCard',
	component: IconStatCard,
	tags: ['!autodocs'],
	argTypes: {
		label: { control: 'text' },
		value: { control: 'text' },
		unit: { control: 'text' },
		footer: { control: 'text' },
		variant: { control: 'select', options: ALL_VARIANTS, description: 'Surface style.' },
		size: { control: 'select', options: ALL_SIZES, description: 'Density.' },
		layout: {
			control: 'select',
			options: ['stacked', 'inline'],
			description:
				'Content arrangement. stacked = icon top-left, content below; inline = icon left, content column right.',
		},
		interactive: { control: 'boolean', description: 'Treat the card as a clickable surface.' },
		loading: { control: 'boolean' },
		onClick: { action: 'click' },
	},
	args: {
		label: 'Active Projects',
		value: '17',
		footer: 'From Jan 01 - Jul 30, 2024',
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
					'StatCard with a leading icon. Use a tinted icon container in the `icon` slot — the icon itself is decorative. See StatCard for the icon-less variant.',
			},
		},
	},
	render: (args) => ({
		components: { IconStatCard, StatTrend, Icon },
		setup: () => ({ args, Package }),
		template: `
      <IconStatCard v-bind="args" class="w-64" @click="args.onClick">
        <template #icon>
          <div class="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
            <Icon :icon="Package" size="sm" />
          </div>
        </template>
        <template #trend><StatTrend :value="12.8" direction="up" /></template>
      </IconStatCard>
    `,
	}),
} satisfies Meta<typeof IconStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: { description: { story: 'Three surface styles (the icon stays the same).' } },
	},
	render: () => ({
		components: { IconStatCard, Icon },
		setup: () => ({ Package, ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-3 w-72">
        <IconStatCard v-for="v in ALL_VARIANTS" :key="v" :variant="v" :label="v" value="17">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Icon :icon="Package" size="sm" />
            </div>
          </template>
        </IconStatCard>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { IconStatCard, Icon },
		setup: () => ({ Package, ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-3 w-72">
        <IconStatCard v-for="s in ALL_SIZES" :key="s" :size="s" :label="'size: ' + s" value="42">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Icon :icon="Package" size="sm" />
            </div>
          </template>
        </IconStatCard>
      </div>
    `,
	}),
};

export const Grid: Story = {
	name: 'Grid (3 columns)',
	render: () => ({
		components: { IconStatCard, StatTrend, Icon },
		setup: () => ({ Package, ShoppingCart, Users }),
		template: `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IconStatCard label="Active Projects" value="17" footer="From Jan 01 - Jul 30, 2024">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Icon :icon="Package" size="sm" />
            </div>
          </template>
          <template #trend><StatTrend :value="12.8" direction="up" /></template>
        </IconStatCard>
        <IconStatCard label="Orders Processed" value="3,421" footer="From Jan 01 - Jul 30, 2024">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Icon :icon="ShoppingCart" size="sm" />
            </div>
          </template>
          <template #trend><StatTrend :value="3.7" direction="up" /></template>
        </IconStatCard>
        <IconStatCard label="Churned Users" value="89" footer="From Jan 01 - Jul 30, 2024">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Icon :icon="Users" size="sm" />
            </div>
          </template>
          <template #trend><StatTrend :value="2.1" direction="down" /></template>
        </IconStatCard>
      </div>
    `,
	}),
};

export const KpiDashboard: Story = {
	name: 'KPI Dashboard',
	render: () => ({
		components: { IconStatCard, StatTrend, Icon, StatCardGroup },
		setup: () => ({ Cable, Database, CircleDollarSign, Megaphone }),
		template: `
      <StatCardGroup :columns="4">
        <IconStatCard label="Connections" value="427,296" size="lg">
          <template #icon>
            <div class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon :icon="Cable" size="md" />
            </div>
          </template>
          <template #footer>
            <div class="flex items-center gap-1.5">
              <StatTrend :value="12" direction="up" />
              <span class="text-muted-foreground">vs last week</span>
            </div>
          </template>
        </IconStatCard>
        <IconStatCard label="Contacts" value="37,429" size="lg">
          <template #icon>
            <div class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon :icon="Database" size="md" />
            </div>
          </template>
          <template #footer>
            <div class="flex items-center gap-1.5">
              <StatTrend :value="42" direction="up" />
              <span class="text-muted-foreground">vs last week</span>
            </div>
          </template>
        </IconStatCard>
        <IconStatCard label="Value" value="$82,439" size="lg">
          <template #icon>
            <div class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon :icon="CircleDollarSign" size="md" />
            </div>
          </template>
          <template #footer>
            <div class="flex items-center gap-1.5">
              <StatTrend :value="37" direction="down" />
              <span class="text-muted-foreground">vs last week</span>
            </div>
          </template>
        </IconStatCard>
        <IconStatCard label="Referrals" value="3,497" size="lg">
          <template #icon>
            <div class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon :icon="Megaphone" size="md" />
            </div>
          </template>
          <template #footer>
            <div class="flex items-center gap-1.5">
              <StatTrend :value="17" direction="up" />
              <span class="text-muted-foreground">vs last week</span>
            </div>
          </template>
        </IconStatCard>
      </StatCardGroup>
    `,
	}),
};

export const Interactive: Story = {
	args: { interactive: true },
};

export const Loading: Story = {
	args: { loading: true },
};

// Inline layout — icon column on the left, content column on the right.
// Better for narrow rows or summary strips where vertical space matters and
// the icon serves as a categorical anchor (status pills, KPI rails).
export const Inline: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Inline layout. Icon left, label/value/footer column right. Compose four of these in a `StatCardGroup` for a compact summary row.',
			},
		},
	},
	render: () => ({
		components: { IconStatCard, StatCardGroup, Icon },
		setup: () => ({ Package, ShoppingCart, Users, CircleDollarSign }),
		template: `
      <StatCardGroup :columns="4">
        <IconStatCard layout="inline" label="Active" value="17" footer="up 12% this week">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Icon :icon="Package" size="sm" />
            </div>
          </template>
        </IconStatCard>
        <IconStatCard layout="inline" label="Orders" value="3,421" footer="last 30 days">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Icon :icon="ShoppingCart" size="sm" />
            </div>
          </template>
        </IconStatCard>
        <IconStatCard layout="inline" label="Churned" value="89" footer="2 critical accounts">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Icon :icon="Users" size="sm" />
            </div>
          </template>
        </IconStatCard>
        <IconStatCard layout="inline" label="MRR" value="$48k" footer="up 4.5% MoM">
          <template #icon>
            <div class="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Icon :icon="CircleDollarSign" size="sm" />
            </div>
          </template>
        </IconStatCard>
      </StatCardGroup>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="icon-stat-card"]') as HTMLElement;
		await expect(card).toBeInTheDocument();
		await expect(card.tagName).toBe('ARTICLE');
		await expect(canvasElement.querySelector('[data-slot="stat-card-label"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="stat-card-value"]')).toBeInTheDocument();
		await expect(
			canvasElement.querySelector('[data-slot="icon-stat-card-icon"]'),
		).toBeInTheDocument();
	},
};

export const InteractiveIconIsDecorative: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const iconWrap = canvasElement.querySelector(
			'[data-slot="icon-stat-card-icon"]',
		) as HTMLElement;
		await expect(iconWrap).toHaveAttribute('aria-hidden', 'true');
	},
};

export const InteractiveClickEmits: Story = {
	tags: ['!autodocs', 'test'],
	args: { interactive: true },
	play: async ({ args, canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="icon-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('role', 'button');
		expectMinTargetSize(card, 24);
		await userEvent.click(card);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

// Inline layout reflects on the root via `data-layout="inline"` so test code
// (and consumer CSS overrides) can target the variant deterministically. Also
// confirms the card still flows without horizontal overflow at every viewport.
export const InteractiveInlineLayout: Story = {
	tags: ['!autodocs', 'test'],
	args: { layout: 'inline' },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="icon-stat-card"]') as HTMLElement;
		await expect(card).toBeInTheDocument();
		await expect(card).toHaveAttribute('data-layout', 'inline');
		await expect(canvasElement.querySelector('[data-slot="stat-card-label"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="stat-card-value"]')).toBeInTheDocument();
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(card);
		});
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { IconStatCard, StatTrend, Icon },
		setup: () => ({ Package, ShoppingCart, Users }),
		template: `
      <div data-test-root class="p-2">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IconStatCard label="Active Projects" value="17">
            <template #icon>
              <div class="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <Icon :icon="Package" size="sm" />
              </div>
            </template>
            <template #trend><StatTrend :value="12.8" direction="up" /></template>
          </IconStatCard>
          <IconStatCard label="Orders" value="3,421">
            <template #icon>
              <div class="flex size-10 items-center justify-center rounded-lg bg-info/10 text-info">
                <Icon :icon="ShoppingCart" size="sm" />
              </div>
            </template>
            <template #trend><StatTrend :value="3.7" direction="up" /></template>
          </IconStatCard>
          <IconStatCard label="Churned" value="89">
            <template #icon>
              <div class="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Icon :icon="Users" size="sm" />
              </div>
            </template>
            <template #trend><StatTrend :value="2.1" direction="down" /></template>
          </IconStatCard>
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cards = root.querySelectorAll('[data-slot="icon-stat-card"]');
			await expect(cards.length).toBe(3);
		});
	},
};
