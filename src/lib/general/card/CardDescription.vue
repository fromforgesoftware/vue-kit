<template>
	<p data-slot="card-description" :class="classes">
		<slot />
	</p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { cardDescriptionVariants, type CardDescriptionVariants } from './card.js';

interface CardDescriptionProps {
	size?: CardDescriptionVariants['size'];
	class?: string;
}

const props = withDefaults(defineProps<CardDescriptionProps>(), {
	size: 'default',
});

const classes = computed(() => cn(cardDescriptionVariants({ size: props.size }), props.class));
</script>
