<template>
	<SelectRoot
		data-slot="select"
		:model-value="rootModelValue as string & string[]"
		:default-value="defaultValue as string & string[]"
		:disabled="disabled"
		:name="name"
		:required="required"
		:default-open="defaultOpen"
		:multiple="multiple"
		@update:model-value="emit('update:modelValue', $event)"
		@update:open="emit('update:open', $event)"
	>
		<slot />
	</SelectRoot>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue';
import { SelectRoot } from 'reka-ui';
import { SELECT_MULTI_KEY } from './select';

interface SelectProps {
	/** v-model — string for single-select, string[] for multi. */
	modelValue?: string | string[];
	/** Initial uncontrolled value. */
	defaultValue?: string | string[];
	/** Disable the entire select. */
	disabled?: boolean;
	/** Native form name. */
	name?: string;
	/** Required attribute (native form validation). */
	required?: boolean;
	/** Render the menu open initially (uncontrolled). */
	defaultOpen?: boolean;
	/** When true, allows multiple selections. modelValue should be string[]. */
	multiple?: boolean;
}

const props = withDefaults(defineProps<SelectProps>(), {
	disabled: false,
	required: false,
	defaultOpen: false,
	multiple: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string | string[]];
	'update:open': [value: boolean];
}>();

// Provide multi context for SelectValue to show chips and SelectTrigger to
// switch to a flex-wrap layout when multiple values are present.
const multiCtx = props.multiple
	? {
			get modelValue() {
				return (props.modelValue as string[]) ?? [];
			},
			toggle(value: string) {
				const current = (props.modelValue as string[]) ?? [];
				if (current.includes(value)) {
					emit(
						'update:modelValue',
						current.filter((v: string) => v !== value),
					);
				} else {
					emit('update:modelValue', [...current, value]);
				}
			},
			isSelected(value: string) {
				return ((props.modelValue as string[]) ?? []).includes(value);
			},
		}
	: null;

provide(SELECT_MULTI_KEY, multiCtx);

const rootModelValue = computed(() => props.modelValue);
</script>
