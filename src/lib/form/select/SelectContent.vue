<template>
	<SelectPortal>
		<SelectContent
			data-slot="select-content"
			:position="position"
			:side="side"
			:side-offset="sideOffset"
			:align="align"
			:align-offset="alignOffset"
			:class="contentClasses"
		>
			<SelectScrollUpButton data-slot="select-scroll-up" :class="scrollButtonClasses">
				<Icon :icon="ChevronUp" size="sm" />
			</SelectScrollUpButton>
			<SelectViewport data-slot="select-viewport" :class="viewportClasses">
				<slot />
			</SelectViewport>
			<SelectScrollDownButton data-slot="select-scroll-down" :class="scrollButtonClasses">
				<Icon :icon="ChevronDown" size="sm" />
			</SelectScrollDownButton>
		</SelectContent>
	</SelectPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
	SelectContent,
	SelectPortal,
	SelectViewport,
	SelectScrollUpButton,
	SelectScrollDownButton,
} from 'reka-ui';
import { ChevronUp, ChevronDown } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import {
	selectContentVariants,
	selectViewportVariants,
	selectScrollButtonVariants,
} from './select.js';

interface SelectContentProps {
	/** `popper` follows the trigger; `item-aligned` aligns the chosen item with the trigger. */
	position?: 'popper' | 'item-aligned';
	side?: 'top' | 'right' | 'bottom' | 'left';
	sideOffset?: number;
	align?: 'start' | 'center' | 'end';
	alignOffset?: number;
	class?: string;
}

const props = withDefaults(defineProps<SelectContentProps>(), {
	position: 'popper',
	side: 'bottom',
	sideOffset: 4,
	align: 'start',
	alignOffset: 0,
});

const contentClasses = computed(() =>
	cn(selectContentVariants({ position: props.position }), props.class),
);
const viewportClasses = computed(() => cn(selectViewportVariants({ position: props.position })));
const scrollButtonClasses = computed(() => cn(selectScrollButtonVariants()));
</script>
