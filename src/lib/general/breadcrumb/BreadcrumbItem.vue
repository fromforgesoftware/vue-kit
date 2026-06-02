<template>
	<li data-slot="breadcrumb-item" :class="classes">
		<slot />
	</li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { breadcrumbItemVariants } from './breadcrumb';

interface BreadcrumbItemProps {
	class?: string;
}

const props = defineProps<BreadcrumbItemProps>();

const classes = computed(() => cn(breadcrumbItemVariants(), props.class));
</script>
