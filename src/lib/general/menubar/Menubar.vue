<template>
	<MenubarRoot data-slot="menubar" :loop="loop" :class="classes">
		<slot />
	</MenubarRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { menubarVariants, type MenubarVariants } from './menubar.js';

interface MenubarProps {
	size?: MenubarVariants['size'];
	/** Loop keyboard navigation between first/last top-level menus. */
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<MenubarProps>(), {
	size: 'default',
	loop: true,
});

const classes = computed(() => cn(menubarVariants({ size: props.size }), props.class));
</script>
