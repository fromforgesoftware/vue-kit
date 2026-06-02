<template>
	<!--
    Outer row is sized to the full timeline width via `min-width` so the
    inner `sticky left-0` chunk has room to slide across the entire
    scroll range. Without that, the items un-stick once the outer's
    right edge scrolls past the viewport.
  -->
	<div
		data-slot="schedule-timeline-legend"
		class="flex items-center w-fit border-b border-border/40 bg-background"
		:style="{ minWidth: `${employeeColumnWidth + timelineWidth}px` }"
	>
		<div
			class="sticky left-0 flex items-center gap-4 py-2 px-3 bg-background"
			:style="{ zIndex: Z.legendSticky }"
		>
			<div
				v-for="item in items"
				:key="item.type"
				data-slot="schedule-timeline-legend-item"
				:data-legend-type="item.type"
				class="flex items-center gap-1.5 text-2xs text-muted-foreground"
			>
				<ScheduleTimelineIndicator :type="item.type" />
				<span>{{ item.label }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ScheduleTimelineLegendItem } from '../schedule-timeline';
import { ScheduleTimelineZ as Z } from '../utils';
import ScheduleTimelineIndicator from './ScheduleTimelineIndicator.vue';

defineProps<{
	items: ScheduleTimelineLegendItem[];
	employeeColumnWidth: number;
	/** Total width of the day-cell area (= columns * columnWidth). The
	 *  outer row stretches to Employee + timeline so the sticky-left chunk
	 *  has room to slide across the entire scroll range, mirroring the
	 *  department header pattern. */
	timelineWidth: number;
}>();
</script>
