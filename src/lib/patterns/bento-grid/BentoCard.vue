<template>
	<Card
		:padding="padding"
		:variant="variant"
		:interactive="interactive"
		:class="classes"
		data-slot="bento-card"
		:data-bento-size="size"
	>
		<slot />
	</Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from '../../general/card/Card.vue';
import type { CardVariants, CardVariant } from '../../general/card/card';
import { cn } from '../../../helpers/cn';
import { bentoCardVariants, type BentoSize } from './bento-grid';

interface BentoCardProps {
	/**
	 * Span on the grid. See `BentoSize` — `sm` (1×1) by default; `wide` to span
	 * the full row; `hero` for a 2×2 attention card. The grid uses
	 * `grid-auto-flow: dense` so smaller cards fill holes left by bigger ones.
	 */
	size?: BentoSize;
	/** Card padding. Mirrors the underlying `Card` component. */
	padding?: CardVariants['padding'];
	/** Card surface variant. */
	variant?: CardVariant;
	/**
	 * Add hover/focus styling for clickable cards. Plain `boolean` rather than
	 * the cva-derived union so Vue auto-coerces bare attribute usage like
	 * `<BentoCard interactive>` to `true`.
	 */
	interactive?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<BentoCardProps>(), {
	size: 'sm',
	padding: 'sm',
	variant: 'default',
	interactive: false,
});

const classes = computed(() => cn(bentoCardVariants({ size: props.size }), props.class));
</script>
