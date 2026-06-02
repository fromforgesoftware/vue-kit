<template>
	<div
		data-slot="kpi-tile"
		:class="cn(kpiTileVariants({ size }), props.class)"
		:aria-label="ariaLabel ?? label"
	>
		<div class="flex items-center justify-between gap-2">
			<span
				data-slot="kpi-tile-label"
				class="text-xs uppercase tracking-wide text-muted-foreground"
			>
				{{ label }}
			</span>
			<slot name="action" />
		</div>
		<div class="flex items-end justify-between gap-3">
			<span data-slot="kpi-tile-value" :class="valueClasses">{{ value }}</span>
			<Sparkline
				v-if="trend && trend.length > 1"
				data-slot="kpi-tile-sparkline"
				:values="trend"
				:tone="sparklineTone"
				:width="sparkWidth"
				:height="sparkHeight"
			/>
		</div>
		<div v-if="delta || footnote" class="flex items-center justify-between gap-2 text-xs">
			<span v-if="delta" data-slot="kpi-tile-delta" :class="deltaClasses">
				<Icon :icon="deltaIcon" size="xs-sm" />
				{{ formattedDelta }}
			</span>
			<span v-if="footnote" data-slot="kpi-tile-footnote" class="text-muted-foreground">
				{{ footnote }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDown, ArrowRight, ArrowUp } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import Sparkline from '../../charts/sparkline/Sparkline.vue';
import { cn } from '../../../helpers/cn';
import { deltaSentiment, kpiTileVariants, type KpiDelta, type KpiTileSize } from './kpi-tile';
import type { SparklineTone } from '../../charts/sparkline/sparkline';

interface KpiTileProps {
	label: string;
	value: string | number;
	delta?: KpiDelta;
	trend?: number[];
	footnote?: string;
	size?: KpiTileSize;
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<KpiTileProps>(), {
	delta: undefined,
	trend: undefined,
	footnote: undefined,
	size: 'default',
	ariaLabel: undefined,
	class: undefined,
});

const valueClasses = computed(() => {
	const base = 'font-semibold tracking-tight tabular-nums';
	if (props.size === 'sm') return `${base} text-xl`;
	if (props.size === 'lg') return `${base} text-3xl`;
	return `${base} text-2xl`;
});

const sentiment = computed(() => (props.delta ? deltaSentiment(props.delta) : 'neutral'));

const deltaClasses = computed(() => {
	const base = 'inline-flex items-center gap-1 font-medium';
	if (sentiment.value === 'good') return `${base} text-success`;
	if (sentiment.value === 'bad') return `${base} text-destructive`;
	return `${base} text-muted-foreground`;
});

const deltaIcon = computed(() => {
	if (!props.delta || props.delta.value === 0) return ArrowRight;
	return props.delta.value > 0 ? ArrowUp : ArrowDown;
});

const formattedDelta = computed(() => {
	if (!props.delta) return '';
	const abs = Math.abs(props.delta.value);
	if (props.delta.format === 'absolute') return `${props.delta.value >= 0 ? '+' : '-'}${abs}`;
	return `${props.delta.value >= 0 ? '+' : '-'}${abs}%`;
});

const sparklineTone = computed<SparklineTone>(() => {
	if (sentiment.value === 'good') return 'success';
	if (sentiment.value === 'bad') return 'destructive';
	return 'muted';
});

const sparkWidth = computed(() => (props.size === 'sm' ? 64 : props.size === 'lg' ? 120 : 96));
const sparkHeight = computed(() => (props.size === 'sm' ? 22 : props.size === 'lg' ? 36 : 28));
</script>
