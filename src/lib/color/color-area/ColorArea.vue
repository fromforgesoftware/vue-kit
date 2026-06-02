<template>
	<ColorAreaRoot
		data-slot="color-area"
		:model-value="modelValue"
		:default-value="defaultValue"
		:color-space="colorSpace"
		:x-channel="xChannel"
		:y-channel="yChannel"
		:disabled="disabled"
		:aria-label="ariaLabel"
		:class="rootClasses"
		@update:model-value="emit('update:modelValue', $event)"
	>
		<template #default="{ style }">
			<ColorAreaArea data-slot="color-area-area" :class="areaClasses" :style="style">
				<ColorAreaThumb data-slot="color-area-thumb" :class="colorAreaThumbVariants()" />
			</ColorAreaArea>
		</template>
	</ColorAreaRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ColorAreaRoot, ColorAreaArea, ColorAreaThumb, type ColorChannel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	colorAreaRootVariants,
	colorAreaAreaVariants,
	colorAreaThumbVariants,
	type ColorAreaSize,
} from './color-area';

interface Props {
	/** v-model — current colour as a hex string. */
	modelValue?: string;
	/** Initial uncontrolled value. */
	defaultValue?: string;
	/** Working colour space. */
	colorSpace?: 'hsl' | 'hsb';
	/** X-axis channel. Defaults to `hue` for `hsl`/`hsb` colour spaces. */
	xChannel?: ColorChannel;
	/** Y-axis channel. Defaults to `saturation`. */
	yChannel?: ColorChannel;
	/** Disabled state — blocks pointer and keyboard interaction. */
	disabled?: boolean;
	/** Square render size. `sm` 160 px, `default` 200 px, `lg` 240 px, `full` fills container. */
	size?: ColorAreaSize;
	/** Accessible name. Defaults to "Color area, hue and saturation". */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	defaultValue: '#ff0000',
	colorSpace: 'hsl',
	disabled: false,
	size: 'default',
	ariaLabel: 'Color area',
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const rootClasses = computed(() => cn(colorAreaRootVariants({ size: props.size }), props.class));
const areaClasses = computed(() => cn(colorAreaAreaVariants({ size: props.size })));
</script>
