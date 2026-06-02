<template>
	<h3 data-slot="card-title" :class="classes">
		<slot />
	</h3>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { cardTitleVariants, type CardTitleVariants } from './card.js';

interface CardTitleProps {
	size?: CardTitleVariants['size'];
	class?: string;
}

const props = withDefaults(defineProps<CardTitleProps>(), {
	size: 'default',
});

const classes = computed(() => cn(cardTitleVariants({ size: props.size }), props.class));
</script>
