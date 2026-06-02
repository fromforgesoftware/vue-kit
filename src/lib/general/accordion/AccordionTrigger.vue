<template>
	<AccordionHeader data-slot="accordion-header" class="flex">
		<AccordionTrigger data-slot="accordion-trigger" :class="classes">
			<Icon
				v-if="isLeft"
				:icon="ChevronRight"
				size="sm"
				data-slot="accordion-chevron"
				aria-hidden="true"
				class="text-muted-foreground transition-transform duration-200"
			/>
			<slot />
			<Icon
				v-if="!isLeft"
				:icon="ChevronDown"
				size="sm"
				data-slot="accordion-chevron"
				aria-hidden="true"
				class="text-muted-foreground transition-transform duration-200"
			/>
		</AccordionTrigger>
	</AccordionHeader>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { AccordionHeader, AccordionTrigger } from 'reka-ui';
import { ChevronDown, ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import {
	accordionTriggerVariants,
	ACCORDION_VARIANT_KEY,
	ACCORDION_CHEVRON_POSITION_KEY,
	ACCORDION_SIZE_KEY,
	type AccordionVariant,
	type AccordionChevronPosition,
	type AccordionSize,
} from './accordion.js';

interface AccordionTriggerProps {
	class?: string;
}

const props = defineProps<AccordionTriggerProps>();

const injectedVariant = inject(ACCORDION_VARIANT_KEY, ref<AccordionVariant>('default'));
const injectedChevronPosition = inject(
	ACCORDION_CHEVRON_POSITION_KEY,
	ref<AccordionChevronPosition>('right'),
);
const injectedSize = inject(ACCORDION_SIZE_KEY, ref<AccordionSize>('default'));

const isLeft = computed(() => injectedChevronPosition.value === 'left');

const classes = computed(() =>
	cn(
		accordionTriggerVariants({
			variant: injectedVariant.value,
			size: injectedSize.value,
			chevronPosition: injectedChevronPosition.value,
		}),
		props.class,
	),
);
</script>
