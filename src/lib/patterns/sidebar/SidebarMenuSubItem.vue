<template>
	<li data-slot="sidebar-menu-sub-item" :class="classes">
		<slot />
	</li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { sidebarMenuSubItemVariants } from './sidebar';

interface SidebarMenuSubItemProps {
	class?: string;
}

const props = defineProps<SidebarMenuSubItemProps>();

const classes = computed(() => cn(sidebarMenuSubItemVariants(), props.class));
</script>
