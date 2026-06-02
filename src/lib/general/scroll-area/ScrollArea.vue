<template>
	<ScrollAreaRoot
		:type="type"
		:scroll-hide-delay="scrollHideDelay"
		:dir="dir"
		:class="rootClasses"
		data-slot="scroll-area"
	>
		<ScrollAreaViewport :class="viewportClasses" data-slot="scroll-area-viewport">
			<slot />
		</ScrollAreaViewport>
		<ScrollAreaScrollbar
			v-if="showVerticalBar"
			:class="cn(scrollAreaScrollbarVariants({ orientation: 'vertical' }))"
			orientation="vertical"
			data-slot="scroll-area-scrollbar"
		>
			<ScrollAreaThumb :class="cn(scrollAreaThumbVariants())" data-slot="scroll-area-thumb" />
		</ScrollAreaScrollbar>
		<ScrollAreaScrollbar
			v-if="showHorizontalBar"
			:class="cn(scrollAreaScrollbarVariants({ orientation: 'horizontal' }))"
			orientation="horizontal"
			data-slot="scroll-area-scrollbar"
		>
			<ScrollAreaThumb :class="cn(scrollAreaThumbVariants())" data-slot="scroll-area-thumb" />
		</ScrollAreaScrollbar>
		<ScrollAreaCorner data-slot="scroll-area-corner" />
	</ScrollAreaRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
	ScrollAreaRoot,
	ScrollAreaViewport,
	ScrollAreaScrollbar,
	ScrollAreaThumb,
	ScrollAreaCorner,
} from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	scrollAreaVariants,
	scrollAreaViewportVariants,
	scrollAreaScrollbarVariants,
	scrollAreaThumbVariants,
	type ScrollAreaOrientation,
} from './scroll-area';

type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover';

interface ScrollAreaProps {
	class?: string;
	/** Class applied to the inner viewport (the scrolling element). */
	viewportClass?: string;
	/**
	 * Which axes can scroll.
	 * - `vertical` — vertical only (default).
	 * - `horizontal` — horizontal only.
	 * - `both` — render scrollbars on both axes.
	 */
	orientation?: ScrollAreaOrientation;
	/** Show or hide custom scrollbars. When false, scrolling still works. */
	showScrollbar?: boolean;
	/**
	 * Reka scrollbar visibility mode.
	 * - `hover` (default) — visible on hover or when scrolling.
	 * - `always` — always visible (good for tests and dense UIs).
	 * - `scroll` — visible while the user is scrolling.
	 * - `auto` — visible only when the content overflows.
	 */
	type?: ScrollAreaType;
	/** Time before the scrollbar hides after the user stops scrolling (ms). */
	scrollHideDelay?: number;
	/** Reading direction for horizontal scrolling. */
	dir?: 'ltr' | 'rtl';
}

const props = withDefaults(defineProps<ScrollAreaProps>(), {
	orientation: 'vertical',
	showScrollbar: true,
	type: 'hover',
	scrollHideDelay: 600,
});

const rootClasses = computed(() => cn(scrollAreaVariants(), props.class));
const viewportClasses = computed(() => cn(scrollAreaViewportVariants(), props.viewportClass));

const showVerticalBar = computed(
	() => props.showScrollbar && (props.orientation === 'vertical' || props.orientation === 'both'),
);
const showHorizontalBar = computed(
	() => props.showScrollbar && (props.orientation === 'horizontal' || props.orientation === 'both'),
);
</script>
