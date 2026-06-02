import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import BarChart from './BarChart.vue';
import { DEFAULT_BAR_COLORS, type BarChartData } from './bar-chart.js';
import { forEachViewport } from '../../../test-utils/playHelpers.js';

const customersData: BarChartData = {
	categories: ['Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025'],
	datasets: [
		{
			label: 'Paid product',
			color: DEFAULT_BAR_COLORS[0],
			data: [850, 1400, 1200, 900, 750, 1300, 1600],
		},
		{
			label: 'Checkout product',
			color: DEFAULT_BAR_COLORS[1],
			data: [950, 1700, 1500, 1300, 1000, 1250, 1800],
		},
	],
};

const singleDataset: BarChartData = {
	categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	datasets: [
		{ label: 'Visitors', color: DEFAULT_BAR_COLORS[0], data: [420, 380, 510, 470, 620, 290, 180] },
	],
};

const tripleDataset: BarChartData = {
	categories: ['Q1', 'Q2', 'Q3', 'Q4'],
	datasets: [
		{ label: 'Revenue', color: DEFAULT_BAR_COLORS[0], data: [12000, 18500, 22000, 31000] },
		{ label: 'Expenses', color: DEFAULT_BAR_COLORS[1], data: [9000, 12000, 14000, 16500] },
		{ label: 'Profit', color: DEFAULT_BAR_COLORS[2], data: [3000, 6500, 8000, 14500] },
	],
};

const meta = {
	title: 'Charts/BarChart',
	component: BarChart,
	tags: ['!autodocs'],
	args: {
		data: customersData,
		variant: 'default',
		height: 280,
		showLegend: true,
		showGridX: false,
		showGridY: true,
		stacked: false,
		horizontal: false,
	},
	argTypes: {
		variant: { control: 'select', options: ['default', 'rounded'] },
		height: { control: { type: 'number', min: 120, max: 600, step: 20 } },
		showLegend: { control: 'boolean' },
		showGridX: { control: 'boolean' },
		showGridY: { control: 'boolean' },
		stacked: { control: 'boolean' },
		horizontal: { control: 'boolean' },
		ariaLabel: { control: 'text' },
	},
	parameters: {
		docs: {
			description: {
				component:
					'Vertical or horizontal bar chart with optional stacking and rounded variants. Wraps Chart.js via vue-chartjs and exposes `role="img"` with an accessible name.',
			},
		},
	},
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = { args: { data: customersData, variant: 'default' } };

export const Rounded: Story = {
	args: { data: customersData, variant: 'rounded' },
	parameters: {
		docs: { description: { story: 'Rounded variant: 6 px corner radius on every bar.' } },
	},
};

export const SingleDataset: Story = {
	args: { data: singleDataset, variant: 'rounded' },
};

export const TripleDataset: Story = {
	args: { data: tripleDataset, variant: 'default' },
	parameters: {
		docs: { description: { story: 'Three grouped datasets — legend appears automatically.' } },
	},
};

export const Stacked: Story = {
	args: { data: customersData, variant: 'rounded', stacked: true },
};

export const Horizontal: Story = {
	args: { data: singleDataset, variant: 'rounded', horizontal: true, height: 320 },
};

export const Compact: Story = {
	args: { data: singleDataset, variant: 'rounded', height: 160 },
};

export const Tall: Story = {
	args: { data: customersData, height: 420 },
};

export const InCard: Story = {
	parameters: { docs: { description: { story: 'Wrapped in a Card container for dashboards.' } } },
	render: () => ({
		components: { BarChart },
		setup: () => ({ customersData }),
		template: `
      <div class="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <p class="font-semibold text-foreground">Customer activity</p>
            <p class="text-sm text-muted-foreground">Apr – Oct 2025</p>
          </div>
        </div>
        <BarChart :data="customersData" variant="rounded" :height="260" />
      </div>
    `,
	}),
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="bar-chart"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		// role="img" lives on the inner <canvas> (Chart.js stamps it there);
		// the wrapper is a generic container so we don't double-name the chart.
		const canvasEl = root.querySelector('canvas') as HTMLCanvasElement;
		await expect(canvasEl.getAttribute('role')).toBe('img');
	},
};

export const InteractiveAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { ariaLabel: 'Customer revenue by month' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const chart = canvas.getByRole('img', { name: 'Customer revenue by month' });
		await expect(chart).toBeInTheDocument();
	},
};

export const InteractiveAutoAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'When no `ariaLabel` is supplied, the component derives one from the dataset labels.',
			},
		},
	},
	args: { data: customersData },
	play: async ({ canvasElement }) => {
		// The accessible name now lives on the inner <canvas> rather than the
		// wrapper div — see InteractiveDataSlot above.
		const canvasEl = canvasElement.querySelector(
			'[data-slot="bar-chart"] canvas',
		) as HTMLCanvasElement;
		const label = canvasEl.getAttribute('aria-label') ?? '';
		await expect(label.toLowerCase()).toContain('paid product');
		await expect(label.toLowerCase()).toContain('checkout product');
	},
};

export const InteractiveCanvasRendered: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvasEl = canvasElement.querySelector('canvas') as HTMLCanvasElement;
		await expect(canvasEl).toBeInTheDocument();
		const r = canvasEl.getBoundingClientRect();
		await expect(r.width).toBeGreaterThan(0);
		await expect(r.height).toBeGreaterThan(0);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { data: customersData },
	render: (args) => ({
		components: { BarChart },
		setup: () => ({ args }),
		template: `
      <div data-test-root class="w-full overflow-hidden p-2">
        <BarChart v-bind="args" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			// Chart.js may briefly overshoot its container while resizing — assert
			// on the chart wrapper itself, not the page-level container.
			const chart = root.querySelector('[data-slot="bar-chart"]') as HTMLElement;
			const r = chart.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.width).toBeLessThanOrEqual(root.clientWidth + 1);
		});
	},
};
