<template>
	<nav data-slot="breadcrumb" aria-label="Breadcrumb" :class="classes">
		<slot />
	</nav>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { breadcrumbVariants, BREADCRUMB_VARIANT_KEY, type BreadcrumbVariant } from './breadcrumb.js';

interface BreadcrumbProps {
	variant?: BreadcrumbVariant;
	class?: string;
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
	variant: 'default',
});

provide(BREADCRUMB_VARIANT_KEY, toRef(props, 'variant'));

const classes = computed(() => cn(breadcrumbVariants(), props.class));
</script>
