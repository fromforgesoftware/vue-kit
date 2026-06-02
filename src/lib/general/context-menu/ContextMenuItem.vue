<template>
	<ContextMenuItem
		data-slot="context-menu-item"
		:data-variant="variant"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="(e: Event) => emit('select', e)"
	>
		<slot />
	</ContextMenuItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuItem } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { contextMenuItemVariants, type ContextMenuItemVariant } from './context-menu.js';

interface ContextMenuItemProps {
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	/** When true, the item is visually indented. */
	inset?: boolean;
	/** Visual variant — `destructive` for delete/remove actions. */
	variant?: ContextMenuItemVariant;
	class?: string;
}

const props = withDefaults(defineProps<ContextMenuItemProps>(), {
	disabled: false,
	inset: false,
	variant: 'default',
});

const emit = defineEmits<{
	select: [event: Event];
}>();

const classes = computed(() =>
	cn(contextMenuItemVariants({ inset: props.inset, variant: props.variant }), props.class),
);
</script>
