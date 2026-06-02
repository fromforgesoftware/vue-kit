<template>
	<div data-slot="card-footer" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { cardFooterVariants, type CardFooterVariants } from './card.js';

interface CardFooterProps {
	align?: CardFooterVariants['align'];
	spacing?: CardFooterVariants['spacing'];
	class?: string;
}

const props = withDefaults(defineProps<CardFooterProps>(), {
	align: 'start',
	spacing: 'none',
});

const classes = computed(() =>
	cn(cardFooterVariants({ align: props.align, spacing: props.spacing }), props.class),
);
</script>
