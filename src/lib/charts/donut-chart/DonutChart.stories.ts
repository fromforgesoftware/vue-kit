import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import DonutChart from './DonutChart.vue';
import DonutChartLegend from './DonutChartLegend.vue';
import { DEFAULT_DONUT_COLORS, type DonutSegment } from './donut-chart.js';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const jobSegments: DonutSegment[] = [
	{ value: 100, label: 'Active', color: DEFAULT_DONUT_COLORS[0] },
	{ value: 48, label: 'In review', color: DEFAULT_DONUT_COLORS[1] },
	{ value: 26, label: 'Finished', color: DEFAULT_DONUT_COLORS[2] },
];

const jobStatusSegments: DonutSegment[] = [
	{ value: 10, label: 'Open', color: DEFAULT_DONUT_COLORS[0] },
	{ value: 4, label: 'Hold', color: DEFAULT_DONUT_COLORS[1] },
	{ value: 4, label: 'Close', color: DEFAULT_DONUT_COLORS[2] },
	{ value: 2, label: 'Draft', color: DEFAULT_DONUT_COLORS[3] },
];

const activitySegments: DonutSegment[] = [
	{ value: 140, label: 'Blue', color: DEFAULT_DONUT_COLORS[0] },
	{ value: 180, label: 'Orange', color: DEFAULT_DONUT_COLORS[1] },
	{ value: 55, label: 'Pink', color: DEFAULT_DONUT_COLORS[2] },
	{ value: 40, label: 'Teal', color: DEFAULT_DONUT_COLORS[3] },
];

const meta = {
	title: 'Charts/DonutChart',
	component: DonutChart,
	tags: ['!autodocs'],
	args: {
		segments: jobSegments,
		centerText: '174',
		centerLabel: 'Total',
		variant: 'default',
		size: 160,
		cutout: 70,
		showDataLabels: false,
	},
	argTypes: {
		variant: { control: 'select', options: ['default', 'legend-bottom', 'minimal'] },
		size: { control: { type: 'number', min: 80, max: 320, step: 8 } },
		cutout: { control: { type: 'number', min: 0, max: 95, step: 5 } },
		showDataLabels: { control: 'boolean' },
		ariaLabel: { control: 'text' },
	},
	parameters: {
		docs: {
			description: {
				component:
					'Donut / pie chart with optional centre content and three legend variants. Wraps Chart.js via vue-chartjs and exposes `role="img"` plus an accessible name.',
			},
		},
	},
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {
	args: { segments: jobSegments, centerText: '174', centerLabel: 'Total jobs', variant: 'default' },
};

export const LegendBottom: Story = {
	args: {
		segments: jobStatusSegments,
		centerText: '20',
		centerLabel: 'Total jobs',
		variant: 'legend-bottom',
	},
};

export const Minimal: Story = {
	args: {
		segments: activitySegments,
		centerText: '415.236',
		centerLabel: 'Total activity',
		variant: 'minimal',
		size: 180,
	},
};

export const WithDataLabels: Story = {
	args: {
		segments: jobSegments,
		centerText: '174',
		centerLabel: 'Total jobs',
		variant: 'default',
		showDataLabels: true,
	},
};

export const CustomCenter: Story = {
	render: () => ({
		components: { DonutChart },
		setup: () => ({ jobSegments }),
		template: `
      <DonutChart :segments="jobSegments" variant="default">
        <template #center>
          <span class="text-3xl font-bold text-foreground">174</span>
          <span class="mt-0.5 text-xs text-muted-foreground">Total jobs</span>
          <span class="text-2xs font-medium text-success">+12%</span>
        </template>
      </DonutChart>
    `,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { DonutChart },
		setup: () => ({ jobSegments }),
		template: `
      <div class="flex flex-wrap items-center gap-8">
        <DonutChart :segments="jobSegments" center-text="174" center-label="Small" variant="minimal" :size="100" />
        <DonutChart :segments="jobSegments" center-text="174" center-label="Default" variant="minimal" :size="160" />
        <DonutChart :segments="jobSegments" center-text="174" center-label="Large" variant="minimal" :size="220" />
      </div>
    `,
	}),
};

export const CutoutComparison: Story = {
	render: () => ({
		components: { DonutChart },
		setup: () => ({ activitySegments }),
		template: `
      <div class="flex flex-wrap items-center gap-8">
        <DonutChart :segments="activitySegments" center-label="Pie (0%)" variant="minimal" :size="140" :cutout="0" />
        <DonutChart :segments="activitySegments" center-label="50%" variant="minimal" :size="140" :cutout="50" />
        <DonutChart :segments="activitySegments" center-label="70%" variant="minimal" :size="140" :cutout="70" />
        <DonutChart :segments="activitySegments" center-label="85%" variant="minimal" :size="140" :cutout="85" />
      </div>
    `,
	}),
};

export const Empty: Story = {
	args: { segments: [], centerText: '0', centerLabel: 'No data', variant: 'default' },
};

export const StandaloneLegend: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The DonutChartLegend can be rendered independently — handy for grouping multiple charts under one legend.',
			},
		},
	},
	render: () => ({
		components: { DonutChartLegend },
		setup: () => ({ jobSegments }),
		template: `
      <div class="flex flex-col gap-6">
        <div>
          <p class="mb-2 text-xs text-muted-foreground">variant: default (right)</p>
          <DonutChartLegend :segments="jobSegments" variant="default" />
        </div>
        <div>
          <p class="mb-2 text-xs text-muted-foreground">variant: legend-bottom</p>
          <DonutChartLegend :segments="jobSegments" variant="legend-bottom" />
        </div>
      </div>
    `,
	}),
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	args: { segments: jobSegments },
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="donut-chart"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="donut-chart-canvas"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="donut-chart-legend"]')).not.toBeNull();
		const items = canvasElement.querySelectorAll('[data-slot="donut-chart-legend-item"]');
		await expect(items.length).toBe(jobSegments.length);
	},
};

export const InteractiveAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { segments: jobSegments, ariaLabel: 'Job pipeline' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const chart = canvas.getByRole('img', { name: 'Job pipeline' });
		await expect(chart).toBeInTheDocument();
	},
};

export const InteractiveAutoAccessibleName: Story = {
	tags: ['!autodocs', 'test'],
	args: { segments: jobSegments },
	play: async ({ canvasElement }) => {
		// The accessible name lives on the inner <canvas>, not the wrapper —
		// see BarChart.InteractiveDataSlot for rationale.
		const canvasEl = canvasElement.querySelector(
			'[data-slot="donut-chart"] canvas',
		) as HTMLCanvasElement;
		const label = canvasEl.getAttribute('aria-label') ?? '';
		await expect(label.toLowerCase()).toContain('active');
		await expect(label).toContain('100');
	},
};

export const InteractiveMinimalVariantHidesLegend: Story = {
	tags: ['!autodocs', 'test'],
	args: { segments: activitySegments, variant: 'minimal' },
	play: async ({ canvasElement }) => {
		const legend = canvasElement.querySelector('[data-slot="donut-chart-legend"]');
		await expect(legend).toBeNull();
	},
};

export const InteractiveCanvasRendered: Story = {
	tags: ['!autodocs', 'test'],
	args: { segments: jobSegments },
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
	render: () => ({
		components: { DonutChart },
		setup: () => ({ jobSegments }),
		template: `
      <div data-test-root class="p-2">
        <DonutChart :segments="jobSegments" center-text="174" center-label="Total" variant="legend-bottom" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const chart = root.querySelector('[data-slot="donut-chart"]') as HTMLElement;
			const r = chart.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
		});
	},
};
