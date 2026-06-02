<template>
	<div data-slot="donut-chart-legend" :class="classes">
		<template v-if="isBottom">
			<!-- Bottom variant: coloured swatch + label with count -->
			<div
				v-for="seg in segments"
				:key="seg.label"
				data-slot="donut-chart-legend-item"
				class="flex items-center gap-1 text-sm"
			>
				<span
					class="size-2.5 shrink-0 rounded-full"
					:style="{ backgroundColor: seg.color }"
					aria-hidden="true"
				/>
				<span class="font-semibold text-foreground">{{ seg.label }}</span>
				<span class="text-muted-foreground">({{ seg.value }})</span>
			</div>
		</template>
		<template v-else>
			<!-- Default (right) variant: dot + label + value -->
			<div
				v-for="seg in segments"
				:key="seg.label"
				data-slot="donut-chart-legend-item"
				class="flex items-center gap-2 text-sm"
			>
				<span
					class="size-2.5 shrink-0 rounded-full"
					:style="{ backgroundColor: seg.color }"
					aria-hidden="true"
				/>
				<span class="text-muted-foreground">{{ seg.label }}</span>
				<span class="ml-auto font-semibold tabular-nums text-foreground">{{ seg.value }}</span>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { cn } from '../../../helpers/cn.js';
import {
	donutLegendVariants,
	DONUT_CHART_VARIANT_KEY,
	type DonutChartVariant,
	type DonutSegment,
} from './donut-chart.js';

interface Props {
	segments: DonutSegment[];
	variant?: DonutChartVariant;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: undefined,
});

const injectedVariant = inject(DONUT_CHART_VARIANT_KEY, ref<DonutChartVariant>('default'));
const resolvedVariant = computed(() => props.variant ?? injectedVariant.value);

const classes = computed(() =>
	cn(donutLegendVariants({ variant: resolvedVariant.value }), props.class),
);

const isBottom = computed(() => resolvedVariant.value === 'legend-bottom');
</script>
