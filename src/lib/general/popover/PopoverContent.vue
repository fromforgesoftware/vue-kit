<template>
	<PopoverPortal>
		<PopoverContent
			data-slot="popover-content"
			:side="side"
			:side-offset="sideOffset"
			:align="align"
			:align-offset="alignOffset"
			:force-mount="forceMount"
			:aria-label="ariaLabel"
			:class="contentClasses"
			@escape-key-down="emit('escapeKeyDown', $event)"
			@pointer-down-outside="emit('pointerDownOutside', $event)"
			@focus-outside="emit('focusOutside', $event)"
			@interact-outside="emit('interactOutside', $event)"
			@open-auto-focus="emit('openAutoFocus', $event)"
			@close-auto-focus="emit('closeAutoFocus', $event)"
		>
			<slot />
			<PopoverClose v-if="!hideCloseButton" :class="closeClasses" aria-label="Close">
				<Icon :icon="X" size="sm" aria-hidden="true" />
			</PopoverClose>
		</PopoverContent>
	</PopoverPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PopoverContent, PopoverPortal, PopoverClose } from 'reka-ui';
import { X } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import {
	popoverContentVariants,
	popoverCloseVariants,
	type PopoverContentVariants,
} from './popover.js';

type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
type PopoverAlign = 'start' | 'center' | 'end';

interface PopoverContentProps {
	side?: PopoverSide;
	sideOffset?: number;
	align?: PopoverAlign;
	alignOffset?: number;
	size?: PopoverContentVariants['size'];
	hideCloseButton?: boolean;
	forceMount?: boolean;
	/** Accessible name when the popover has no title. */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<PopoverContentProps>(), {
	side: 'bottom',
	sideOffset: 4,
	align: 'center',
	alignOffset: 0,
	size: 'default',
	hideCloseButton: false,
	forceMount: false,
});

const emit = defineEmits<{
	escapeKeyDown: [event: KeyboardEvent];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	interactOutside: [event: Event];
	openAutoFocus: [event: Event];
	closeAutoFocus: [event: Event];
}>();

const contentClasses = computed(() =>
	cn(popoverContentVariants({ size: props.size }), props.class),
);
const closeClasses = computed(() => cn(popoverCloseVariants()));
</script>
