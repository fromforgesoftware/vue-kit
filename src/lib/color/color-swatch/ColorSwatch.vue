<template>
	<RekaColorSwatch
		data-slot="color-swatch"
		:color="color"
		:label="label"
		:class="classes"
		:style="{ backgroundColor: color }"
	>
		<slot />
	</RekaColorSwatch>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ColorSwatch as RekaColorSwatch } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { colorSwatchVariants, type ColorSwatchSize, type ColorSwatchShape } from './color-swatch';

interface Props {
	/** Any valid CSS color string (hex, rgb, hsl, named). */
	color: string;
	/** Display name announced to assistive tech. Defaults to the colour string. */
	label?: string;
	/** Density. xs–xl available. */
	size?: ColorSwatchSize;
	/** Square (default) or circle. */
	shape?: ColorSwatchShape;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	size: 'default',
	shape: 'square',
});

const classes = computed(() =>
	cn(colorSwatchVariants({ size: props.size, shape: props.shape }), props.class),
);

// `<ColorSwatch>` from Reka renders an inline element with role="img" and an
// aria-label automatically derived from the colour value.
</script>
