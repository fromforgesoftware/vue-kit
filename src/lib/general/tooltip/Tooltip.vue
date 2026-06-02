<template>
	<TooltipProvider
		:delay-duration="delayDuration"
		:skip-delay-duration="skipDelayDuration"
		:disable-hoverable-content="disableHoverableContent"
	>
		<TooltipRoot>
			<TooltipTrigger as-child data-slot="tooltip-trigger">
				<slot />
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent
					data-slot="tooltip-content"
					:side="side"
					:align="align"
					:side-offset="sideOffset"
					:class="contentClasses"
				>
					<slot name="content">
						{{ content }}
					</slot>
				</TooltipContent>
			</TooltipPortal>
		</TooltipRoot>
	</TooltipProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
	TooltipRoot,
	TooltipTrigger,
	TooltipPortal,
	TooltipContent,
	TooltipProvider,
} from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { tooltipContentVariants } from './tooltip.js';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipProps {
	/** Tooltip text. For composed content (icons, links), use the `content` slot instead. */
	content?: string;
	/** Side of the trigger to position the tooltip. */
	side?: TooltipSide;
	/** Alignment along the chosen side. */
	align?: TooltipAlign;
	/** Distance in px between trigger and tooltip. */
	sideOffset?: number;
	/** Hover delay before opening (ms). */
	delayDuration?: number;
	/** Window during which adjacent tooltips open without delay (ms). */
	skipDelayDuration?: number;
	/** Disable hovering onto the tooltip itself (only the trigger keeps it open). */
	disableHoverableContent?: boolean;
	/** Additional classes for the content element. */
	class?: string;
}

const props = withDefaults(defineProps<TooltipProps>(), {
	content: undefined,
	side: 'top',
	align: 'center',
	sideOffset: 4,
	delayDuration: 200,
	skipDelayDuration: 300,
	disableHoverableContent: false,
});

const contentClasses = computed(() => cn(tooltipContentVariants(), props.class));
</script>
