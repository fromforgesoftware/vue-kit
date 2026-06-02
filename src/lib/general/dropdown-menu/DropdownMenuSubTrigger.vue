<template>
	<DropdownMenuSubTrigger
		data-slot="dropdown-menu-sub-trigger"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
	>
		<slot />
		<Icon :icon="ChevronRight" size="sm" class="ml-auto" />
	</DropdownMenuSubTrigger>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuSubTrigger } from 'reka-ui';
import { ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { dropdownMenuSubTriggerVariants } from './dropdown-menu.js';

interface DropdownMenuSubTriggerProps {
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	/** When true, the item is visually indented. */
	inset?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<DropdownMenuSubTriggerProps>(), {
	disabled: false,
	inset: false,
});

const classes = computed(() =>
	cn(dropdownMenuSubTriggerVariants({ inset: props.inset }), props.class),
);
</script>
