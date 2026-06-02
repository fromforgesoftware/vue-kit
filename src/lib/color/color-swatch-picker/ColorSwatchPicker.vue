<template>
	<ColorSwatchPickerRoot
		data-slot="color-swatch-picker"
		:model-value="modelValue"
		:default-value="defaultValue"
		:multiple="multiple"
		:disabled="disabled"
		:aria-label="ariaLabel"
		:class="rootClasses"
		@update:model-value="emit('update:modelValue', $event as string | string[])"
	>
		<ColorSwatchPickerItem
			v-for="color in colors"
			:key="color"
			data-slot="color-swatch-picker-item"
			:value="color"
			:class="itemClasses"
		>
			<ColorSwatchPickerItemSwatch
				data-slot="color-swatch-picker-item-swatch"
				:class="colorSwatchPickerItemSwatchVariants()"
				:style="{ backgroundColor: color }"
			/>
			<ColorSwatchPickerItemIndicator
				data-slot="color-swatch-picker-item-indicator"
				:class="colorSwatchPickerItemIndicatorVariants()"
			>
				<Icon :icon="Check" size="sm" aria-hidden="true" />
			</ColorSwatchPickerItemIndicator>
		</ColorSwatchPickerItem>
	</ColorSwatchPickerRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import {
	ColorSwatchPickerRoot,
	ColorSwatchPickerItem,
	ColorSwatchPickerItemSwatch,
	ColorSwatchPickerItemIndicator,
} from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	colorSwatchPickerRootVariants,
	colorSwatchPickerItemVariants,
	colorSwatchPickerItemSwatchVariants,
	colorSwatchPickerItemIndicatorVariants,
	type ColorSwatchPickerLayout,
	type ColorSwatchPickerSize,
} from './color-swatch-picker';

interface Props {
	/** v-model — selected colour (string) or colours (string[] when `multiple`). */
	modelValue?: string | string[];
	/** Initial uncontrolled selection. */
	defaultValue?: string | string[];
	/** Palette: array of hex colours to show as swatches. */
	colors: string[];
	/** Allow selecting multiple colours. */
	multiple?: boolean;
	/** Layout: free-flowing wrap (default) or strict 6-column grid. */
	layout?: ColorSwatchPickerLayout;
	/** Density. Both meet ≥ 24 × 24 hit area. */
	size?: ColorSwatchPickerSize;
	/** Disabled state — blocks all interaction. */
	disabled?: boolean;
	/** Accessible name for the picker group. */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	multiple: false,
	layout: 'flow',
	size: 'default',
	disabled: false,
	ariaLabel: 'Color palette',
});

const emit = defineEmits<{
	'update:modelValue': [value: string | string[]];
}>();

const rootClasses = computed(() =>
	cn(colorSwatchPickerRootVariants({ layout: props.layout }), props.class),
);
const itemClasses = computed(() => colorSwatchPickerItemVariants({ size: props.size }));
</script>
