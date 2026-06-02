<template>
	<!--
    Shared sticky header for day/week/month views.

    - Day view passes hour-of-day labels (numbers); each column is *not*
      clickable (the click target is the row body for the now-line).
    - Week view passes weekday labels; clicking emits `day-click`.
    - Month view passes day-of-month + short-weekday stacked labels; clicking
      emits `day-click`.

    Columns are interactive when `interactive` is true: they become real
    buttons (role + tabindex + Enter/Space), with `aria-current="date"` on
    today's column for screen-reader users navigating dates.

    No grid roles here — see WeekView for the axe rationale. The visible
    labels carry meaning on their own; we drop role="row"/columnheader to
    avoid aria-required-parent flagging orphan grid cells.
  -->
	<div
		data-slot="schedule-timeline-header"
		:class="
			cn('sticky top-0 flex bg-background border-b border-border w-fit min-w-full', props.class)
		"
		:style="{ zIndex: Z.header }"
	>
		<!-- Employee header cell -->
		<div
			class="sticky left-0 flex-shrink-0 flex items-center bg-background border-r border-border px-3"
			:style="{
				width: `${employeeColumnWidth}px`,
				minWidth: `${employeeColumnWidth}px`,
				zIndex: Z.headerStickyColumn,
			}"
		>
			<slot name="employee-header">
				<span class="text-2xs font-medium text-muted-foreground"> Employee </span>
			</slot>
		</div>

		<!-- Date / hour columns. Inner width is explicit so `overflow-hidden`
         doesn't clip the right edge when total > scroll offset. -->
		<div
			class="overflow-hidden flex-shrink-0"
			:style="{
				transform: `translateX(${scrollOffset}px)`,
				width: `${columns.length * columnWidth}px`,
			}"
		>
			<div class="flex">
				<component
					:is="interactive ? 'button' : 'div'"
					v-for="col in columns"
					:key="col.date"
					:type="interactive ? 'button' : undefined"
					data-slot="schedule-timeline-header-day"
					:data-date="col.date"
					:aria-current="col.isToday ? 'date' : undefined"
					:class="
						cn(
							'flex-shrink-0 flex flex-col items-center justify-center border-r border-border/60 font-medium transition-colors',
							dense ? 'py-1 text-3xs' : 'py-2 text-xs',
							interactive &&
								'cursor-pointer hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
							col.isToday
								? 'bg-primary/5 text-primary-text font-semibold'
								: col.isWeekend
									? 'text-muted-foreground bg-muted/20'
									: 'text-muted-foreground',
						)
					"
					:style="{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }"
					@click="interactive && emit('day-click', col.date)"
				>
					<span>{{ col.label }}</span>
					<span v-if="col.sublabel" class="text-3xs">{{ col.sublabel }}</span>
				</component>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { cn } from '../../../../helpers/cn.js';
import { ScheduleTimelineZ as Z } from '../utils.js';

export interface ScheduleTimelineHeaderColumn {
	/** Primary label (e.g. weekday short "Mon", day-of-month "15", or hour "08:00") */
	label: string;
	/** Optional secondary line below the label (used by Month view: weekday short). */
	sublabel?: string;
	/** Date string identifying the column (used as key + emit payload). */
	date: string;
	/** Whether this column is today (drives styling + `aria-current="date"`). */
	isToday?: boolean;
	/** Whether this is a weekend column. */
	isWeekend?: boolean;
}

const props = withDefaults(
	defineProps<{
		columns: ScheduleTimelineHeaderColumn[];
		columnWidth: number;
		employeeColumnWidth: number;
		/** Horizontal scroll offset for syncing with the row viewport. */
		scrollOffset: number;
		/** When true, columns are real buttons (keyboard + click). Day view's
		 *  hour header should keep this false. Default true. */
		interactive?: boolean;
		/** Smaller cell padding / text — used by the dense Month view. */
		dense?: boolean;
		class?: string;
	}>(),
	{
		interactive: true,
		dense: false,
	},
);

const emit = defineEmits<{
	'day-click': [date: string];
}>();

// Reference `props` so unused-prop lints don't fire when consumers omit
// optional fields. The values are used inside the template above.
void props;
</script>
