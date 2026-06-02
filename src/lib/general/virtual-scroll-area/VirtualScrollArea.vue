<template>
	<ScrollAreaRoot :class="rootClasses" data-slot="virtual-scroll-area">
		<ScrollAreaViewport ref="viewportComponentRef" :class="viewportClasses" @scroll="onScroll">
			<div :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }">
				<div
					v-for="virtualRow in virtualItems"
					:key="virtualRow.key as PropertyKey"
					:ref="(el) => virtualizer.measureElement(el as Element)"
					:data-index="virtualRow.index"
					:style="{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						transform: `translateY(${virtualRow.start}px)`,
					}"
				>
					<slot :item="items[virtualRow.index]" :index="virtualRow.index" />
				</div>
			</div>
			<slot name="footer" />
		</ScrollAreaViewport>
		<ScrollAreaScrollbar v-if="showScrollbar" :class="scrollbarClasses" orientation="vertical">
			<ScrollAreaThumb :class="thumbClasses" />
		</ScrollAreaScrollbar>
		<ScrollAreaCorner />
	</ScrollAreaRoot>
</template>

<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue';
import {
	ScrollAreaRoot,
	ScrollAreaViewport,
	ScrollAreaScrollbar,
	ScrollAreaThumb,
	ScrollAreaCorner,
} from 'reka-ui';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { cn } from '../../../helpers/cn.js';
import {
	scrollAreaVariants,
	scrollAreaViewportVariants,
	scrollAreaScrollbarVariants,
	scrollAreaThumbVariants,
} from '../scroll-area/scroll-area.js';

export interface VirtualScrollAreaProps<T = unknown> {
	/** Items to virtualize */
	items: T[];
	/** Estimated height of each item in pixels */
	estimateSize: number;
	/** Extra items to render above/below the visible area */
	overscan?: number;
	/** Custom class for the root element */
	class?: string;
	/** Custom class for the viewport element */
	viewportClass?: string;
	/** Whether to show scrollbar */
	showScrollbar?: boolean;
}

const props = withDefaults(defineProps<VirtualScrollAreaProps<T>>(), {
	overscan: 5,
	showScrollbar: true,
});

const emit = defineEmits<{
	scrollEnd: [];
}>();

// reka-ui ScrollAreaViewport exposes { viewportElement } via __expose
const viewportComponentRef = ref<{ viewportElement?: HTMLElement } | null>(null);
const scrollElement = computed(() => viewportComponentRef.value?.viewportElement ?? null);

const virtualizer = useVirtualizer(
	computed(() => ({
		count: props.items.length,
		getScrollElement: () => scrollElement.value,
		estimateSize: () => props.estimateSize,
		overscan: props.overscan,
	})),
);

const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

function onScroll() {
	const el = scrollElement.value;
	if (!el || !props.items.length) return;
	const { scrollTop, scrollHeight, clientHeight } = el;
	if (scrollHeight - scrollTop - clientHeight < 50) {
		emit('scrollEnd');
	}
}

// Re-measure when items change
watch(
	() => props.items.length,
	() => {
		virtualizer.value.measure();
	},
);

const rootClasses = computed(() => cn(scrollAreaVariants(), props.class));
const viewportClasses = computed(() => cn(scrollAreaViewportVariants(), props.viewportClass));
const scrollbarClasses = computed(() =>
	cn(scrollAreaScrollbarVariants({ orientation: 'vertical' })),
);
const thumbClasses = computed(() => cn(scrollAreaThumbVariants()));

defineExpose({
	virtualizer,
	scrollToIndex: (index: number) => virtualizer.value.scrollToIndex(index),
});
</script>
