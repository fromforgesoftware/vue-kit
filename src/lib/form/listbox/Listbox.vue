<template>
	<ListboxRoot
		data-slot="listbox"
		:model-value="modelValue"
		:default-value="defaultValue"
		:multiple="multiple"
		:disabled="disabled"
		:name="name"
		:orientation="orientation"
		:loop="loop"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="classes"
		@update:model-value="emit('update:modelValue', $event as string | string[])"
	>
		<!--
      The id must live on ListboxContent (the element with role="listbox"),
      not on the ListboxRoot wrapper. Otherwise an external <Label for="…">
      points at a generic wrapper and axe's aria-input-field-name flags the
      listbox as unnamed.
    -->
		<ListboxContent
			:id="id"
			data-slot="listbox-content"
			:class="contentClasses"
			:aria-label="ariaLabel"
			:aria-describedby="describedBy"
		>
			<slot />
		</ListboxContent>
	</ListboxRoot>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { ListboxRoot, ListboxContent } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	listboxVariants,
	listboxContentVariants,
	type ListboxSize,
	LISTBOX_SIZE_KEY,
} from './listbox';

interface ListboxProps {
	/** v-model — string for single-select, string[] for multi. */
	modelValue?: string | string[];
	/** Initial uncontrolled value. */
	defaultValue?: string | string[];
	/** When true, allows multiple items to be selected. */
	multiple?: boolean;
	/** Disable the entire listbox. */
	disabled?: boolean;
	/** Native form name. */
	name?: string;
	/** Density. Caps the visible height before scrolling. */
	size?: ListboxSize;
	/** Layout direction. */
	orientation?: 'horizontal' | 'vertical';
	/** Loop arrow-key navigation between first / last items. */
	loop?: boolean;
	/** Sets `aria-invalid="true"` on the root. */
	error?: boolean;
	/** id of the element(s) describing this listbox — error or hint text. */
	describedBy?: string;
	/** Element id matching the `for` of an associated <Label>. */
	id?: string;
	/** Accessible name when no visible Label is paired. */
	ariaLabel?: string;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<ListboxProps>(), {
	multiple: false,
	disabled: false,
	orientation: 'vertical',
	loop: true,
	size: 'default',
	error: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string | string[]];
}>();

const classes = computed(() => cn(listboxVariants({ size: props.size }), props.class));
const contentClasses = computed(() => cn(listboxContentVariants()));

provide(
	LISTBOX_SIZE_KEY,
	computed(() => props.size),
);
</script>
