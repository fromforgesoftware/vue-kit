import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { BarChart3, Users, TrendingUp, ArrowRight, Ellipsis } from '@lucide/vue';
import ColoredStatCard from './ColoredStatCard.vue';
import StatTrend from '../general/stat-trend/StatTrend.vue';
import Icon from '../general/icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../test-utils/playHelpers';

const ALL_TONES = ['dark', 'primary', 'success', 'warning', 'destructive', 'info'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Statistic Card/ColoredStatCard',
	component: ColoredStatCard,
	tags: ['!autodocs'],
	argTypes: {
		label: { control: 'text' },
		value: { control: 'text' },
		unit: { control: 'text' },
		description: { control: 'text' },
		tone: {
			control: 'select',
			options: ALL_TONES,
			description: 'Tints the entire card. Pick the tone that matches the metric semantics.',
		},
		size: { control: 'select', options: ALL_SIZES },
		interactive: { control: 'boolean', description: 'Treat the card as a clickable surface.' },
		loading: { control: 'boolean' },
		onClick: { action: 'click' },
	},
	args: {
		label: 'Total Sales',
		value: '$892.2M',
		tone: 'dark',
		size: 'default',
		interactive: false,
		loading: false,
		onClick: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'StatCard with a tinted surface. Use to highlight a single hero metric or a set of categorised KPIs. See StatCard for the neutral surface.',
			},
		},
		// Brand exception: the trend chip uses semantic colour (text-success /
		// text-destructive on a soft tint). When the card itself is coloured,
		// the chip background blends with the parent and the red/green text
		// can drop below 4.5:1. This is intentional brand-decorative
		// composition — consumers who need WCAG-strict trend on coloured cards
		// should pass `tone="solid"` to the StatTrend.
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
	},
	render: (args) => ({
		components: { ColoredStatCard, StatTrend, Icon },
		setup: () => ({ args, Ellipsis }),
		// Note: a nested <button> inside the action slot when the card itself is
		// interactive would create a nested-interactive a11y violation. Real
		// consumers either make the whole card clickable, or expose an action
		// affordance — not both at once.
		template: `
      <ColoredStatCard v-bind="args" class="w-64" @click="args.onClick">
        <template v-if="!args.interactive" #action>
          <button class="rounded-md p-1 hover:bg-current/10" aria-label="More">
            <Icon :icon="Ellipsis" size="sm" class="opacity-70" />
          </button>
        </template>
        <template #trend><StatTrend :value="0.2" direction="up" /></template>
        <template #footer>Vs last month: <strong>$889.1M</strong></template>
      </ColoredStatCard>
    `,
	}),
} satisfies Meta<typeof ColoredStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Tones: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Six tones — `dark`, `primary`, `success`, `warning`, `destructive`, `info`. Match the tone to the metric meaning, not for aesthetic variety.',
			},
		},
	},
	render: () => ({
		components: { ColoredStatCard, StatTrend, Icon },
		setup: () => ({ Ellipsis, ALL_TONES }),
		template: `
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ColoredStatCard v-for="t in ALL_TONES" :key="t" :tone="t" :label="t" value="$892.2M">
          <template #trend><StatTrend :value="0.2" direction="up" /></template>
          <template #footer>Vs last month</template>
        </ColoredStatCard>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { ColoredStatCard },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ColoredStatCard v-for="s in ALL_SIZES" :key="s" :size="s" :label="'size: ' + s" value="$120k" />
      </div>
    `,
	}),
};

