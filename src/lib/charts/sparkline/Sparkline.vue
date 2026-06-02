<template>
	<svg
		data-slot="sparkline"
		:class="cn(sparklineVariants({ tone }), props.class)"
		:width="width"
		:height="height"
		:viewBox="`0 0 ${width} ${height}`"
		role="img"
		:aria-label="ariaLabel ?? defaultLabel"
	>
		<path
			v-if="filled && points.areaPath"
			:d="points.areaPath"
			fill="currentColor"
			fill-opacity="0.15"
			stroke="none"
		/>
		<path
			v-if="points.path"
			:d="points.path"
			fill="none"
			stroke="currentColor"
			:stroke-width="strokeWidth"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<circle
			v-if="showLastPoint && lastPoint"
			:cx="lastPoint.x"
			:cy="lastPoint.y"
			:r="strokeWidth * 1.5"
			fill="currentColor"
		/>
	</svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { buildSparklinePath, sparklineVariants, type SparklineTone } from './sparkline.js';

interface SparklineProps {
	values: number[];
	width?: number;
	height?: number;
	tone?: SparklineTone;
	strokeWidth?: number;
	filled?: boolean;
	showLastPoint?: boolean;
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<SparklineProps>(), {
	width: 96,
	height: 28,
	tone: 'default',
	strokeWidth: 1.5,
	filled: true,
	showLastPoint: true,
	ariaLabel: undefined,
	class: undefined,
});

const points = computed(() => buildSparklinePath(props.values, props.width, props.height));

const lastPoint = computed(() => {
	if (props.values.length === 0) return null;
	const min = points.value.min;
	const max = points.value.max;
	const range = max - min || 1;
	const padding = 1;
	const usableHeight = props.height - padding * 2;
	const last = props.values[props.values.length - 1];
	const stepX =
		props.values.length === 1 ? 0 : (props.width - padding * 2) / (props.values.length - 1);
	return {
		x: padding + (props.values.length - 1) * stepX,
		y: padding + (1 - (last - min) / range) * usableHeight,
	};
});

const defaultLabel = computed(() => {
	if (props.values.length === 0) return 'No data';
	const first = props.values[0];
	const last = props.values[props.values.length - 1];
	const direction = last > first ? 'up' : last < first ? 'down' : 'flat';
	return `Sparkline trending ${direction} from ${first} to ${last}`;
});
</script>
