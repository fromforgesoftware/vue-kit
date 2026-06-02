<template>
	<MenubarItem
		data-slot="menubar-item"
		:data-variant="variant"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="(e: Event) => emit('select', e)"
	>
		<slot />
	</MenubarItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarItem } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { menubarItemVariants, type MenubarItemVariant } from './menubar';

interface MenubarItemProps {
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	/** When true, the item is visually indented. */
	inset?: boolean;
	/** Visual variant — `destructive` for delete/remove actions. */
	variant?: MenubarItemVariant;
	class?: string;
}

const props = withDefaults(defineProps<MenubarItemProps>(), {
	disabled: false,
	inset: false,
	variant: 'default',
});

const emit = defineEmits<{
	select: [event: Event];
}>();

const classes = computed(() =>
	cn(menubarItemVariants({ inset: props.inset, variant: props.variant }), props.class),
);
</script>
