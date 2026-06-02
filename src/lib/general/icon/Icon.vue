<template>
	<component :is="icon" data-slot="icon" :class="classes" :stroke-width="strokeWidth" />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { cn } from '../../../helpers/cn';
import { iconVariants, type IconSize } from './icon';

interface IconProps {
	icon: Component;
	size?: IconSize;
	strokeWidth?: number | string;
	class?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
	size: 'default',
	strokeWidth: 2,
});

const classes = computed(() => cn(iconVariants({ size: props.size }), props.class));
</script>
