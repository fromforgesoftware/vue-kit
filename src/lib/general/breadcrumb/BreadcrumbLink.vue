<template>
	<a v-if="href && !asChild" data-slot="breadcrumb-link" :href="href" :class="classes">
		<slot />
	</a>
	<span v-else data-slot="breadcrumb-link" :class="classes">
		<slot />
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { breadcrumbLinkVariants } from './breadcrumb';

interface BreadcrumbLinkProps {
	href?: string;
	asChild?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<BreadcrumbLinkProps>(), {
	asChild: false,
});

const classes = computed(() => cn(breadcrumbLinkVariants(), props.class));
</script>
