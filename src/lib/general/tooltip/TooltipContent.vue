<template>
	<TooltipPortal>
		<TooltipContent
			data-slot="tooltip-content"
			:side="side"
			:side-offset="sideOffset"
			:align="align"
			:align-offset="alignOffset"
			:avoid-collisions="avoidCollisions"
			:hide-when-detached="hideWhenDetached"
			:class="contentClasses"
		>
			<slot />
		</TooltipContent>
	</TooltipPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TooltipPortal, TooltipContent } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { tooltipContentVariants } from './tooltip.js';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipContentProps {
	side?: TooltipSide;
	sideOffset?: number;
	align?: TooltipAlign;
	alignOffset?: number;
	avoidCollisions?: boolean;
	hideWhenDetached?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<TooltipContentProps>(), {
	side: 'top',
	sideOffset: 4,
	align: 'center',
	alignOffset: 0,
	avoidCollisions: true,
	hideWhenDetached: false,
});

const contentClasses = computed(() => cn(tooltipContentVariants(), props.class));
</script>
