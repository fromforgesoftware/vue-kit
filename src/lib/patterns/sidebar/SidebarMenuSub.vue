<template>
	<ul data-slot="sidebar-menu-sub" :class="classes">
		<slot />
	</ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';
import { sidebarMenuSubVariants } from './sidebar.js';

interface SidebarMenuSubProps {
	class?: string;
}

const props = defineProps<SidebarMenuSubProps>();
const { state, collapsible, isMobile } = useSidebar();

const isIconCollapsed = computed(
	() => !isMobile.value && state.value === 'collapsed' && collapsible.value === 'icon',
);

const classes = computed(() =>
	cn(sidebarMenuSubVariants(), isIconCollapsed.value && 'hidden', props.class),
);
</script>

<style scoped>
/* Tree-branch connectors */

/* Full-height vertical line (non-last items only) */
[data-slot='sidebar-menu-sub'] > :deep([data-slot='sidebar-menu-sub-item'])::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	border-left: 1px solid var(--color-sidebar-border);
}

/* Curved branch connector (all items) */
[data-slot='sidebar-menu-sub'] > :deep([data-slot='sidebar-menu-sub-item'])::after {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	height: 50%;
	width: 0.75rem;
	border-left: 1px solid var(--color-sidebar-border);
	border-bottom: 1px solid var(--color-sidebar-border);
	border-bottom-left-radius: 0.75rem;
}

/* Last item: hide the full-height vertical line, the curve handles it */
[data-slot='sidebar-menu-sub'] > :deep([data-slot='sidebar-menu-sub-item']:last-child)::before {
	display: none;
}
</style>
