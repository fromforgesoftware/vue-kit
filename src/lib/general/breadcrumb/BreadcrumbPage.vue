<template>
	<span
		data-slot="breadcrumb-page"
		role="link"
		aria-disabled="true"
		aria-current="page"
		:class="classes"
	>
		<slot />
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { breadcrumbPageVariants } from './breadcrumb';

interface BreadcrumbPageProps {
	class?: string;
}

const props = defineProps<BreadcrumbPageProps>();

const classes = computed(() => cn(breadcrumbPageVariants(), props.class));
</script>
