<template>
	<ul data-slot="sidebar-menu" :class="classes">
		<slot />
	</ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';
import { sidebarMenuVariants } from './sidebar.js';

interface SidebarMenuProps {
	class?: string;
}

const props = defineProps<SidebarMenuProps>();

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() =>
	cn(sidebarMenuVariants(), isIconCollapsed.value && 'items-center', props.class),
);
</script>
