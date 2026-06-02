<template>
	<div data-slot="line-chart" :class="wrapperClasses" :style="{ height: `${height}px` }">
		<Line
			:data="chartData"
			:options="options"
			:aria-label="resolvedAriaLabel"
			:aria-describedby="ariaDescribedBy"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	LineElement,
	LineController,
	PointElement,
	Filler,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { cn } from '../../../helpers/cn.js';
import { resolveCssColor } from '../../../helpers/resolveCssColor.js';
import { useResponsive } from '../../../composables/useResponsive.js';
import { lineChartVariants, type LineChartData, type LineChartVariant } from './line-chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	LineElement,
	LineController,
	PointElement,
	Filler,
	Title,
	Tooltip,
	Legend,
);

interface Props {
	data: LineChartData;
	variant?: LineChartVariant;
	height?: number;
	showLegend?: boolean;
	showGridX?: boolean;
	showGridY?: boolean;
	/** Y axis lower bound (defaults to auto). */
	yMin?: number;
	/** Y axis upper bound (defaults to auto). */
	yMax?: number;
	chartOptions?: Partial<ChartOptions<'line'>>;
	ariaLabel?: string;
	ariaDescribedBy?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
	height: 280,
	showLegend: true,
	showGridX: false,
	showGridY: true,
	yMin: undefined,
	yMax: undefined,
	chartOptions: undefined,
	ariaLabel: undefined,
	ariaDescribedBy: undefined,
});

const { isMobile } = useResponsive();

const chartData = computed<ChartData<'line'>>(() => ({
	labels: props.data.categories,
	datasets: props.data.datasets.map((ds) => {
		const color = resolveCssColor(ds.color);
		return {
			label: ds.label,
			data: ds.data,
			borderColor: color,
			backgroundColor: color,
			borderWidth: 2,
			borderDash: ds.dashed ? [6, 6] : undefined,
			tension: 0.35,
			pointRadius: ds.dashed ? 0 : 3,
			pointHoverRadius: ds.dashed ? 0 : 5,
			fill: false,
			...(ds.options ?? {}),
		};
	}),
}));

const options = computed<ChartOptions<'line'>>(() => {
	const basePlugins: ChartOptions<'line'>['plugins'] = {
		legend: {
			display: props.showLegend && props.data.datasets.length > 1,
			position: isMobile.value ? 'bottom' : 'top',
			labels: { usePointStyle: true, pointStyle: 'circle', padding: 16 },
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

	const baseScales: ChartOptions<'line'>['scales'] = {
		x: { grid: { display: props.showGridX } },
		y: {
			grid: { display: props.showGridY },
			...(props.yMin !== undefined ? { min: props.yMin } : {}),
			...(props.yMax !== undefined ? { max: props.yMax } : {}),
		},
	};

	if (props.chartOptions) {
		const { plugins: extraPlugins, scales: extraScales, ...rest } = props.chartOptions;
		return {
			responsive: true,
			maintainAspectRatio: false,
			interaction: { mode: 'index', intersect: false },
			plugins: extraPlugins ? { ...basePlugins, ...extraPlugins } : basePlugins,
			scales: extraScales ? { ...baseScales, ...extraScales } : baseScales,
			...rest,
		};
	}

	return {
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index', intersect: false },
		plugins: basePlugins,
		scales: baseScales,
	};
});

const resolvedAriaLabel = computed(() => {
	if (props.ariaLabel) return props.ariaLabel;
	const datasets = props.data.datasets.map((d) => d.label).join(', ');
	return `Line chart: ${datasets}`;
});

const wrapperClasses = computed(() =>
	cn(lineChartVariants({ variant: props.variant }), props.class),
);
</script>
