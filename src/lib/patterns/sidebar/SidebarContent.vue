<template>
	<div data-slot="sidebar-content" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { useSidebar } from './useSidebar';
import { sidebarContentVariants } from './sidebar';

interface SidebarContentProps {
	class?: string;
}

const props = defineProps<SidebarContentProps>();
const { state, collapsible, isMobile } = useSidebar();

const isIconCollapsed = computed(
	() => !isMobile.value && state.value === 'collapsed' && collapsible.value === 'icon',
);

const classes = computed(() =>
	cn(sidebarContentVariants(), isIconCollapsed.value && 'overflow-hidden', props.class),
);
</script>
