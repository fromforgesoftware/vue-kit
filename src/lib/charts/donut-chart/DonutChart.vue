<template>
	<!--
    Chart.js gives its inner <canvas> role="img"; we surface the accessible name
    on that canvas directly (rather than on a wrapper) so AT sees a single named
    image, matching axe's role-img-alt expectations.
  -->
	<div data-slot="donut-chart" :class="wrapperClasses">
		<div
			data-slot="donut-chart-canvas"
			class="relative shrink-0"
			:style="{ width: `${size}px`, height: `${size}px` }"
		>
			<Doughnut
				:data="chartData"
				:options="options"
				:plugins="plugins"
				:aria-label="resolvedAriaLabel"
				:aria-describedby="ariaDescribedBy"
			/>
			<!-- Centre content. Hidden while a segment is hovered so the
           Chart.js tooltip (painted on the canvas underneath) stays
           readable instead of being obscured by this overlay. -->
			<Transition
				enter-active-class="transition-opacity duration-150"
				leave-active-class="transition-opacity duration-150"
				enter-from-class="opacity-0"
				leave-to-class="opacity-0"
			>
				<div
					v-if="(centerText || centerLabel || $slots.center) && !isHovering"
					class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
					aria-hidden="true"
				>
					<slot name="center">
						<span v-if="centerText" class="text-2xl font-bold leading-tight text-foreground">
							{{ centerText }}
						</span>
						<span v-if="centerLabel" class="text-xs text-muted-foreground">
							{{ centerLabel }}
						</span>
					</slot>
				</div>
			</Transition>
		</div>
		<!-- Legend -->
		<DonutChartLegend
			v-if="effectiveVariant !== 'minimal'"
			data-slot="donut-chart-legend"
			:segments="segments"
		/>
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { useResponsive } from '../../../composables/useResponsive';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { Context } from 'chartjs-plugin-datalabels';
import { cn } from '../../../helpers/cn';
import { resolveCssColor } from '../../../helpers/resolveCssColor';
import {
	donutChartVariants,
	DONUT_CHART_VARIANT_KEY,
	type DonutChartVariant,
	type DonutSegment,
} from './donut-chart';
import DonutChartLegend from './DonutChartLegend.vue';

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

interface Props {
	/** Chart data segments */
	segments: DonutSegment[];
	/** Text displayed in the centre of the donut (e.g. total value) */
	centerText?: string;
	/** Subtitle displayed below the centre text */
	centerLabel?: string;
	/** Visual variant — legend on the right (default), legend below, or no legend at all (minimal). */
	variant?: DonutChartVariant;
	/** Chart container size in px */
	size?: number;
	/** Donut thickness as percentage of radius (0–100). Lower = thinner ring. */
	cutout?: number;
	/**
	 * Corner radius applied to each arc (px). Defaults to fully-rounded pill
	 * ends in `minimal`, no rounding otherwise. Pass a smaller number to
	 * soften pills without making them lozenges.
	 */
	segmentRadius?: number;
	/** Show percentage datalabels on segments */
	showDataLabels?: boolean;
	/** Minimum percentage to display a data label (hides small segments) */
	dataLabelThreshold?: number;
	/** Chart.js-compatible options to merge/override */
	chartOptions?: Partial<ChartOptions<'doughnut'>>;
	/** Accessible name announced to assistive tech. Defaults to a derived label. */
	ariaLabel?: string;
	/** id of an element describing the chart in detail. */
	ariaDescribedBy?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	centerText: undefined,
	centerLabel: undefined,
	variant: 'default',
	size: 160,
	cutout: 70,
	segmentRadius: undefined,
	showDataLabels: false,
	dataLabelThreshold: 5,
	chartOptions: undefined,
	ariaLabel: undefined,
	ariaDescribedBy: undefined,
});

const { isMobile } = useResponsive();

// Force legend below the chart on mobile (consumer-passed `default` /
// `legend-bottom` collapse to `legend-bottom`; `minimal` is preserved).
const effectiveVariant = computed(() =>
	props.variant === 'minimal' ? 'minimal' : isMobile.value ? 'legend-bottom' : props.variant,
);

provide(DONUT_CHART_VARIANT_KEY, effectiveVariant);

const isMinimal = computed(() => effectiveVariant.value === 'minimal');

const chartData = computed(() => {
	const colors = props.segments.map((s) => resolveCssColor(s.color));
	return {
		labels: props.segments.map((s) => s.label),
		datasets: [
			{
				data: props.segments.map((s) => s.value),
				backgroundColor: colors,
				borderColor: colors,
				borderWidth: isMinimal.value ? 0 : 2,
				spacing: isMinimal.value ? 4 : 0,
				borderRadius: props.segmentRadius ?? (isMinimal.value ? 6 : 0),
			},
		],
	};
});

const threshold = computed(() => props.dataLabelThreshold);

// Hover state — flipped on by Chart.js `onHover` so the centre overlay can
// fade out while a tooltip is on screen, and restored on mouse-leave.
const isHovering = ref(false);

const options = computed<ChartOptions<'doughnut'>>(() => {
	const basePlugins: ChartOptions<'doughnut'>['plugins'] = {
		legend: { display: false },
		tooltip: {
			enabled: true,
			backgroundColor: resolveCssColor('var(--color-popover)'),
			titleColor: resolveCssColor('var(--color-popover-foreground)'),
			bodyColor: resolveCssColor('var(--color-popover-foreground)'),
			titleFont: { size: 12, weight: 'bold' },
			bodyFont: { size: 12 },
			padding: 10,
			cornerRadius: 6,
			displayColors: true,
			boxPadding: 4,
		},
		datalabels: props.showDataLabels
			? {
					color: '#fff',
					font: { weight: 'bold', size: 12 },
					formatter: (value: number, ctx: Context) => {
						const total = (ctx.chart.data.datasets[0].data as number[]).reduce(
							(a: number, b: number) => a + b,
							0,
						);
						const pct = total > 0 ? (value / total) * 100 : 0;
						return pct < threshold.value ? '' : `${pct.toFixed(0)}%`;
					},
				}
			: { display: false },
	};

	const onHover: ChartOptions<'doughnut'>['onHover'] = (_event, elements) => {
		isHovering.value = elements.length > 0;
	};

	if (props.chartOptions) {
		const { plugins: extraPlugins, ...rest } = props.chartOptions;
		return {
			responsive: true,
			maintainAspectRatio: true,
			cutout: `${props.cutout}%`,
			plugins: extraPlugins ? { ...basePlugins, ...extraPlugins } : basePlugins,
			onHover,
			...rest,
		};
	}

	return {
		responsive: true,
		maintainAspectRatio: true,
		cutout: `${props.cutout}%`,
		plugins: basePlugins,
		onHover,
	};
});

const plugins = computed(() => (props.showDataLabels ? [ChartDataLabels] : []));

// Auto-derive a name when none is provided. Listing segment labels gives screen
// readers a meaningful announcement instead of "image".
const resolvedAriaLabel = computed(() => {
	if (props.ariaLabel) return props.ariaLabel;
	if (!props.segments.length) return 'Donut chart, no data';
	const items = props.segments.map((s) => `${s.label} ${s.value}`).join(', ');
	return `Donut chart: ${items}`;
});

const wrapperClasses = computed(() =>
	cn(donutChartVariants({ variant: effectiveVariant.value }), props.class),
);
</script>
