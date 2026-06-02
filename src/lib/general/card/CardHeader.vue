<template>
	<div data-slot="card-header" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { cardHeaderVariants, type CardHeaderVariants } from './card';

interface CardHeaderProps {
	spacing?: CardHeaderVariants['spacing'];
	class?: string;
}

const props = withDefaults(defineProps<CardHeaderProps>(), {
	spacing: 'default',
});

const classes = computed(() => cn(cardHeaderVariants({ spacing: props.spacing }), props.class));
</script>
