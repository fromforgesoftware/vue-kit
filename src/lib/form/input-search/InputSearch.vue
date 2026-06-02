<template>
	<div data-slot="input-search-wrapper" :class="wrapperClasses">
		<span data-slot="input-search-icon" :class="iconClasses" aria-hidden="true">
			<Icon :icon="Search" :size="iconSize" aria-hidden="true" />
		</span>
		<input
			data-slot="input-search-input"
			type="search"
			:value="internalValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:class="inputClasses"
			v-bind="attrs"
			@input="onInput"
			@keydown="onKeydown"
		/>
		<Button
			v-if="showClear"
			variant="ghost"
			data-slot="input-search-clear"
			:class="clearClasses"
			:aria-label="clearLabel"
			:disabled="disabled"
			@click="clearSearch"
		>
			<Icon :icon="CircleX" :size="iconSize" aria-hidden="true" />
		</Button>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, useAttrs } from 'vue';
import { Search, CircleX } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import type { IconSize } from '../../general/icon/icon.js';

// `inheritAttrs: false` so HTML attributes (id, name, autocomplete…)
// land on the inner native `<input>`, not on the wrapper.
defineOptions({ inheritAttrs: false });
import { cn } from '../../../helpers/cn.js';
import {
	inputSearchVariants,
	inputSearchInputVariants,
	inputSearchIconVariants,
	inputSearchClearVariants,
	type InputSearchSize,
	type InputSearchVariant,
} from './input-search.js';

interface InputSearchProps {
	/** The search query value (v-model). */
	modelValue?: string;
	/** Placeholder text. */
	placeholder?: string;
	/** Debounce time in milliseconds. `0` emits synchronously. */
	debounceTime?: number;
	/** Disabled state. */
	disabled?: boolean;
	/** Convenience for `aria-invalid="true"` + error border. */
	error?: boolean;
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: InputSearchSize;
	/** Visual style. `error` flips border/ring to destructive tones. */
	variant?: InputSearchVariant;
	/** id of helper / error text describing this input. */
	describedBy?: string;
	/** Accessible name for the clear button. */
	clearLabel?: string;
	/** Hide the clear button even when there's a value. */
	hideClear?: boolean;
	/** Wrapper classes. */
	class?: string;
	/** Inner input classes. */
	inputClass?: string;
}

const props = withDefaults(defineProps<InputSearchProps>(), {
	modelValue: '',
	placeholder: 'Search...',
	debounceTime: 0,
	disabled: false,
	error: false,
	size: 'default',
	variant: 'default',
	clearLabel: 'Clear search',
	hideClear: false,
});

const emit = defineEmits<{
	/** Fires on every keystroke (debounced when `debounceTime > 0`). */
	'update:modelValue': [value: string];
	/** Fires when user presses Enter. */
	search: [value: string];
	/** Fires when the clear button is clicked. */
	clear: [];
}>();

const attrs = useAttrs();

const internalValue = ref(props.modelValue);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// Watch for external value changes
watch(
	() => props.modelValue,
	(newValue) => {
		internalValue.value = newValue;
	},
);

const onInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	internalValue.value = target.value;

	if (debounceTimeout) {
		clearTimeout(debounceTimeout);
	}

	if (props.debounceTime > 0) {
		debounceTimeout = setTimeout(() => {
			emit('update:modelValue', internalValue.value);
		}, props.debounceTime);
	} else {
		emit('update:modelValue', internalValue.value);
	}
};

const onKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Enter') {
		// Flush any pending debounced emit so the search handler sees the latest
		// value, not the previous tick.
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
			debounceTimeout = null;
			emit('update:modelValue', internalValue.value);
		}
		emit('search', internalValue.value);
	}
};

const clearSearch = () => {
	internalValue.value = '';
	if (debounceTimeout) {
		clearTimeout(debounceTimeout);
		debounceTimeout = null;
	}
	emit('update:modelValue', '');
	emit('clear');
};

onUnmounted(() => {
	if (debounceTimeout) {
		clearTimeout(debounceTimeout);
	}
});

const effectiveVariant = computed<InputSearchVariant>(() =>
	props.error ? 'error' : props.variant,
);

const wrapperClasses = computed(() =>
	cn(inputSearchVariants({ size: props.size, variant: effectiveVariant.value }), props.class),
);
const inputClasses = computed(() =>
	cn(inputSearchInputVariants({ size: props.size }), props.inputClass),
);
const iconClasses = computed(() => cn(inputSearchIconVariants({ size: props.size })));
const clearClasses = computed(() => cn(inputSearchClearVariants({ size: props.size })));

const showClear = computed(() => !props.hideClear && !!internalValue.value);

// Map input size to the Icon component's size scale.
// sm input (28px) → xs-sm (14px), default/lg → sm (16px).
const iconSize = computed<IconSize>(() => (props.size === 'sm' ? 'xs-sm' : 'sm'));
</script>
