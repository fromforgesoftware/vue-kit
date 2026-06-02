<template>
	<MenubarPortal>
		<MenubarContent
			data-slot="menubar-content"
			:side="side"
			:side-offset="sideOffset"
			:align="align"
			:align-offset="alignOffset"
			:loop="loop"
			:class="classes"
			@escape-key-down="emit('escapeKeyDown', $event)"
			@pointer-down-outside="emit('pointerDownOutside', $event)"
			@focus-outside="emit('focusOutside', $event)"
			@interact-outside="emit('interactOutside', $event)"
			@close-auto-focus="emit('closeAutoFocus', $event)"
		>
			<slot />
		</MenubarContent>
	</MenubarPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarContent, MenubarPortal } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { menubarContentVariants } from './menubar.js';

interface MenubarContentProps {
	side?: 'top' | 'right' | 'bottom' | 'left';
	sideOffset?: number;
	align?: 'start' | 'center' | 'end';
	alignOffset?: number;
	/** Loop keyboard navigation within the content. */
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<MenubarContentProps>(), {
	side: 'bottom',
	sideOffset: 4,
	align: 'start',
	alignOffset: 0,
	loop: true,
});

const emit = defineEmits<{
	escapeKeyDown: [event: KeyboardEvent];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	interactOutside: [event: Event];
	closeAutoFocus: [event: Event];
}>();

const classes = computed(() => cn(menubarContentVariants(), props.class));
</script>
