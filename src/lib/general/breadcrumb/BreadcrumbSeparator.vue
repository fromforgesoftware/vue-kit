<template>
	<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" :class="classes">
		<slot>
			<Icon :icon="ChevronRight" size="sm" />
		</slot>
	</li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { breadcrumbSeparatorVariants } from './breadcrumb.js';

interface BreadcrumbSeparatorProps {
	class?: string;
}

const props = defineProps<BreadcrumbSeparatorProps>();

const classes = computed(() => cn(breadcrumbSeparatorVariants(), props.class));
</script>
