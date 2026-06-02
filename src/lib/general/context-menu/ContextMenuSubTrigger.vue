<template>
	<ContextMenuSubTrigger
		data-slot="context-menu-sub-trigger"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
	>
		<slot />
		<Icon :icon="ChevronRight" size="sm" class="ml-auto" />
	</ContextMenuSubTrigger>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuSubTrigger } from 'reka-ui';
import { ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import { contextMenuSubTriggerVariants } from './context-menu';

interface ContextMenuSubTriggerProps {
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	/** When true, the item is visually indented. */
	inset?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<ContextMenuSubTriggerProps>(), {
	disabled: false,
	inset: false,
});

const classes = computed(() =>
	cn(contextMenuSubTriggerVariants({ inset: props.inset }), props.class),
);
</script>
