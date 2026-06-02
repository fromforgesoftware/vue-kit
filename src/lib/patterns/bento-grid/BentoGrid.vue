<template>
	<div :class="classes" data-slot="bento-grid">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { bentoGridVariants, type BentoCols, type BentoGap } from './bento-grid.js';

interface BentoGridProps {
	/**
	 * Maximum number of columns at the largest breakpoint. Falls back to fewer
	 * columns at smaller breakpoints. Default 3.
	 */
	cols?: BentoCols;
	/** Gap between cards. Default `md` (12px). */
	gap?: BentoGap;
	class?: string;
}

const props = withDefaults(defineProps<BentoGridProps>(), {
	cols: 3,
	gap: 'md',
});

const classes = computed(() =>
	cn(bentoGridVariants({ cols: props.cols, gap: props.gap }), props.class),
);
</script>
