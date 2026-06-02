<template>
	<Primitive
		:as-child="asChild"
		:as="asChild ? undefined : 'a'"
		data-slot="sidebar-menu-sub-button"
		data-sidebar="menu-sub-button"
		:data-size="size"
		:data-active="isActive"
		:class="classes"
		@click="isMobile && setOpenMobile(false)"
	>
		<slot />
	</Primitive>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Primitive } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';
import { sidebarMenuSubButtonVariants, type SidebarMenuSubButtonSize } from './sidebar.js';

interface SidebarMenuSubButtonProps {
	asChild?: boolean;
	isActive?: boolean;
	size?: SidebarMenuSubButtonSize;
	class?: string;
}

const props = withDefaults(defineProps<SidebarMenuSubButtonProps>(), {
	asChild: false,
	isActive: false,
	size: 'default',
});

const { isMobile, setOpenMobile } = useSidebar();

const classes = computed(() => cn(sidebarMenuSubButtonVariants({ size: props.size }), props.class));
</script>
