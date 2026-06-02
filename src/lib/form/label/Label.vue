<template>
	<label data-slot="label" :for="props.for" :class="classes">
		<slot />
		<span v-if="required" data-slot="label-required" class="text-destructive" aria-hidden="true">{{
			requiredIndicator
		}}</span>
		<span v-if="required" class="sr-only">{{ requiredLabel }}</span>
	</label>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { labelVariants, type LabelVariants } from './label.js';

interface LabelProps {
	/** id of the form control this label labels (matches the input's `id`). */
	for?: string;
	/** Visual style. `error` flips text colour to destructive — typically when the labelled field is invalid. */
	variant?: LabelVariants['variant'];
	/** Density. Default uses `text-sm` to align with Input's text size. */
	size?: LabelVariants['size'];
	/** Render the `(required)` indicator after the label text. */
	required?: boolean;
	/** Custom indicator text. Default: `*`. */
	requiredIndicator?: string;
	/** Optional accessible text for the required indicator (defaults to `(required)`). */
	requiredLabel?: string;
	/** Extra classes (layout only). */
	class?: string;
}

const props = withDefaults(defineProps<LabelProps>(), {
	variant: 'default',
	size: 'default',
	required: false,
	requiredIndicator: '*',
	requiredLabel: '(required)',
});

const classes = computed(() =>
	cn(labelVariants({ variant: props.variant, size: props.size }), props.class),
);
</script>
