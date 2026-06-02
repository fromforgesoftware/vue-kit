<template>
	<NumberFieldInput
		:class="classes"
		data-slot="number-field-input"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
	/>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { NumberFieldInput } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	numberFieldInputVariants,
	type NumberFieldSize,
	type NumberFieldVariant,
} from './number-field.js';
import { numberFieldContextKey } from './context.js';

interface NumberFieldInputProps {
	/** Override size; defaults to context (the parent NumberField). */
	size?: NumberFieldSize;
	/** Override variant; defaults to context. */
	variant?: NumberFieldVariant;
	class?: string;
}

const props = defineProps<NumberFieldInputProps>();

const ctx = inject(numberFieldContextKey, null);
const size = computed<NumberFieldSize>(() => props.size ?? ctx?.size.value ?? 'default');
const variant = computed<NumberFieldVariant>(
	() => props.variant ?? ctx?.variant.value ?? 'default',
);
const error = computed(() => ctx?.error.value ?? false);
const describedBy = computed(() => ctx?.describedBy.value);

const classes = computed(() =>
	cn(numberFieldInputVariants({ size: size.value, variant: variant.value }), props.class),
);
</script>
