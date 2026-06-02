<template>
	<div data-slot="sidebar-footer" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';
import { sidebarFooterVariants } from './sidebar.js';

interface SidebarFooterProps {
	class?: string;
}

const props = defineProps<SidebarFooterProps>();

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() =>
	cn(sidebarFooterVariants(), isIconCollapsed.value && 'items-center p-1', props.class),
);
</script>
