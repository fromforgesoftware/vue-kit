<template>
	<SelectItem
		data-slot="select-item"
		:value="value"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
	>
		<span
			data-slot="select-item-indicator-wrapper"
			class="absolute right-2 flex size-3.5 items-center justify-center"
		>
			<SelectItemIndicator data-slot="select-item-indicator">
				<slot name="indicator-icon">
					<Icon :icon="Check" size="sm" aria-hidden="true" />
				</slot>
			</SelectItemIndicator>
		</span>
		<SelectItemText data-slot="select-item-text">
			<slot />
		</SelectItemText>
	</SelectItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SelectItem, SelectItemText, SelectItemIndicator } from 'reka-ui';
import { Check } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { selectItemVariants } from './select.js';

interface SelectItemProps {
	/** The value of this item — selected when it matches the root's modelValue. */
	value: string;
	/** Disable this item. */
	disabled?: boolean;
	/** Override the text Reka uses for type-ahead (defaults to slot content). */
	textValue?: string;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<SelectItemProps>(), {
	disabled: false,
});

const classes = computed(() => cn(selectItemVariants(), props.class));
</script>
