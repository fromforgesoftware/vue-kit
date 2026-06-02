<template>
	<DropdownMenuItem
		data-slot="dropdown-menu-item"
		:data-variant="variant"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="(e: Event) => emit('select', e)"
	>
		<slot />
	</DropdownMenuItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuItem } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { dropdownMenuItemVariants, type DropdownMenuItemVariant } from './dropdown-menu.js';

interface DropdownMenuItemProps {
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	/** When true, the item is visually indented. */
	inset?: boolean;
	/** Visual variant — `destructive` for delete/remove actions. */
	variant?: DropdownMenuItemVariant;
	class?: string;
}

const props = withDefaults(defineProps<DropdownMenuItemProps>(), {
	disabled: false,
	inset: false,
	variant: 'default',
});

const emit = defineEmits<{
	select: [event: Event];
}>();

const classes = computed(() =>
	cn(dropdownMenuItemVariants({ inset: props.inset, variant: props.variant }), props.class),
);
</script>
