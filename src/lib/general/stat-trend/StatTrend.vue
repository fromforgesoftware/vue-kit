<template>
	<span data-slot="stat-trend" role="status" :aria-label="ariaLabel" :class="classes">
		<Icon
			:icon="iconComponent"
			data-slot="stat-trend-icon"
			aria-hidden="true"
			:stroke-width="2.5"
		/>
		<span data-slot="stat-trend-value">{{ formattedValue }}</span>
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUp, ArrowDown, Minus } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { statTrendVariants, type StatTrendVariants } from './stat-trend.js';

interface StatTrendProps {
	/** The change value to display. Sign is ignored — direction drives the icon. */
	value: number;
	/** Direction of the trend. */
	direction: NonNullable<StatTrendVariants['direction']>;
	/** Display format. */
	format?: 'percent' | 'absolute';
	/** Visual size. */
	size?: StatTrendVariants['size'];
	/** Visual tone. */
	tone?: StatTrendVariants['tone'];
	/**
	 * If true, "down" is treated as positive and "up" as negative — useful for
	 * metrics where lower is better (errors, latency, churn).
	 */
	invertSentiment?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<StatTrendProps>(), {
	format: 'percent',
	size: 'default',
	tone: 'soft',
	invertSentiment: false,
});

const sentiment = computed<NonNullable<StatTrendVariants['sentiment']>>(() => {
	if (props.direction === 'flat') return 'neutral';
	const isUp = props.direction === 'up';
	const positive = props.invertSentiment ? !isUp : isUp;
	return positive ? 'positive' : 'negative';
});

const iconComponent = computed(() => {
	switch (props.direction) {
		case 'up':
			return ArrowUp;
		case 'down':
			return ArrowDown;
		default:
			return Minus;
	}
});

const formattedValue = computed(() => {
	const abs = Math.abs(props.value);
	const absValue = Number.isInteger(abs) ? `${abs}` : abs.toFixed(1);
	return props.format === 'percent' ? `${absValue}%` : `${absValue}`;
});

const ariaLabel = computed(() => {
	const dir =
		props.direction === 'up' ? 'increased' : props.direction === 'down' ? 'decreased' : 'unchanged';
	return `${dir} by ${formattedValue.value}`;
});

const classes = computed(() =>
	cn(
		statTrendVariants({
			direction: props.direction,
			tone: props.tone,
			size: props.size,
			sentiment: sentiment.value,
		}),
		props.class,
	),
);
</script>