export const ShowcaseWithCTA: Story = {
	name: 'Showcase with Icon + CTA',
	parameters: {
		docs: {
			description: {
				story:
					'Use the `icon`, `description`, and `footer` slots together for a prominent showcase variant.',
			},
		},
	},
	render: () => ({
		components: { ColoredStatCard, Icon },
		setup: () => ({ BarChart3, Users, TrendingUp, ArrowRight }),
		template: `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ColoredStatCard label="NPS Improvement" value="27.3%" tone="primary" description="Our new onboarding flow increased Net Promoter Score by 27.3% in Q2.">
          <template #icon><Icon :icon="BarChart3" size="default" class="opacity-80" /></template>
          <template #footer>
            <a href="#" class="flex items-center justify-between text-sm font-medium opacity-90 hover:opacity-100">
              Read full story
              <Icon :icon="ArrowRight" size="sm" />
            </a>
          </template>
        </ColoredStatCard>
        <ColoredStatCard label="Active Users" value="8,200" tone="success" description="Highest monthly active users since launch. Engagement up 12% MoM.">
          <template #icon><Icon :icon="Users" size="default" class="opacity-80" /></template>
          <template #footer>
            <a href="#" class="flex items-center justify-between text-sm font-medium opacity-90 hover:opacity-100">
              See user insights
              <Icon :icon="ArrowRight" size="sm" />
            </a>
          </template>
        </ColoredStatCard>
        <ColoredStatCard label="ARR Growth" value="$1.4M" tone="info" description="Annual recurring revenue grew by $1.4M in the last quarter.">
          <template #icon><Icon :icon="TrendingUp" size="default" class="opacity-80" /></template>
          <template #footer>
            <a href="#" class="flex items-center justify-between text-sm font-medium opacity-90 hover:opacity-100">
              View ARR breakdown
              <Icon :icon="ArrowRight" size="sm" />
            </a>
          </template>
        </ColoredStatCard>
      </div>
    `,
	}),
};

export const Interactive: Story = {
	args: { interactive: true },
	parameters: {
		docs: {
			description: {
				story:
					'Set `interactive` to make the card clickable — emits `click` and is keyboard-activatable.',
			},
		},
	},
};

export const Loading: Story = {
	args: { loading: true, tone: 'dark' },
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="colored-stat-card"]') as HTMLElement;
		await expect(card).toBeInTheDocument();
		await expect(card.tagName).toBe('ARTICLE');
		await expect(canvasElement.querySelector('[data-slot="stat-card-value"]')).toBeInTheDocument();
	},
};

export const InteractiveToneAppliesBackground: Story = {
	tags: ['!autodocs', 'test'],
	args: { tone: 'success', label: 'Sales', value: '$892M' },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="colored-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('data-tone', 'success');
		await expect(card.className).toContain('bg-success');
		await expect(card.className).toContain('text-success-foreground');
	},
};

export const InteractiveLegacyColorAlias: Story = {
	tags: ['!autodocs', 'test'],
	// `tone` overrides `color`, so we explicitly clear `tone` to verify the
	// legacy `color` alias still resolves the surface tone.
	args: { tone: undefined, color: 'destructive', label: 'Refunds', value: '320' },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="colored-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('data-tone', 'destructive');
		await expect(card.className).toContain('bg-destructive');
	},
};

export const InteractiveClickEmits: Story = {
	tags: ['!autodocs', 'test'],
	args: { interactive: true },
	play: async ({ args, canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="colored-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('role', 'button');
		expectMinTargetSize(card, 24);
		await userEvent.click(card);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const InteractiveLoadingShowsSkeleton: Story = {
	tags: ['!autodocs', 'test'],
	args: { loading: true, label: 'Sales', value: '$892M' },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="colored-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('aria-busy', 'true');
		await expect(canvasElement.querySelector('.animate-pulse')).toBeInTheDocument();
		const sr = canvasElement.querySelector('.sr-only') as HTMLElement;
		await expect(sr.textContent).toContain('Loading Sales');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ColoredStatCard, StatTrend },
		setup: () => ({ ALL_TONES }),
		template: `
      <div data-test-root class="p-2">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColoredStatCard v-for="t in ALL_TONES" :key="t" :tone="t" :label="t" value="42">
            <template #trend><StatTrend :value="3.7" direction="up" /></template>
          </ColoredStatCard>
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cards = root.querySelectorAll('[data-slot="colored-stat-card"]');
			await expect(cards.length).toBe(6);
		});
	},
};
