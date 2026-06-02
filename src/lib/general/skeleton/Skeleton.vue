<template>
	<div data-slot="skeleton" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { skeletonVariants, type SkeletonVariants } from './skeleton';
import type { SkeletonAnimate } from './types';

interface Props {
	class?: string;
	variant?: SkeletonVariants['variant'];
	animate?: SkeletonAnimate;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
	animate: 'pulse',
});

const classes = computed(() =>
	cn(skeletonVariants({ variant: props.variant, animate: props.animate }), props.class),
);
</script>

<style>
@keyframes skeleton-shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}

.skeleton-shimmer {
	background: linear-gradient(
		110deg,
		oklch(from var(--color-primary) l c h / 0.06) 30%,
		oklch(from var(--color-primary) l c h / 0.15) 50%,
		oklch(from var(--color-primary) l c h / 0.06) 70%
	);
	background-size: 200% 100%;
	animation: skeleton-shimmer 2s ease-in-out infinite;
}
</style>
