<template>
	<button
		data-slot="sidebar-rail"
		data-sidebar="rail"
		aria-label="Toggle Sidebar"
		tabindex="-1"
		:class="classes"
		@click="toggleSidebar"
	/>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { useSidebar } from './useSidebar';
import { sidebarRailVariants } from './sidebar';

interface SidebarRailProps {
	class?: string;
}

const props = defineProps<SidebarRailProps>();

const { toggleSidebar } = useSidebar();

const classes = computed(() => cn(sidebarRailVariants(), props.class));
</script>
