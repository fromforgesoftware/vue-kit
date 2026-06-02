<template>
	<!-- Labelled, horizontal-only -->
	<div
		v-if="hasLabel && orientation === 'horizontal'"
		data-slot="divider"
		role="separator"
		aria-orientation="horizontal"
		:class="wrapperClasses"
	>
		<span data-slot="divider-line" :class="lineClasses" aria-hidden="true" />
		<span data-slot="divider-label" :class="labelClasses">
			<slot name="label">{{ label }}</slot>
		</span>
		<span data-slot="divider-line" :class="lineClasses" aria-hidden="true" />
	</div>

	<!-- Plain bar -->
	<Separator
		v-else
		data-slot="divider"
		:orientation="orientation"
		:decorative="decorative"
		:class="baseClasses"
	/>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { Separator } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	dividerVariants,
	dividerWithLabelVariants,
	dividerLineVariants,
	dividerLabelVariants,
	type DividerOrientation,
	type DividerVariant,
	type DividerTone,
	type DividerInset,
} from './divider.js';

interface DividerProps {
	orientation?: DividerOrientation;
	variant?: DividerVariant;
	tone?: DividerTone;
	inset?: DividerInset;
	/** When true, the divider is treated as decorative (default). Set false to expose `role="separator"` to AT. */
	decorative?: boolean;
	/** Optional inline label rendered between two line segments. Horizontal only. */
	label?: string;
	class?: string;
}

const props = withDefaults(defineProps<DividerProps>(), {
	orientation: 'horizontal',
	variant: 'solid',
	tone: 'default',
	inset: 'none',
	decorative: true,
});

const slots = useSlots();
const hasLabel = computed(() => Boolean(props.label) || Boolean(slots.label));

const baseClasses = computed(() =>
	cn(
		dividerVariants({
			orientation: props.orientation,
			variant: props.variant,
			tone: props.tone,
			inset: props.inset,
		}),
		props.class,
	),
);

const wrapperClasses = computed(() =>
	cn(dividerWithLabelVariants({ inset: props.inset }), props.class),
);

const lineClasses = computed(() =>
	cn(dividerLineVariants({ variant: props.variant, tone: props.tone })),
);

const labelClasses = computed(() => cn(dividerLabelVariants()));
</script>
