<template>
	<AccordionRoot
		data-slot="accordion"
		:model-value="modelValue"
		:default-value="defaultValue"
		:type="type"
		:collapsible="collapsible"
		:disabled="disabled"
		:orientation="orientation"
		:class="classes"
		@update:model-value="emit('update:modelValue', $event ?? [])"
	>
		<slot />
	</AccordionRoot>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { AccordionRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	accordionVariants,
	ACCORDION_VARIANT_KEY,
	ACCORDION_CHEVRON_POSITION_KEY,
	ACCORDION_SIZE_KEY,
	type AccordionVariant,
	type AccordionChevronPosition,
	type AccordionSize,
} from './accordion.js';

interface AccordionProps {
	/**
	 * The controlled value of the item(s) to expand.
	 * Use with v-model for single type or v-model for multiple type.
	 */
	modelValue?: string | string[];
	/**
	 * The default value of the item(s) to expand (uncontrolled).
	 */
	defaultValue?: string | string[];
	/**
	 * Whether multiple items can be expanded at once.
	 */
	type?: 'single' | 'multiple';
	/**
	 * When type is "single", allows closing content when clicking trigger for an open item.
	 */
	collapsible?: boolean;
	/**
	 * When true, prevents the user from interacting with the accordion.
	 */
	disabled?: boolean;
	/**
	 * The orientation of the accordion.
	 */
	orientation?: 'horizontal' | 'vertical';
	/** Visual variant */
	variant?: AccordionVariant;
	/** Density tier for trigger and content padding/typography. */
	size?: AccordionSize;
	/** Position of the chevron icon relative to the trigger label. */
	chevronPosition?: AccordionChevronPosition;
	class?: string;
}

const props = withDefaults(defineProps<AccordionProps>(), {
	type: 'single',
	collapsible: true,
	disabled: false,
	orientation: 'vertical',
	variant: 'default',
	size: 'default',
	chevronPosition: 'right',
});

provide(ACCORDION_VARIANT_KEY, toRef(props, 'variant'));
provide(ACCORDION_CHEVRON_POSITION_KEY, toRef(props, 'chevronPosition'));
provide(ACCORDION_SIZE_KEY, toRef(props, 'size'));

const emit = defineEmits<{
	'update:modelValue': [value: string | string[]];
}>();

const classes = computed(() => cn(accordionVariants({ variant: props.variant }), props.class));
</script>
