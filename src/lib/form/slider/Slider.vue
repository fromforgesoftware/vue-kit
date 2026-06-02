<template>
	<SliderRoot
		:id="id"
		data-slot="slider"
		:model-value="modelValue"
		:default-value="defaultValue"
		:min="min"
		:max="max"
		:step="step"
		:disabled="disabled"
		:orientation="orientation"
		:inverted="inverted"
		:name="name"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="rootClasses"
		@update:model-value="emit('update:modelValue', $event ?? [])"
	>
		<SliderTrack data-slot="slider-track" :class="trackClasses">
			<SliderRange data-slot="slider-range" :class="rangeClasses" />
		</SliderTrack>
		<SliderThumb
			v-for="index in thumbCount"
			:key="index - 1"
			data-slot="slider-thumb"
			:aria-label="ariaLabel"
			:class="thumbClasses"
		/>
	</SliderRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	sliderVariants,
	sliderTrackVariants,
	sliderRangeVariants,
	sliderThumbVariants,
	type SliderOrientation,
	type SliderSize,
} from './slider';

interface SliderProps {
	/** v-model binding. Always an array — single-thumb sliders use `[value]`. */
	modelValue?: number[];
	/** Initial uncontrolled value. */
	defaultValue?: number[];
	/** Minimum allowed value. */
	min?: number;
	/** Maximum allowed value. */
	max?: number;
	/** Step granularity for keyboard and drag. */
	step?: number;
	/** Disabled state. */
	disabled?: boolean;
	/** Layout direction. */
	orientation?: SliderOrientation;
	/** Reverse the rail direction (e.g. right→left for horizontal). */
	inverted?: boolean;
	/** Density. `sm` paints a 14 px thumb; `default` paints 16 px. Both meet 24×24 hit-area. */
	size?: SliderSize;
	/** Sets `aria-invalid="true"` and tints the thumb destructive. */
	error?: boolean;
	/** id of the element(s) describing the slider — error or hint text. */
	describedBy?: string;
	/** Accessible name for the slider thumb when no Label is associated. */
	ariaLabel?: string;
	/** Native form `name` attribute. */
	name?: string;
	/** Element id. */
	id?: string;
	/** Extra classes (layout only — propose a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<SliderProps>(), {
	modelValue: undefined,
	defaultValue: () => [0],
	min: 0,
	max: 100,
	step: 1,
	disabled: false,
	orientation: 'horizontal',
	inverted: false,
	size: 'default',
	error: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: number[]];
}>();

const rootClasses = computed(() =>
	cn(sliderVariants({ orientation: props.orientation, size: props.size }), props.class),
);
const trackClasses = computed(() =>
	cn(sliderTrackVariants({ orientation: props.orientation, size: props.size })),
);
const rangeClasses = computed(() => cn(sliderRangeVariants({ orientation: props.orientation })));
const thumbClasses = computed(() => cn(sliderThumbVariants({ size: props.size })));

const thumbCount = computed(() => {
	const v = props.modelValue ?? props.defaultValue;
	return Array.isArray(v) ? v.length : 1;
});
</script>
