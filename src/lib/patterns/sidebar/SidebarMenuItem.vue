<template>
	<li data-slot="sidebar-menu-item" :class="classes">
		<slot />
	</li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';
import { sidebarMenuItemVariants } from './sidebar.js';

interface SidebarMenuItemProps {
	class?: string;
}

const props = defineProps<SidebarMenuItemProps>();

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() =>
	cn(sidebarMenuItemVariants(), isIconCollapsed.value && 'flex justify-center', props.class),
);
</script>
