<template>
	<div data-slot="sidebar-provider" :class="classes" :data-sidebar-state="ctx.state.value">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { cn } from '../../../helpers/cn';
import { createSidebarContext } from './useSidebar';
import {
	SIDEBAR_CONTEXT_KEY,
	sidebarProviderVariants,
	type SidebarCollapsible,
	type SidebarSide,
} from './sidebar';

interface SidebarProviderProps {
	defaultOpen?: boolean;
	open?: boolean;
	collapsible?: SidebarCollapsible;
	side?: SidebarSide;
	class?: string;
}

const props = withDefaults(defineProps<SidebarProviderProps>(), {
	defaultOpen: true,
	open: undefined,
	collapsible: 'offcanvas',
	side: 'left',
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const ctx = createSidebarContext({
	defaultOpen: props.defaultOpen,
	open: toRef(props, 'open'),
	collapsible: toRef(props, 'collapsible'),
	side: toRef(props, 'side'),
	onOpenChange: (val) => emit('update:open', val),
});

provide(SIDEBAR_CONTEXT_KEY, ctx);

const classes = computed(() => cn(sidebarProviderVariants(), props.class));
</script>
