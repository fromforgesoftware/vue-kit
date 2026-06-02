<template>
	<div data-slot="sidebar-group" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { useSidebar } from './useSidebar';
import { sidebarGroupVariants } from './sidebar';

interface SidebarGroupProps {
	class?: string;
}

const props = defineProps<SidebarGroupProps>();

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() =>
	cn(sidebarGroupVariants(), isIconCollapsed.value && 'items-center px-1', props.class),
);
</script>
