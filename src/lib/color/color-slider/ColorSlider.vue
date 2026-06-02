<template>
	<ColorSliderRoot
		data-slot="color-slider"
		:model-value="modelValue"
		:default-value="defaultValue"
		:color-space="colorSpace"
		:channel="channel"
		:orientation="orientation"
		:disabled="disabled"
		:aria-label="ariaLabel"
		:class="rootClasses"
		@update:model-value="
			emit('update:modelValue', typeof $event === 'string' ? $event : String($event))
		"
	>
		<ColorSliderTrack data-slot="color-slider-track" :class="trackClasses" />
		<ColorSliderThumb data-slot="color-slider-thumb" :class="thumbClasses" />
	</ColorSliderRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ColorSliderRoot, ColorSliderTrack, ColorSliderThumb, type ColorChannel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	colorSliderRootVariants,
	colorSliderTrackVariants,
	colorSliderThumbVariants,
	type ColorSliderOrientation,
	type ColorSliderSize,
} from './color-slider';

interface Props {
	/** v-model — current colour as a hex string. */
	modelValue?: string;
	/** Initial uncontrolled colour. */
	defaultValue?: string;
	/** Working colour space. */
	colorSpace?: 'hsl' | 'hsb';
	/** The single channel this slider edits (`hue`, `saturation`, `lightness`, `alpha`, etc.). */
	channel: ColorChannel;
	/** Layout. */
	orientation?: ColorSliderOrientation;
	/** Density. Both meet 24×24 hit-area on the thumb via invisible expansion. */
	size?: ColorSliderSize;
	/** Disabled state. */
	disabled?: boolean;
	/** Accessible name override. Reka derives one from `channel` automatically. */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	defaultValue: '#000000',
	colorSpace: 'hsl',
	orientation: 'horizontal',
	size: 'default',
	disabled: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const rootClasses = computed(() =>
	cn(colorSliderRootVariants({ orientation: props.orientation, size: props.size }), props.class),
);
const trackClasses = computed(() =>
	cn(colorSliderTrackVariants({ orientation: props.orientation, size: props.size })),
);
const thumbClasses = computed(() => cn(colorSliderThumbVariants({ size: props.size })));
</script>
