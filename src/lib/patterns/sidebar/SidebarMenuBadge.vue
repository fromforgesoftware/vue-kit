<template>
	<div data-slot="sidebar-menu-badge" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { sidebarMenuBadgeVariants } from './sidebar.js';

interface SidebarMenuBadgeProps {
	class?: string;
}

const props = defineProps<SidebarMenuBadgeProps>();

const classes = computed(() => cn(sidebarMenuBadgeVariants(), props.class));
</script>
