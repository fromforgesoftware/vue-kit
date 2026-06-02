<template>
	<section data-slot="stat-card-group" role="group" :class="classes">
		<slot />
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../helpers/cn';
import { statCardGroupVariants, type StatCardGroupVariants } from './stat-card';

interface StatCardGroupProps {
	/** Number of columns in the grid. */
	columns?: StatCardGroupVariants['columns'];
	/**
	 * `connected` (default) renders one shared surface with internal dividers.
	 * `separated` keeps each card as its own surface — combine with `gap`.
	 */
	layout?: StatCardGroupVariants['layout'];
	/** Gap between children. Ignored in `connected` layout. */
	gap?: StatCardGroupVariants['gap'];
	class?: string;
}

const props = withDefaults(defineProps<StatCardGroupProps>(), {
	columns: 3,
	layout: 'connected',
	gap: 'none',
});

const classes = computed(() =>
	cn(
		statCardGroupVariants({
			columns: props.columns,
			layout: props.layout,
			gap: props.gap,
		}),
		props.class,
	),
);
</script>
