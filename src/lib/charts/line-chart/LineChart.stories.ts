import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import LineChart from './LineChart.vue';
import type { LineChartData } from './line-chart.js';
import { forEachViewport } from '../../../test-utils/playHelpers.js';

const temperatureData: LineChartData = {
	categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	datasets: [
		{
			label: 'Sensor A',
			color: 'var(--color-chart-1)',
			data: [18, 19, 21, 17, 22, 20, 23],
		},
		{
			label: 'Reference',
			color: 'var(--color-muted-foreground)',
			data: [20, 20, 20, 20, 20, 20, 20],
			dashed: true,
		},
	],
};

const singleDataset: LineChartData = {
	categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
	datasets: [
		{
			label: 'Series A',
			color: 'var(--color-chart-2)',
			data: [120, 145, 132, 178, 220, 265],
		},
	],
};

const multiDataset: LineChartData = {
	categories: ['Q1', 'Q2', 'Q3', 'Q4'],
	datasets: [
		{ label: 'Series A', color: 'var(--color-chart-1)', data: [12, 18, 22, 31] },
		{ label: 'Series B', color: 'var(--color-chart-2)', data: [9, 12, 14, 16] },
		{ label: 'Series C', color: 'var(--color-chart-3)', data: [3, 6, 8, 15] },
	],
};

const meta = {
	title: 'Charts/LineChart',
	component: LineChart,
	tags: ['!autodocs'],
	args: {
		data: temperatureData,
		variant: 'default',
		height: 280,
		showLegend: true,
		showGridX: false,
		showGridY: true,
	},
	argTypes: {
		variant: { control: 'select', options: ['default'] },
		height: { control: { type: 'number', min: 120, max: 600, step: 20 } },
		showLegend: { control: 'boolean' },
		showGridX: { control: 'boolean' },
		showGridY: { control: 'boolean' },
		yMin: { control: 'number' },
		yMax: { control: 'number' },
		ariaLabel: { control: 'text' },
	},
	parameters: {
		docs: {
			description: {
				component:
					'Line chart for trends over an evenly-spaced index axis. Wraps Chart.js via vue-chartjs and exposes `role="img"` with an accessible name. Datasets can be solid or dashed (e.g. as a reference line).',
			},
		},
	},
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { data: temperatureData } };

export const SingleDataset: Story = {
	args: { data: singleDataset },
	parameters: {
		docs: {
			description: {
				story: 'Single line — legend hides automatically when only one dataset is plotted.',
			},
		},
	},
};

export const MultipleDatasets: Story = {
	args: { data: multiDataset },
	parameters: {
		docs: {
			description: { story: 'Multiple grouped datasets; legend appears at the top automatically.' },
		},
	},
};

export const WithReferenceLine: Story = {
	args: { data: temperatureData, yMin: 0, yMax: 30 },
	parameters: {
		docs: {
			description: {
				story:
					'Pin the Y axis with `yMin` / `yMax` so the scale stays anchored regardless of the data range.',
			},
		},
	},
};

export const Compact: Story = {
	args: { data: singleDataset, height: 160 },
};

export const Tall: Story = {
	args: { data: multiDataset, height: 420 },
};

export const InCard: Story = {
	parameters: { docs: { description: { story: 'Wrapped in a Card container for dashboards.' } } },
	render: () => ({
		components: { LineChart },
		setup: () => ({ singleDataset }),
		template: `
      <div class="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
        <div class="mb-4">
          <p class="font-semibold text-foreground">Series A</p>
          <p class="text-sm text-muted-foreground">Jan – Jun</p>
        </div>
        <LineChart :data="singleDataset" :height="260" />
      </div>
    `,
	}),
};

export const InteractiveDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="line-chart"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		const canvasEl = root.querySelector('canvas') as HTMLCanvasElement;
		await expect(canvasEl.getAttribute('role')).toBe('img');
	},
};

export const InteractiveAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { ariaLabel: 'Series A and reference line over a week' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const chart = canvas.getByRole('img', { name: 'Series A and reference line over a week' });
		await expect(chart).toBeInTheDocument();
	},
};

export const InteractiveAutoAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'When no `ariaLabel` is supplied, the component derives one from dataset labels.',
			},
		},
	},
	args: { data: temperatureData },
	play: async ({ canvasElement }) => {
		const canvasEl = canvasElement.querySelector(
			'[data-slot="line-chart"] canvas',
		) as HTMLCanvasElement;
		const label = canvasEl.getAttribute('aria-label') ?? '';
		await expect(label.toLowerCase()).toContain('sensor a');
		await expect(label.toLowerCase()).toContain('reference');
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
	args: { data: temperatureData },
	render: (args) => ({
		components: { LineChart },
		setup: () => ({ args }),
		template: `
      <div data-test-root class="w-full overflow-hidden p-2">
        <LineChart v-bind="args" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			const chart = root.querySelector('[data-slot="line-chart"]') as HTMLElement;
			const r = chart.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.width).toBeLessThanOrEqual(root.clientWidth + 1);
		});
	},
};
