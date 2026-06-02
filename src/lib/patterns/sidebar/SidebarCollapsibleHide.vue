<template>
	<div v-if="!isIconCollapsed" data-slot="sidebar-collapsible-hide" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';

interface Props {
	class?: string;
}

const props = defineProps<Props>();

const { state, collapsible, isMobile } = useSidebar();

const isIconCollapsed = computed(
	() => !isMobile.value && state.value === 'collapsed' && collapsible.value === 'icon',
);

const classes = computed(() => cn(props.class));
</script>
