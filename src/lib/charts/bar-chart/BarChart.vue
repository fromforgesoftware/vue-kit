<template>
	<!--
    Chart.js gives its inner <canvas> role="img"; we surface the accessible name
    on that canvas directly (rather than on a wrapper) so AT sees a single named
    image, matching axe's role-img-alt expectations.
  -->
	<div data-slot="bar-chart" :class="wrapperClasses" :style="{ height: `${height}px` }">
		<Bar
			:data="chartData"
			:options="options"
			:plugins="inlinePlugins"
			:aria-label="resolvedAriaLabel"
			:aria-describedby="ariaDescribedBy"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	BarController,
	LineElement,
	LineController,
	PointElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import type { Chart, ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { cn } from '../../../helpers/cn.js';
import { resolveCssColor } from '../../../helpers/resolveCssColor.js';
import { useResponsive } from '../../../composables/useResponsive.js';
import {
	barChartVariants,
	type BarChartData,
	type BarChartVariant,
	type LineOverlay,
} from './bar-chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	BarController,
	LineElement,
	LineController,
	PointElement,
	Title,
	Tooltip,
	Legend,
);

interface Props {
	/** Chart data with categories and datasets */
	data: BarChartData;
	/** Visual variant */
	variant?: BarChartVariant;
	/** Chart height in pixels */
	height?: number;
	/** Show legend */
	showLegend?: boolean;
	/** Show x-axis grid lines */
	showGridX?: boolean;
	/** Show y-axis grid lines */
	showGridY?: boolean;
	/** Stacked bars */
	stacked?: boolean;
	/** Horizontal orientation */
	horizontal?: boolean;
	/**
	 * Dashed reference line drawn at a fixed value on the value axis (e.g. a
	 * target or threshold). Color resolves CSS variables; defaults to
	 * `--color-muted-foreground`. The optional label renders above the line.
	 */
	referenceLine?: { value: number; label?: string; color?: string };
	/**
	 * Per-category line overlays drawn on top of the bars. Each overlay's `data` array
	 * length must match `data.categories`. Use this for target curves, max-count lines,
	 * moving averages, etc. Combines with the bar datasets in the same legend / tooltip.
	 */
	lineOverlays?: LineOverlay[];
	/** Chart.js-compatible options to merge/override */
	chartOptions?: Partial<ChartOptions<'bar'>>;
	/** Accessible name announced to assistive tech (`aria-label` on the chart container). */
	ariaLabel?: string;
	/** Longer description for screen readers (linked via `aria-describedby`). */
	ariaDescribedBy?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
	height: 280,
	showLegend: true,
	showGridX: false,
	showGridY: true,
	stacked: false,
	horizontal: false,
	referenceLine: undefined,
	lineOverlays: () => [],
	chartOptions: undefined,
	ariaLabel: undefined,
	ariaDescribedBy: undefined,
});

const { isMobile } = useResponsive();

const isRounded = computed(() => props.variant === 'rounded');

const chartData = computed(() => {
	// Bar datasets — typed-cast at the chart-data level since we mix line datasets in below.
	const barDatasets = props.data.datasets.map((ds) => {
		const color = resolveCssColor(ds.color);
		return {
			type: 'bar' as const,
			label: ds.label,
			data: ds.data,
			backgroundColor: color,
			borderColor: color,
			borderWidth: 0,
			borderRadius: isRounded.value ? 6 : 2,
			...(props.stacked ? { stack: 'stack-1' } : {}),
			...(ds.options ?? {}),
		};
	});

	// Line overlays — drawn on top of bars (`order: 0` puts them above; chart.js draws
	// higher `order` first). Always linear interpolation unless tension is set.
	const lineDatasets = (props.lineOverlays ?? []).map((line) => {
		const color = resolveCssColor(line.color);
		return {
			type: 'line' as const,
			label: line.label,
			data: line.data,
			borderColor: color,
			backgroundColor: color,
			borderWidth: line.borderWidth ?? 2,
			borderDash: line.borderDash,
			tension: line.tension ?? 0,
			pointRadius: line.showPoints === false ? 0 : 3,
			pointHoverRadius: line.showPoints === false ? 0 : 4,
			pointBackgroundColor: color,
			pointBorderColor: color,
			fill: false,
			// Render lines on top of bars.
			order: 0,
		};
	});

	// Bars get a higher draw order so they paint first (lines float above).
	const orderedBars = barDatasets.map((b) => ({ ...b, order: 1 }));

	return {
		labels: props.data.categories,
		// Mixed bar + line datasets; cast to satisfy the strict ChartDataset union.
		datasets: [...orderedBars, ...lineDatasets] as unknown as ChartDataset<'bar'>[],
	};
});

