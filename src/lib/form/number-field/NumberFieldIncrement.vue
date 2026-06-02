<template>
	<NumberFieldIncrement
		:class="classes"
		data-slot="number-field-increment"
		:aria-label="ariaLabel ?? 'Increase value'"
	>
		<slot>
			<Icon :icon="Plus" size="sm" aria-hidden="true" />
		</slot>
	</NumberFieldIncrement>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { NumberFieldIncrement } from 'reka-ui';
import { Plus } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import { numberFieldButtonVariants, type NumberFieldSize } from './number-field';
import { numberFieldContextKey } from './context';

interface NumberFieldIncrementProps {
	/** Override size; defaults to context (the parent NumberField). */
	size?: NumberFieldSize;
	/** Accessible name for the button. Defaults to `Increase value`. */
	ariaLabel?: string;
	class?: string;
}

const props = defineProps<NumberFieldIncrementProps>();

const ctx = inject(numberFieldContextKey, null);
const size = computed<NumberFieldSize>(() => props.size ?? ctx?.size.value ?? 'default');

const classes = computed(() =>
	cn(numberFieldButtonVariants({ side: 'increment', size: size.value }), props.class),
);
</script>
