<template>
	<NumberFieldDecrement
		:class="classes"
		data-slot="number-field-decrement"
		:aria-label="ariaLabel ?? 'Decrease value'"
	>
		<slot>
			<Icon :icon="Minus" size="sm" aria-hidden="true" />
		</slot>
	</NumberFieldDecrement>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { NumberFieldDecrement } from 'reka-ui';
import { Minus } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { numberFieldButtonVariants, type NumberFieldSize } from './number-field.js';
import { numberFieldContextKey } from './context.js';

interface NumberFieldDecrementProps {
	/** Override size; defaults to context (the parent NumberField). */
	size?: NumberFieldSize;
	/** Accessible name for the button. Defaults to `Decrease value`. */
	ariaLabel?: string;
	class?: string;
}

const props = defineProps<NumberFieldDecrementProps>();

const ctx = inject(numberFieldContextKey, null);
const size = computed<NumberFieldSize>(() => props.size ?? ctx?.size.value ?? 'default');

const classes = computed(() =>
	cn(numberFieldButtonVariants({ side: 'decrement', size: size.value }), props.class),
);
</script>
