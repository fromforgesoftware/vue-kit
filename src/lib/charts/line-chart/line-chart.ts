import { cva, type VariantProps } from 'class-variance-authority';

export interface LineDataset {
	label: string;
	data: number[];
	/** Line/point colour. Prefer the chart-token CSS variables: `var(--color-chart-1)` … */
	color: string;
	/** Render as a dashed reference line (e.g. a target). */
	dashed?: boolean;
	/** Chart.js dataset options (tension, fill, pointRadius, etc.) — escape hatch. */
	options?: Record<string, unknown>;
}

export interface LineChartData {
	categories: string[];
	datasets: LineDataset[];
}

export const lineChartVariants = cva('relative w-full', {
	variants: {
		variant: {
			default: '',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type LineChartVariants = VariantProps<typeof lineChartVariants>;
export type LineChartVariant = NonNullable<LineChartVariants['variant']>;
