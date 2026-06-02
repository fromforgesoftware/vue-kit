import { cva, type VariantProps } from 'class-variance-authority';
import type { BarControllerDatasetOptions } from 'chart.js';

/** A single dataset in a bar chart — values, label, and per-bar colour. */
export interface BarDataset {
	label: string;
	data: number[];
	/** Bar colour. Prefer the chart-token CSS variables: `var(--color-chart-1)` … `var(--color-chart-5)`. */
	color: string;
	/** Render this dataset as a line overlay instead of bars */
	type?: 'bar' | 'line';
	/** Override individual bar dataset options (borderRadius, borderWidth, stack, etc.) */
	options?: Partial<BarControllerDatasetOptions>;
}

/**
 * Per-category line overlay rendered on top of the bars (e.g. a target curve, a max-count line,
 * or a moving average). Length must match `BarChartData.categories`. Drawn after the bars so
 * it appears in front; participates in tooltips alongside bar datasets.
 */
export interface LineOverlay {
	label: string;
	data: number[];
	/** Line colour. Use `var(--color-chart-N)` tokens. */
	color: string;
	/** Stroke width in pixels (default `2`). */
	borderWidth?: number;
	/** Show point markers at each category (default `true`). */
	showPoints?: boolean;
	/** Smooth (curved) line using cubic interpolation (default `false`). */
	tension?: number;
	/** Dashed line: `[6, 4]` style array. Defaults to solid. */
	borderDash?: number[];
}

/** Top-level data shape passed to {@link BarChart}. */
export interface BarChartData {
	/** Category labels for the index axis (x by default, y when `horizontal`). */
	categories: string[];
	/** One or more datasets (grouped or stacked bars). */
	datasets: BarDataset[];
}

/** Default chart-token palette; theme tokens auto-apply, consumers can override per dataset. */
export const DEFAULT_BAR_COLORS = [
	'var(--color-chart-1)',
	'var(--color-chart-2)',
	'var(--color-chart-3)',
	'var(--color-chart-4)',
	'var(--color-chart-5)',
] as const;

/** Container variants for {@link BarChart}. `rounded` softens the bar corners. */
export const barChartVariants = cva('relative w-full', {
	variants: {
		variant: {
			default: '',
			rounded: '',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type BarChartVariants = VariantProps<typeof barChartVariants>;
export type BarChartVariant = NonNullable<BarChartVariants['variant']>;
