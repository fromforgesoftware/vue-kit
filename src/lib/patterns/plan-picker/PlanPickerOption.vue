<template>
	<!--
    `<label>` does not allow role="radio" (axe: aria-allowed-role). Reka's
    RadioGroupItem stamps role="radio" onto the as-child element, so we render
    a plain <div> here. The visual click area is preserved by the cursor and
    selected styles in `containerClasses`.
  -->
	<RadioGroupItem :value="value" :disabled="disabled" as-child>
		<div
			data-slot="plan-picker-option"
			:class="containerClasses"
			:aria-disabled="disabled || undefined"
		>
			<div class="flex flex-col">
				<span :class="nameClasses">
					<slot name="name">{{ name }}</slot>
				</span>
				<span :class="priceClasses">
					<slot name="price">{{ price }}</slot>
				</span>
			</div>

			<div
				class="flex size-5 shrink-0 items-center justify-center rounded-full border border-input shadow-xs transition-colors"
				:class="selected && 'border-primary bg-primary text-primary-foreground'"
			>
				<RadioGroupIndicator class="flex items-center justify-center">
					<svg
						width="8"
						height="8"
						viewBox="0 0 8 8"
						fill="currentcolor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="4" cy="4" r="4" />
					</svg>
				</RadioGroupIndicator>
			</div>
		</div>
	</RadioGroupItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroupItem, RadioGroupIndicator } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	planPickerOptionVariants,
	planPickerOptionNameVariants,
	planPickerOptionPriceVariants,
} from './plan-picker.js';

interface PlanPickerOptionProps {
	/** Unique value for this option */
	value: string;
	/** Plan display name */
	name: string;
	/** Price description */
	price: string;
	/** Whether this option is selected */
	selected?: boolean;
	/** Whether this option is disabled */
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<PlanPickerOptionProps>(), {
	selected: false,
	disabled: false,
});

const containerClasses = computed(() =>
	cn(planPickerOptionVariants({ selected: props.selected }), props.class),
);
const nameClasses = computed(() => cn(planPickerOptionNameVariants()));
const priceClasses = computed(() => cn(planPickerOptionPriceVariants()));
</script>
