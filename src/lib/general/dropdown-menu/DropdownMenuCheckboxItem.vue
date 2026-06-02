<template>
	<DropdownMenuCheckboxItem
		data-slot="dropdown-menu-checkbox-item"
		:checked="checked"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="onSelect"
	>
		<Checkbox :checked="checked" class="absolute left-2 pointer-events-none" />
		<slot />
	</DropdownMenuCheckboxItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuCheckboxItem } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import Checkbox from '../../form/checkbox/Checkbox.vue';
import { dropdownMenuCheckboxItemVariants } from './dropdown-menu.js';

interface Props {
	checked?: boolean | 'indeterminate';
	disabled?: boolean;
	textValue?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
});

const emit = defineEmits<{
	'update:checked': [value: boolean];
}>();

const classes = computed(() => cn(dropdownMenuCheckboxItemVariants(), props.class));

function onSelect(event: Event) {
	event.preventDefault();
	emit('update:checked', !props.checked);
}
</script>
