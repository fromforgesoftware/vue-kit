<template>
	<NumberFieldRoot
		v-bind="rootProps"
		:class="classes"
		data-slot="number-field"
		@update:model-value="emit('update:modelValue', $event)"
	>
		<slot />
	</NumberFieldRoot>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { NumberFieldRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	numberFieldRootVariants,
	type NumberFieldSize,
	type NumberFieldVariant,
} from './number-field';
import { numberFieldContextKey } from './context';

interface NumberFieldProps {
	/** Controlled numeric value. */
	modelValue?: number;
	/** Default value when uncontrolled. */
	defaultValue?: number;
	/** Increment / decrement amount per step. */
	step?: number;
	/** Minimum allowed value. */
	min?: number;
	/** Maximum allowed value. */
	max?: number;
	/** Disabled state. */
	disabled?: boolean;
	/** Convenience for `aria-invalid="true"` + error border. Prefer this over `variant="error"`. */
	error?: boolean;
	/** id of the element(s) describing the input — error or hint text. */
	describedBy?: string;
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: NumberFieldSize;
	/** Visual style. `error` flips border/ring to destructive tones. */
	variant?: NumberFieldVariant;
	/** `Intl.NumberFormat` options for display formatting. */
	formatOptions?: Intl.NumberFormatOptions;
	/** Extra wrapper classes. */
	class?: string;
}

const props = withDefaults(defineProps<NumberFieldProps>(), {
	step: 1,
	disabled: false,
	error: false,
	size: 'default',
	variant: 'default',
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
}>();

const effectiveVariant = computed<NumberFieldVariant>(() =>
	props.error ? 'error' : props.variant,
);

const classes = computed(() => cn(numberFieldRootVariants({ size: props.size }), props.class));

const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		step: props.step,
		disabled: props.disabled,
	};
	if (props.modelValue !== undefined) result.modelValue = props.modelValue;
	if (props.defaultValue !== undefined) result.defaultValue = props.defaultValue;
	if (props.min !== undefined) result.min = props.min;
	if (props.max !== undefined) result.max = props.max;
	if (props.formatOptions !== undefined) result.formatOptions = props.formatOptions;
	return result;
});

// Provide size/variant context so Increment/Decrement/Input pick up the same
// density without consumers having to wire props on every sub-component.
provide(numberFieldContextKey, {
	size: computed(() => props.size),
	variant: effectiveVariant,
	disabled: computed(() => props.disabled),
	error: computed(() => props.error),
	describedBy: computed(() => props.describedBy),
});
</script>