const options = computed<ChartOptions<'bar'>>(() => {
	const indexAxis = props.horizontal ? ('y' as const) : ('x' as const);
	const valueAxis = props.horizontal ? ('x' as const) : ('y' as const);

	const basePlugins: ChartOptions<'bar'>['plugins'] = {
		legend: {
			display:
				props.showLegend && props.data.datasets.length + (props.lineOverlays?.length ?? 0) > 1,
			// Mobile: legend stacked below the chart so labels don't truncate;
			// desktop keeps the wider top placement.
			position: isMobile.value ? 'bottom' : 'top',
			labels: {
				usePointStyle: true,
				pointStyle: 'rectRounded',
				padding: 16,
			},
		},
		tooltip: {
			enabled: true,
			backgroundColor: resolveCssColor('var(--color-popover)'),
			titleColor: resolveCssColor('var(--color-popover-foreground)'),
			bodyColor: resolveCssColor('var(--color-popover-foreground)'),
			titleFont: { size: 12 },
			bodyFont: { size: 12 },
			padding: 10,
			cornerRadius: 6,
		},
	};

	const baseScales: ChartOptions<'bar'>['scales'] = {
		[indexAxis]: { grid: { display: props.showGridX }, stacked: props.stacked },
		[valueAxis]: { beginAtZero: true, grid: { display: props.showGridY }, stacked: props.stacked },
	};

	if (props.chartOptions) {
		const { plugins: extraPlugins, scales: extraScales, ...rest } = props.chartOptions;
		return {
			responsive: true,
			maintainAspectRatio: false,
			indexAxis,
			interaction: { mode: 'index', intersect: false },
			plugins: extraPlugins ? { ...basePlugins, ...extraPlugins } : basePlugins,
			scales: extraScales ? { ...baseScales, ...extraScales } : baseScales,
			...rest,
		};
	}

	return {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis,
		interaction: { mode: 'index', intersect: false },
		plugins: basePlugins,
		scales: baseScales,
	};
});

// Auto-derive a reasonable accessible name when the consumer doesn't supply one
// — list the datasets so screen readers know what's plotted. Charts must always
// have an accessible name; canvas is opaque to assistive tech otherwise.
const resolvedAriaLabel = computed(() => {
	if (props.ariaLabel) return props.ariaLabel;
	const datasets = props.data.datasets.map((d) => d.label).join(', ');
	return `Bar chart: ${datasets}`;
});

// Inline plugin that draws a dashed reference line + optional label on the
// value axis. Using a custom plugin (rather than chartjs-plugin-annotation)
// avoids adding a dependency for what's effectively a few canvas ops.
const referenceLinePlugin = computed<Plugin<'bar'> | null>(() => {
	const ref = props.referenceLine;
	if (!ref) return null;
	const color = resolveCssColor(ref.color ?? 'var(--color-muted-foreground)');
	return {
		id: 'tradingBotReferenceLine',
		afterDatasetsDraw(chart: Chart<'bar'>) {
			const valueAxisId = props.horizontal ? 'x' : 'y';
			const indexAxisId = props.horizontal ? 'y' : 'x';
			const valueScale = chart.scales[valueAxisId];
			const indexScale = chart.scales[indexAxisId];
			if (!valueScale || !indexScale) return;
			const ctx = chart.ctx;
			const pos = valueScale.getPixelForValue(ref.value);
			const a = indexScale.left;
			const b = indexScale.right;
			ctx.save();
			ctx.beginPath();
			ctx.setLineDash([6, 6]);
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = color;
			if (props.horizontal) {
				ctx.moveTo(pos, indexScale.top);
				ctx.lineTo(pos, indexScale.bottom);
			} else {
				ctx.moveTo(a, pos);
				ctx.lineTo(b, pos);
			}
			ctx.stroke();
			if (ref.label) {
				ctx.setLineDash([]);
				ctx.fillStyle = color;
				ctx.font = '11px sans-serif';
				ctx.textBaseline = 'bottom';
				ctx.textAlign = 'right';
				if (props.horizontal) {
					ctx.textBaseline = 'top';
					ctx.fillText(ref.label, pos - 4, indexScale.top + 2);
				} else {
					ctx.fillText(ref.label, b - 4, pos - 4);
				}
			}
			ctx.restore();
		},
	};
});

const inlinePlugins = computed(() =>
	referenceLinePlugin.value ? [referenceLinePlugin.value] : [],
);

const wrapperClasses = computed(() =>
	cn(barChartVariants({ variant: props.variant }), props.class),
);
</script>
