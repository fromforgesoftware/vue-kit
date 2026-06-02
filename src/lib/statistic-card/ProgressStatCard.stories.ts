import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import ProgressStatCard from './ProgressStatCard.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../test-utils/playHelpers';

const ALL_VARIANTS = ['default', 'muted', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;
const ALL_STATUSES = ['default', 'success', 'warning', 'destructive'] as const;

const meta = {
	title: 'Statistic Card/ProgressStatCard',
	component: ProgressStatCard,
	tags: ['!autodocs'],
	argTypes: {
		label: { control: 'text' },
		value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
		description: { control: 'text' },
		secondaryText: { control: 'text' },
		statusLabel: { control: 'text' },
		status: {
			control: 'select',
			options: ALL_STATUSES,
			description: 'Drives the bar colour and the inline status label tone.',
		},
		variant: { control: 'select', options: ALL_VARIANTS, description: 'Surface style.' },
		size: { control: 'select', options: ALL_SIZES, description: 'Density.' },
		interactive: { control: 'boolean' },
		loading: { control: 'boolean' },
		onClick: { action: 'click' },
	},
	args: {
		label: 'API Call Quota',
		value: 40,
		description: '3000 free calls left',
		secondaryText: 'of 5000 monthly quota',
		status: 'default',
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
					'StatCard with an embedded progress bar showing value vs target. Use for quotas, capacity, completion. See StatCard for plain metrics, ColoredStatCard for tinted hero metrics.',
			},
		},
	},
	render: (args) => ({
		components: { ProgressStatCard },
		setup: () => ({ args }),
		template: `<ProgressStatCard v-bind="args" class="w-full max-w-96" @click="args.onClick" />`,
	}),
} satisfies Meta<typeof ProgressStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	render: () => ({
		components: { ProgressStatCard },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-3 max-w-md">
        <ProgressStatCard
          v-for="v in ALL_VARIANTS"
          :key="v"
          :variant="v"
          :label="v"
          :value="60"
          description="60% used"
        />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { ProgressStatCard },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-3 max-w-md">
        <ProgressStatCard
          v-for="s in ALL_SIZES"
          :key="s"
          :size="s"
          :label="'size: ' + s"
          :value="42"
        />
      </div>
    `,
	}),
};

export const StatusVariants: Story = {
	name: 'Status Variants',
	parameters: {
		docs: {
			description: {
				story:
					'Status drives both the progress bar colour and the status label tone. Use semantic meaning: `success` for healthy, `warning` for approaching limit, `destructive` for critical.',
			},
		},
	},
	render: () => ({
		components: { ProgressStatCard },
		template: `
      <div class="flex flex-col gap-4 max-w-md">
        <ProgressStatCard label="Storage" :value="95" description="4.75 GB used" secondary-text="of 5 GB" status="success" status-label="Healthy" />
        <ProgressStatCard label="Bandwidth" :value="72" description="7.2 TB used" secondary-text="of 10 TB" status="warning" status-label="Approaching limit" />
        <ProgressStatCard label="CPU Usage" :value="92" description="92% utilized" status="destructive" status-label="Critical" />
        <ProgressStatCard label="Memory" :value="45" description="3.6 GB used" secondary-text="of 8 GB" status="default" />
      </div>
    `,
	}),
};

export const WithActionAndFooter: Story = {
	name: 'With Action + Summary + Footer',
	render: () => ({
		components: { ProgressStatCard },
		template: `
      <ProgressStatCard
        label="API Call Quota"
        :value="40"
        description="3000 free calls left"
        secondary-text="of 5000 monthly quota"
        class="w-full max-w-96"
      >
        <template #header-right>
          <button class="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            View API usage
          </button>
        </template>
        <template #summary>
          <span>Used calls: <strong>2000</strong></span>
          <span class="font-semibold">$4.00</span>
        </template>
        <template #footer>
          <div class="flex items-center justify-between">
            <span>Quota renews on</span>
            <strong class="text-foreground">September 1, 2025</strong>
          </div>
        </template>
      </ProgressStatCard>
    `,
	}),
};

export const Interactive: Story = {
	args: { interactive: true },
};

export const Loading: Story = {
	args: { loading: true, label: 'API Quota', value: 0 },
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="progress-stat-card"]') as HTMLElement;
		await expect(card).toBeInTheDocument();
		await expect(card.tagName).toBe('ARTICLE');
		await expect(canvasElement.querySelector('[data-slot="stat-card-label"]')).toBeInTheDocument();
		await expect(
			canvasElement.querySelector('[data-slot="stat-card-progress"]'),
		).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="progress"]')).toBeInTheDocument();
	},
};

export const InteractiveProgressAriaAttributes: Story = {
	tags: ['!autodocs', 'test'],
	args: { value: 65, label: 'Storage' },
	play: async ({ canvasElement }) => {
		const progress = canvasElement.querySelector('[data-slot="progress"]') as HTMLElement;
		// Reka ProgressRoot exposes aria-valuenow / valuemin / valuemax automatically.
		await expect(progress).toHaveAttribute('aria-valuenow', '65');
		await expect(progress).toHaveAttribute('aria-valuemin', '0');
		await expect(progress).toHaveAttribute('aria-valuemax', '100');
	},
};

export const InteractiveStatusColoursProgress: Story = {
	tags: ['!autodocs', 'test'],
	args: { status: 'destructive', statusLabel: 'Critical', value: 92 },
	play: async ({ canvasElement }) => {
		const indicator = canvasElement.querySelector(
			'[data-slot="progress-indicator"]',
		) as HTMLElement;
		await expect(indicator.className).toContain('bg-destructive');
		const status = canvasElement.querySelector('[data-slot="stat-card-status"]') as HTMLElement;
		await expect(status.className).toContain('text-destructive');
	},
};

export const InteractiveClickEmits: Story = {
	tags: ['!autodocs', 'test'],
	args: { interactive: true },
	play: async ({ args, canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="progress-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('role', 'button');
		expectMinTargetSize(card, 24);
		await userEvent.click(card);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const InteractiveLoadingShowsSkeleton: Story = {
	tags: ['!autodocs', 'test'],
	args: { loading: true, label: 'Quota', value: 0 },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-slot="progress-stat-card"]') as HTMLElement;
		await expect(card).toHaveAttribute('aria-busy', 'true');
		await expect(canvasElement.querySelector('.animate-pulse')).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ProgressStatCard },
		template: `
      <div data-test-root class="p-2">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgressStatCard label="Storage" :value="95" description="4.75 GB used" secondary-text="of 5 GB" status="success" status-label="Healthy" />
          <ProgressStatCard label="CPU" :value="92" description="92% utilized" status="destructive" status-label="Critical" />
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cards = root.querySelectorAll('[data-slot="progress-stat-card"]');
			await expect(cards.length).toBe(2);
		});
	},
};
