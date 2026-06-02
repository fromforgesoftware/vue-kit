<template>
	<DropdownMenuPortal>
		<DropdownMenuContent
			data-slot="dropdown-menu-content"
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
		</DropdownMenuContent>
	</DropdownMenuPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuContent, DropdownMenuPortal } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { dropdownMenuContentVariants, type DropdownMenuContentVariants } from './dropdown-menu';

type DropdownSide = 'top' | 'right' | 'bottom' | 'left';
type DropdownAlign = 'start' | 'center' | 'end';

interface DropdownMenuContentProps {
	side?: DropdownSide;
	sideOffset?: number;
	align?: DropdownAlign;
	alignOffset?: number;
	size?: DropdownMenuContentVariants['size'];
	/** Loop keyboard navigation between first/last items. */
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
	side: 'bottom',
	sideOffset: 4,
	align: 'start',
	alignOffset: 0,
	size: 'default',
	loop: true,
});

const emit = defineEmits<{
	escapeKeyDown: [event: KeyboardEvent];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	interactOutside: [event: Event];
	closeAutoFocus: [event: Event];
}>();

const classes = computed(() => cn(dropdownMenuContentVariants({ size: props.size }), props.class));
</script>
