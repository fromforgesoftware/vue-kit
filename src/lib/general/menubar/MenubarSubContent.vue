<template>
	<MenubarPortal>
		<MenubarSubContent
			data-slot="menubar-sub-content"
			:side-offset="sideOffset"
			:align-offset="alignOffset"
			:loop="loop"
			:class="classes"
		>
			<slot />
		</MenubarSubContent>
	</MenubarPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarSubContent, MenubarPortal } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { menubarSubContentVariants } from './menubar.js';

interface MenubarSubContentProps {
	sideOffset?: number;
	alignOffset?: number;
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<MenubarSubContentProps>(), {
	sideOffset: 2,
	alignOffset: -5,
	loop: true,
});

const classes = computed(() => cn(menubarSubContentVariants(), props.class));
</script>
