<template>
	<Primitive
		:as-child="asChild"
		:as="asChild ? undefined : 'button'"
		data-slot="sidebar-menu-action"
		data-sidebar="menu-action"
		:class="classes"
	>
		<slot />
	</Primitive>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Primitive } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { sidebarMenuActionVariants } from './sidebar.js';

interface SidebarMenuActionProps {
	asChild?: boolean;
	showOnHover?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<SidebarMenuActionProps>(), {
	asChild: false,
	showOnHover: false,
});

const classes = computed(() =>
	cn(sidebarMenuActionVariants({ showOnHover: props.showOnHover }), props.class),
);
</script>
