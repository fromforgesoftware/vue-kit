<template>
	<CollapsibleContent :class="outerClasses" data-slot="collapsible-content">
		<div :class="innerClasses" data-slot="collapsible-content-inner">
			<slot />
		</div>
	</CollapsibleContent>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { CollapsibleContent } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	collapsibleContentVariants,
	collapsibleContentInnerVariants,
	COLLAPSIBLE_VARIANT_KEY,
	COLLAPSIBLE_SIZE_KEY,
	type CollapsibleVariant,
	type CollapsibleSize,
} from './collapsible.js';

interface CollapsibleContentProps {
	class?: string;
	/**
	 * Class for the inner wrapper div. Use `'p-0'` (or any other override)
	 * when the slot content needs to bleed to the card edges — the default
	 * adds `px-4 py-3` which is right for prose but wrong for grid surfaces.
	 */
	innerClass?: string;
}

const props = defineProps<CollapsibleContentProps>();

const variant = inject<{ value: CollapsibleVariant } | undefined>(
	COLLAPSIBLE_VARIANT_KEY,
	undefined,
);
const size = inject<{ value: CollapsibleSize } | undefined>(COLLAPSIBLE_SIZE_KEY, undefined);

const outerClasses = computed(() =>
	cn(collapsibleContentVariants({ variant: variant?.value }), props.class),
);
const innerClasses = computed(() =>
	cn(
		collapsibleContentInnerVariants({ variant: variant?.value, size: size?.value }),
		props.innerClass,
	),
);
</script>
