<template>
	<div
		data-slot="input-chip-wrapper"
		:class="wrapperClasses"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		@click="focusInput"
	>
		<!-- Chips -->
		<span
			v-for="(chip, index) in modelValue"
			:key="`${chip}-${index}`"
			data-slot="input-chip"
			:class="tagClasses"
		>
			{{ chip }}
			<Button
				v-if="removable"
				variant="ghost"
				data-slot="input-chip-remove"
				:class="removeClasses"
				:disabled="disabled"
				:aria-label="removeLabel"
				@click.stop="removeChip(index)"
			>
				<Icon :icon="X" aria-hidden="true" />
			</Button>
		</span>

		<!-- Input -->
		<input
			ref="inputRef"
			v-model="inputValue"
			data-slot="input-chip-input"
			type="text"
			:class="inputClasses"
			:placeholder="modelValue.length === 0 ? placeholder : ''"
			:disabled="disabled || atMax"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			v-bind="attrs"
			@keydown="handleKeyDown"
		/>

		<!-- Clear-all button -->
		<Button
			v-if="clearable && modelValue.length > 0"
			variant="ghost"
			data-slot="input-chip-clear"
			:class="clearClasses"
			:disabled="disabled"
			:aria-label="clearLabel"
			@click.stop="clearAll"
		>
			<Icon :icon="CircleX" aria-hidden="true" />
		</Button>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { X, CircleX } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';

// `inheritAttrs: false` so HTML attributes (id, name, autocomplete…)
// land on the inner native `<input>`, not on the wrapper.
defineOptions({ inheritAttrs: false });
import { cn } from '../../../helpers/cn';
import {
	inputChipVariants,
	inputChipInputVariants,
	inputChipTagVariants,
	inputChipRemoveVariants,
	inputChipClearVariants,
	type InputChipSize,
	type InputChipVariant,
	type InputChipTagVariant,
} from './input-chip';

interface InputChipProps {
	/** Array of chip values (v-model). */
	modelValue?: string[];
	/** Placeholder text. */
	placeholder?: string;
	/** When true, chips can be removed individually. */
	removable?: boolean;
	/** When true, shows a trailing "clear all" button. */
	clearable?: boolean;
	/** Disabled state. */
	disabled?: boolean;
	/** Convenience for `aria-invalid="true"` + error border. */
	error?: boolean;
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px (min height). */
	size?: InputChipSize;
	/** Visual style. `error` flips border/ring to destructive tones. */
	variant?: InputChipVariant;
	/** Visual style applied to chips. Mirrors a subset of Badge variants. */
	chipVariant?: InputChipTagVariant;
	/** Maximum number of chips. New entries beyond this are rejected. */
	maxChips?: number;
	/** id of helper / error text describing this input. */
	describedBy?: string;
	/** Accessible name for the per-chip remove button. */
	removeLabel?: string;
	/** Accessible name for the trailing clear-all button. */
	clearLabel?: string;
	/** Wrapper classes. */
	class?: string;
}

const props = withDefaults(defineProps<InputChipProps>(), {
	modelValue: () => [],
	placeholder: 'Type and press Enter...',
	removable: true,
	clearable: false,
	disabled: false,
	error: false,
	size: 'default',
	variant: 'default',
	chipVariant: 'secondary',
	removeLabel: 'Remove',
	clearLabel: 'Clear all',
});

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
	/** Fires when a chip is added. */
	add: [value: string];
	/** Fires when a chip is removed (by remove button or backspace). */
	remove: [value: string, index: number];
	/** Fires when the clear-all button is clicked. */
	clear: [];
}>();

const attrs = useAttrs();

const inputRef = ref<HTMLInputElement | null>(null);
const inputValue = ref('');

const effectiveVariant = computed<InputChipVariant>(() => (props.error ? 'error' : props.variant));

const wrapperClasses = computed(() =>
	cn(inputChipVariants({ size: props.size, variant: effectiveVariant.value }), props.class),
);
const inputClasses = computed(() => cn(inputChipInputVariants({ size: props.size })));
const tagClasses = computed(() =>
	cn(inputChipTagVariants({ size: props.size, variant: props.chipVariant })),
);
const removeClasses = computed(() => cn(inputChipRemoveVariants({ size: props.size })));
const clearClasses = computed(() => cn(inputChipClearVariants({ size: props.size })));

const atMax = computed(() =>
	props.maxChips !== undefined ? props.modelValue.length >= props.maxChips : false,
);

function handleKeyDown(event: KeyboardEvent): void {
	if (props.disabled) return;

	const value = inputValue.value.trim();

	// Enter or Comma to add chip
	if ((event.key === 'Enter' || event.key === ',') && value) {
		event.preventDefault();
		if (atMax.value) return;
		if (!props.modelValue.includes(value)) {
			emit('update:modelValue', [...props.modelValue, value]);
			emit('add', value);
		}
		inputValue.value = '';
		return;
	}

	// Backspace removes last chip when input is empty
	if (event.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
		const lastIndex = props.modelValue.length - 1;
		const removed = props.modelValue[lastIndex];
		const newValues = props.modelValue.slice(0, lastIndex);
		emit('update:modelValue', newValues);
		emit('remove', removed, lastIndex);
	}
}

function removeChip(index: number): void {
	if (props.disabled) return;
	const removed = props.modelValue[index];
	const newValues = [...props.modelValue];
	newValues.splice(index, 1);
	emit('update:modelValue', newValues);
	emit('remove', removed, index);
}

function clearAll(): void {
	if (props.disabled) return;
	emit('update:modelValue', []);
	emit('clear');
}

function focusInput(): void {
	inputRef.value?.focus();
}
</script>
