import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

/** A single segment of the donut — value, label, and colour. */
export interface DonutSegment {
	value: number;
	label: string;
	/** Segment colour. Prefer the chart-token CSS variables. */
	color: string;
}

/** Default chart-token palette; consumers using this constant pick up theme tokens automatically. */
export const DEFAULT_DONUT_COLORS = [
	'var(--color-chart-1)',
	'var(--color-chart-2)',
	'var(--color-chart-3)',
	'var(--color-chart-4)',
	'var(--color-chart-5)',
] as const;

/** Layout variants — `default` legend on the side, `legend-bottom` underneath, `minimal` no legend. */
export const donutChartVariants = cva('flex items-center', {
	variants: {
		variant: {
			default: 'flex-row gap-6',
			'legend-bottom': 'flex-col gap-4',
			minimal: 'flex-col',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

/** Legend layout — paired with the matching `donutChartVariants` variant. */
export const donutLegendVariants = cva('flex flex-wrap', {
	variants: {
		variant: {
			default: 'flex-col gap-2',
			'legend-bottom': 'flex-row justify-center gap-x-6 gap-y-1',
			minimal: 'hidden',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type DonutChartVariants = VariantProps<typeof donutChartVariants>;
export type DonutChartVariant = NonNullable<DonutChartVariants['variant']>;

/** Injection key — `DonutChart` provides this so child legend can read the active variant. */
export const DONUT_CHART_VARIANT_KEY: InjectionKey<Ref<DonutChartVariant>> =
	Symbol('donut-chart-variant');
