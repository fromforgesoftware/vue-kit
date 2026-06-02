<template>
	<HoverCardPortal>
		<HoverCardContent
			:side="side"
			:side-offset="sideOffset"
			:align="align"
			:class="contentClasses"
			data-slot="hover-card-content"
		>
			<slot />
		</HoverCardContent>
	</HoverCardPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { HoverCardPortal, HoverCardContent } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { hoverCardContentVariants, type HoverCardSize } from './hover-card.js';

type HoverCardSide = 'top' | 'right' | 'bottom' | 'left';
type HoverCardAlign = 'start' | 'center' | 'end';

interface HoverCardContentProps {
	/** The preferred side of the trigger to render against when open. */
	side?: HoverCardSide;
	/** The distance in pixels from the trigger. */
	sideOffset?: number;
	/** The preferred alignment against the trigger. */
	align?: HoverCardAlign;
	/** Width tier — `sm` for compact previews, `lg` for richer cards. */
	size?: HoverCardSize;
	class?: string;
}

const props = withDefaults(defineProps<HoverCardContentProps>(), {
	side: 'bottom',
	sideOffset: 4,
	align: 'center',
	size: 'default',
});

const contentClasses = computed(() =>
	cn(hoverCardContentVariants({ size: props.size }), props.class),
);
</script>
