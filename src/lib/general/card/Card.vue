<template>
	<div data-slot="card" :class="classes" :style="style">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed, provide, toRef, type CSSProperties } from 'vue';
import { cn } from '../../../helpers/cn';
import { cardVariants, CARD_VARIANT_KEY, type CardVariants, type CardVariant } from './card';

interface CardProps {
	/** Surface style. */
	variant?: CardVariant;
	padding?: CardVariants['padding'];
	/** Add hover/focus styling for clickable cards. Use with a wrapping link or `role="button"`. */
	interactive?: CardVariants['interactive'];
	/** CSS color for the top accent line. Only applied when `variant="accent"`. Defaults to grey. */
	accentColor?: string;
	class?: string;
}

const props = withDefaults(defineProps<CardProps>(), {
	variant: 'default',
	padding: 'default',
	interactive: false,
	accentColor: undefined,
});

provide(CARD_VARIANT_KEY, toRef(props, 'variant'));

const classes = computed(() =>
	cn(
		cardVariants({
			variant: props.variant,
			padding: props.padding,
			interactive: props.interactive,
		}),
		props.class,
	),
);

const style = computed<CSSProperties | undefined>(() =>
	props.variant === 'accent' && props.accentColor
		? { borderTopColor: props.accentColor }
		: undefined,
);
</script>
