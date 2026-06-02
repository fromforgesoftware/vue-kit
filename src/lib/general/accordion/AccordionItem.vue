<template>
	<AccordionItem data-slot="accordion-item" :value="value" :disabled="disabled" :class="classes">
		<slot />
	</AccordionItem>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { AccordionItem } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { accordionItemVariants, ACCORDION_VARIANT_KEY, type AccordionVariant } from './accordion.js';

interface AccordionItemProps {
	/**
	 * A unique value for the item.
	 */
	value: string;
	/**
	 * When true, prevents the user from interacting with the item.
	 */
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<AccordionItemProps>(), {
	disabled: false,
});

const injectedVariant = inject(ACCORDION_VARIANT_KEY, ref<AccordionVariant>('default'));

const classes = computed(() =>
	cn(accordionItemVariants({ variant: injectedVariant.value }), props.class),
);
</script>
