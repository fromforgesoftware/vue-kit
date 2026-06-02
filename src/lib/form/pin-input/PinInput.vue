<template>
	<PinInputRoot
		v-bind="rootProps"
		:class="rootClasses"
		data-slot="pin-input"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:aria-label="ariaLabel"
		@update:model-value="emit('update:modelValue', $event)"
		@complete="emit('complete', $event)"
	>
		<PinInputInput
			v-for="index in length"
			:key="index"
			:index="index - 1"
			:class="inputClasses"
			:aria-invalid="error || undefined"
			:aria-label="cellLabel.replace('{n}', String(index))"
			data-slot="pin-input-cell"
		/>
	</PinInputRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PinInputRoot, PinInputInput } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	pinInputRootVariants,
	pinInputInputVariants,
	type PinInputSize,
	type PinInputVariant,
} from './pin-input.js';

interface PinInputProps {
	/** Array of per-cell string values. Length matches `length`. */
	modelValue?: string[];
	/** Number of input cells to render. */
	length?: number;
	/** Restricts input to numeric characters only. */
	type?: 'text' | 'number';
	/** Enables OTP autocomplete (`autocomplete="one-time-code"`). */
	otp?: boolean;
	/** Masks the input values (password-style). */
	mask?: boolean;
	/** Disabled state. */
	disabled?: boolean;
	/** Convenience for `aria-invalid="true"` + error border. */
	error?: boolean;
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: PinInputSize;
	/** Visual style. `error` flips border/ring to destructive tones. */
	variant?: PinInputVariant;
	/** Placeholder character displayed in empty cells. */
	placeholder?: string;
	/** id of the element(s) describing the input — error or hint text. */
	describedBy?: string;
	/** Accessible name for the group when no visible Label is paired. */
	ariaLabel?: string;
	/** Per-cell accessible name template. Use `{n}` to inject the 1-based index. */
	cellLabel?: string;
	/** Extra wrapper classes. */
	class?: string;
	/** Extra classes on each cell. */
	inputClass?: string;
}

const props = withDefaults(defineProps<PinInputProps>(), {
	length: 4,
	type: 'text',
	otp: false,
	mask: false,
	disabled: false,
	error: false,
	size: 'default',
	variant: 'default',
	placeholder: 'O',
	cellLabel: 'Digit {n}',
});

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
	/** Fires when all cells are filled. */
	complete: [value: string[]];
}>();

const effectiveVariant = computed<PinInputVariant>(() => (props.error ? 'error' : props.variant));

const rootClasses = computed(() => cn(pinInputRootVariants({ size: props.size }), props.class));
const inputClasses = computed(() =>
	cn(
		pinInputInputVariants({ size: props.size, variant: effectiveVariant.value }),
		props.inputClass,
	),
);

const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		type: props.type,
		otp: props.otp,
		mask: props.mask,
		disabled: props.disabled,
		placeholder: props.placeholder,
	};
	if (props.modelValue !== undefined) result.modelValue = props.modelValue;
	return result;
});
</script>
