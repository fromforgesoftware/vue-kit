<template>
	<div data-slot="font-manager" :class="containerClasses">
		<Label id="font-manager-label">Font Size</Label>
		<Select :model-value="fontSize" @update:model-value="handleValueChange">
			<SelectTrigger
				data-slot="font-manager-select"
				:class="triggerClasses"
				aria-labelledby="font-manager-label"
			>
				<SelectValue placeholder="Select font size" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem
					v-for="option in options"
					:key="option.value"
					:value="option.value"
					:text-value="option.label"
				>
					<span :class="fontManagerItemLabelVariants()">
						{{ option.label }}
					</span>
				</SelectItem>
			</SelectContent>
		</Select>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../form/select/index.js';
import { Label } from '../../form/label/index.js';
import {
	type FontSizeOption,
	DEFAULT_FONT_SIZE_OPTIONS,
	fontManagerContainerVariants,
	fontManagerTriggerVariants,
	fontManagerItemLabelVariants,
} from './font-manager.js';
import { useFontManager } from './useFontManager.js';

interface FontManagerProps {
	/**
	 * Override the default set of font size options.
	 */
	options?: FontSizeOption[];
	class?: string;
}

const props = withDefaults(defineProps<FontManagerProps>(), {
	options: () => DEFAULT_FONT_SIZE_OPTIONS,
});

const { fontSize, setFontSize } = useFontManager();

const containerClasses = computed(() => cn(fontManagerContainerVariants(), props.class));
const triggerClasses = computed(() => cn(fontManagerTriggerVariants()));

function handleValueChange(value: string | string[]) {
	setFontSize(value as FontSizeOption['value']);
}
</script>
