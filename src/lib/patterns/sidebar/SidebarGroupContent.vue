<template>
	<div data-slot="sidebar-group-content" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { sidebarGroupContentVariants } from './sidebar.js';

interface SidebarGroupContentProps {
	class?: string;
}

const props = defineProps<SidebarGroupContentProps>();

const classes = computed(() => cn(sidebarGroupContentVariants(), props.class));
</script>
