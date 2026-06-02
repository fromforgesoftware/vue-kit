<template>
	<AccordionContent data-slot="accordion-content" :class="classes">
		<div data-slot="accordion-content-inner" :class="innerClasses">
			<slot />
		</div>
	</AccordionContent>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { AccordionContent } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	accordionContentVariants,
	accordionContentInnerVariants,
	ACCORDION_VARIANT_KEY,
	ACCORDION_SIZE_KEY,
	type AccordionVariant,
	type AccordionSize,
} from './accordion.js';

interface AccordionContentProps {
	class?: string;
}

const props = defineProps<AccordionContentProps>();

const injectedVariant = inject(ACCORDION_VARIANT_KEY, ref<AccordionVariant>('default'));
const injectedSize = inject(ACCORDION_SIZE_KEY, ref<AccordionSize>('default'));

const classes = computed(() => cn(accordionContentVariants({ variant: injectedVariant.value })));
const innerClasses = computed(() =>
	cn(
		accordionContentInnerVariants({ variant: injectedVariant.value, size: injectedSize.value }),
		props.class,
	),
);
</script>
