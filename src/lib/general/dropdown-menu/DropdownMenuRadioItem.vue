<template>
	<DropdownMenuRadioItem
		data-slot="dropdown-menu-radio-item"
		:value="value"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="emit('select', $event)"
	>
		<span class="absolute left-2 flex size-3.5 items-center justify-center">
			<DropdownMenuItemIndicator>
				<Icon :icon="Circle" size="2xs" class="fill-current" />
			</DropdownMenuItemIndicator>
		</span>
		<slot />
	</DropdownMenuRadioItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuRadioItem, DropdownMenuItemIndicator } from 'reka-ui';
import { Circle } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { dropdownMenuRadioItemVariants } from './dropdown-menu.js';

interface DropdownMenuRadioItemProps {
	/** The unique value of the item. */
	value: string;
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	class?: string;
}

const props = withDefaults(defineProps<DropdownMenuRadioItemProps>(), {
	disabled: false,
});

const emit = defineEmits<{
	select: [event: Event];
}>();

const classes = computed(() => cn(dropdownMenuRadioItemVariants(), props.class));
</script>
