<template>
	<ContextMenuRadioItem
		data-slot="context-menu-radio-item"
		:value="value"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="emit('select', $event)"
	>
		<span class="absolute left-2 flex size-3.5 items-center justify-center">
			<ContextMenuItemIndicator>
				<Icon :icon="Circle" size="2xs" class="fill-current" />
			</ContextMenuItemIndicator>
		</span>
		<slot />
	</ContextMenuRadioItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuRadioItem, ContextMenuItemIndicator } from 'reka-ui';
import { Circle } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import { contextMenuRadioItemVariants } from './context-menu';

interface ContextMenuRadioItemProps {
	/** The unique value of the item. */
	value: string;
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	class?: string;
}

const props = withDefaults(defineProps<ContextMenuRadioItemProps>(), {
	disabled: false,
});

const emit = defineEmits<{
	select: [event: Event];
}>();

const classes = computed(() => cn(contextMenuRadioItemVariants(), props.class));
</script>
