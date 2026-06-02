<template>
	<EditableRoot
		v-bind="rootProps"
		:class="props.class"
		data-slot="editable"
		@update:model-value="emit('update:modelValue', $event)"
		@submit="emit('submit', $event ?? '')"
		@update:state="emit('update:state', $event)"
	>
		<slot />
	</EditableRoot>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { EditableRoot } from 'reka-ui';
import type { EditableSize } from './editable.js';
import { editableSizeKey } from './context.js';

interface EditableProps {
	/** Controlled text value. */
	modelValue?: string;
	/** Initial value when uncontrolled. */
	defaultValue?: string;
	/** Placeholder shown when the value is empty (preview and input share). */
	placeholder?: string;
	/** Disable interaction. */
	disabled?: boolean;
	/** Read-only — preview is shown, edit mode cannot be entered. */
	readonly?: boolean;
	/** When the value commits: on blur, Enter, both, or only on the explicit Save trigger. */
	submitMode?: 'none' | 'blur' | 'enter' | 'both';
	/** How edit mode is activated from the preview. */
	activationMode?: 'focus' | 'dblclick' | 'none';
	/** Select the input value when entering edit mode. */
	selectOnFocus?: boolean;
	/** Maximum input length (delegated to Reka). */
	maxLength?: number;
	/** Density. Sub-components inherit this via provide/inject. */
	size?: EditableSize;
	/** Render the input full-width to fit the available space. */
	autoResize?: boolean;
	/** Native form `name`. */
	name?: string;
	/** Required attribute. */
	required?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<EditableProps>(), {
	disabled: false,
	readonly: false,
	submitMode: 'blur',
	activationMode: 'focus',
	selectOnFocus: false,
	size: 'default',
	autoResize: false,
	required: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	submit: [value: string];
	'update:state': [state: 'edit' | 'submit' | 'cancel'];
}>();

// Forward the size to descendants — Preview / Input / Triggers all read it
// via inject so a single `<Editable size="sm">` styles every part.
const sizeRef = computed<EditableSize>(() => props.size);
provide(editableSizeKey, sizeRef);

// Reka enforces controlled-vs-uncontrolled mode by the presence of the props.
const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		disabled: props.disabled,
		readonly: props.readonly,
		submitMode: props.submitMode,
		activationMode: props.activationMode,
		selectOnFocus: props.selectOnFocus,
		autoResize: props.autoResize,
		required: props.required,
	};
	if (props.modelValue !== undefined) result.modelValue = props.modelValue;
	if (props.defaultValue !== undefined) result.defaultValue = props.defaultValue;
	if (props.placeholder !== undefined) result.placeholder = props.placeholder;
	if (props.maxLength !== undefined) result.maxLength = props.maxLength;
	if (props.name !== undefined) result.name = props.name;
	return result;
});
</script>
