<template>
	<div :class="cn('flex flex-col flex-1 min-h-0 min-w-0', props.class)">
		<slot name="prepend" />
		<!--
      Empty slot: rendered as a sibling of the scroll viewport (not inside it)
      when there are no items. The prepend region above and any sticky header
      rendered outside this component (week/month views) stay visible; only
      the rows area is replaced.
    -->
		<div
			v-if="props.items.length === 0 && $slots.empty"
			data-slot="schedule-timeline-virtual-scroll-empty"
			class="flex-1 min-h-0 min-w-0"
		>
			<slot name="empty" />
		</div>
		<div
			v-else
			ref="scrollableRef"
			class="flex-1 min-h-0 min-w-0 overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			style="scrollbar-gutter: stable; touch-action: pan-x pan-y"
			tabindex="0"
			@scroll="onScroll"
		>
			<div :style="{ position: 'relative', height: `${totalSize}px`, width: '100%' }">
				<div
					v-for="vrow in virtualRows"
					:key="vrow.key as PropertyKey"
					:ref="(el) => measureRow(el)"
					:data-index="vrow.index"
					:style="{
						position: 'absolute',
						// Use `top` instead of `transform: translateY` — `transform` (per
						// CSS spec) creates a new stacking context, which means a child's
						// `z-index` only competes inside its own row. Later rows would
						// then paint over the previous row's children (e.g. the per-shift
						// edit toolbar that anchors below the card). Switching to `top`
						// removes the per-row stacking context so child z-indexes cascade
						// through the scroll container as expected. The visible result is
						// identical; the perf difference is negligible because the
						// virtualizer only renders the visible window's worth of rows.
						top: `${vrow.start}px`,
						left: '0px',
						width: 'max-content',
						minWidth: '100%',
					}"
				>
					<slot :item="props.items[vrow.index]" :index="vrow.index" />
				</div>
				<!--
          Overlay slot: rendered inside the relative content container
          (height = totalSize), so consumers can absolutely-position elements
          that span the full scroll content — e.g. a "now" line that needs to
          run continuously across all rows instead of being painted per-row.
        -->
				<slot name="overlay" :total-size="totalSize" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { cn } from '../../../../helpers/cn';

const props = withDefaults(
	defineProps<{
		items: T[];
		estimateSize: (index: number) => number;
		overscan?: number;
		/**
		 * When set, `load-more` fires once the user scrolls within this many rows
		 * of the end. Leave undefined to disable infinite-scroll signalling.
		 */
		loadMoreThreshold?: number;
		/**
		 * Opaque token re-arming the load-more latch. Bump this whenever the
		 * dataset is logically replaced (filter change, sort change, tab swap)
		 * even if `items.length` happens to come back identical — without it the
		 * latch sees the same length and never re-fires.
		 */
		loadKey?: string | number;
		class?: string;
	}>(),
	{
		overscan: 5,
	},
);

const emit = defineEmits<{
	scroll: [event: Event];
	'load-more': [];
}>();

const scrollableRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
	computed(() => ({
		count: props.items.length,
		getScrollElement: () => scrollableRef.value,
		estimateSize: (index: number) => props.estimateSize(index),
		overscan: props.overscan,
	})),
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

function measureRow(el: unknown) {
	if (el && el instanceof Element) virtualizer.value.measureElement(el);
}

function onScroll(event: Event) {
	emit('scroll', event);
}

// Track items.length at last emission so we only fire `load-more` once per
// page until the parent appends new rows (which bumps items.length). If the
// list shrinks (filter applied, page reset, etc.) the latch resets so the
// next scroll past the threshold can fire again. `loadKey` re-arms the
// latch even when length is unchanged across a dataset swap.
let lastEmittedAtLength = -1;
watch(
	() => props.items.length,
	(total) => {
		if (total < lastEmittedAtLength) lastEmittedAtLength = -1;
	},
);
watch(
	() => props.loadKey,
	() => {
		lastEmittedAtLength = -1;
	},
);
watch(virtualRows, (rows) => {
	if (props.loadMoreThreshold === undefined) return;
	if (!rows.length) return;
	const total = props.items.length;
	if (total === 0 || total === lastEmittedAtLength) return;
	const lastIndex = rows[rows.length - 1].index;
	if (lastIndex >= total - 1 - props.loadMoreThreshold) {
		lastEmittedAtLength = total;
		emit('load-more');
	}
});

// Remeasure only on structural changes (item count). Same-length payload
// edits (e.g. swapping a row's `days`) don't change the estimated total
// height of the list — individual rows remeasure themselves via the
// `measureRow` template ref, and consumers can call `measure()` on the
// exposed handle for explicit invalidation. Watching the full array
// reference here fires on every parent render because `virtualItems` is
// itself a `computed` upstream.
watch(
	() => props.items.length,
	() => virtualizer.value.measure(),
	{ flush: 'post' },
);

defineExpose({
	getScrollElement: () => scrollableRef.value,
	measure: () => virtualizer.value.measure(),
});
</script>
