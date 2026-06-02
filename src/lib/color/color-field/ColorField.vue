<template>
	<ColorFieldRoot
		data-slot="color-field"
		:model-value="modelValue"
		:default-value="defaultValue"
		:color-space="colorSpace"
		:channel="channel"
		:disabled="disabled"
		:readonly="readonly"
		:name="name"
		:class="wrapperClasses"
		@update:model-value="emit('update:modelValue', $event)"
	>
		<span
			v-if="!hideSwatch"
			data-slot="color-field-swatch"
			aria-hidden="true"
			:class="swatchClasses"
			:style="{ backgroundColor: swatchColor }"
		/>
		<ColorFieldInput
			:id="id"
			data-slot="color-field-input"
			:placeholder="placeholder"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:aria-label="ariaLabel"
			:class="inputClasses"
		/>
	</ColorFieldRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ColorFieldRoot, ColorFieldInput, type ColorChannel } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	colorFieldRootVariants,
	colorFieldSwatchVariants,
	colorFieldInputVariants,
	type ColorFieldVariants,
} from './color-field.js';

interface Props {
	/** v-model — current colour as hex (or numeric channel value when `channel` is set). */
	modelValue?: string;
	/** Initial uncontrolled value. */
	defaultValue?: string;
	/** Working colour space. */
	colorSpace?: 'hsl' | 'hsb' | 'rgb';
	/** Edit a single channel value (e.g. `hue` for a numeric input) — defaults to hex when omitted. */
	channel?: ColorChannel;
	/** Visual style. `error` flips border/ring to destructive tones. */
	variant?: ColorFieldVariants['variant'];
	/** Density. */
	size?: ColorFieldVariants['size'];
	/** Disabled state. */
	disabled?: boolean;
	/** Read-only state. */
	readonly?: boolean;
	/** Convenience for `aria-invalid="true"` + `error` variant. */
	error?: boolean;
	/** id of the element(s) describing the input — error or hint text. */
	describedBy?: string;
	/** Accessible name when no `<Label>` is associated. */
	ariaLabel?: string;
	/** Native `id` forwarded to the inner `<input>`. */
	id?: string;
	/** Native `name` for form submission. */
	name?: string;
	/** Placeholder text. */
	placeholder?: string;
	/** Hide the leading swatch. */
	hideSwatch?: boolean;
	/** Extra classes on the wrapper (layout only — propose a variant for visual changes). */
	class?: string;
	/** Extra classes on the inner native input. */
	inputClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	defaultValue: '#000000',
	colorSpace: 'rgb',
	variant: 'default',
	size: 'default',
	disabled: false,
	readonly: false,
	error: false,
	hideSwatch: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

const wrapperClasses = computed(() =>
	cn(colorFieldRootVariants({ variant: effectiveVariant.value, size: props.size }), props.class),
);
const swatchClasses = computed(() => cn(colorFieldSwatchVariants({ size: props.size })));
const inputClasses = computed(() =>
	cn(colorFieldInputVariants({ size: props.size }), props.inputClass),
);

const swatchColor = computed(() => props.modelValue ?? props.defaultValue);
</script>
