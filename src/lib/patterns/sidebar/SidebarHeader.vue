<template>
	<div data-slot="sidebar-header" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { useSidebar } from './useSidebar';
import { sidebarHeaderVariants } from './sidebar';

interface SidebarHeaderProps {
	class?: string;
}

const props = defineProps<SidebarHeaderProps>();

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() =>
	cn(sidebarHeaderVariants(), isIconCollapsed.value && 'items-center px-1', props.class),
);
</script>
