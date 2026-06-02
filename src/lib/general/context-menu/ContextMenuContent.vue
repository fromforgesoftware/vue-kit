<template>
	<ContextMenuPortal>
		<ContextMenuContent
			data-slot="context-menu-content"
			:loop="loop"
			:class="classes"
			@escape-key-down="emit('escapeKeyDown', $event)"
			@pointer-down-outside="emit('pointerDownOutside', $event)"
			@focus-outside="emit('focusOutside', $event)"
			@interact-outside="emit('interactOutside', $event)"
			@close-auto-focus="emit('closeAutoFocus', $event)"
		>
			<slot />
		</ContextMenuContent>
	</ContextMenuPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuContent, ContextMenuPortal } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { contextMenuContentVariants, type ContextMenuContentVariants } from './context-menu';

interface ContextMenuContentProps {
	size?: ContextMenuContentVariants['size'];
	/** Loop keyboard navigation between first/last items. */
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<ContextMenuContentProps>(), {
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

const classes = computed(() => cn(contextMenuContentVariants({ size: props.size }), props.class));
</script>
