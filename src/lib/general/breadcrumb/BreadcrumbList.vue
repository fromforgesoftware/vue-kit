<template>
	<ol data-slot="breadcrumb-list" :class="classes">
		<slot />
	</ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { breadcrumbListVariants } from './breadcrumb.js';

interface BreadcrumbListProps {
	class?: string;
}

const props = defineProps<BreadcrumbListProps>();

const classes = computed(() => cn(breadcrumbListVariants(), props.class));
</script>
