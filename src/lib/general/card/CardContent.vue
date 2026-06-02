<template>
	<div data-slot="card-content" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { cardContentVariants, type CardContentVariants } from './card.js';

interface CardContentProps {
	/** Top spacing relative to the previous block (header). */
	spacing?: CardContentVariants['spacing'];
	class?: string;
}

const props = withDefaults(defineProps<CardContentProps>(), {
	spacing: 'none',
});

const classes = computed(() => cn(cardContentVariants({ spacing: props.spacing }), props.class));
</script>
