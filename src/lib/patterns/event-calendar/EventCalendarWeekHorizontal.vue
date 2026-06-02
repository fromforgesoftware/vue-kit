<template>
	<div
		data-slot="event-calendar-week-horizontal"
		class="flex flex-col flex-1 h-full overflow-hidden"
	>
		<!-- Header -->
		<div class="flex border-b bg-background">
			<div class="shrink-0 border-r" :style="{ width: `${dayLabelWidth}px` }" />
			<div
				v-if="hasAnyAllDay"
				class="shrink-0 border-r flex items-center justify-center text-2xs font-medium text-muted-foreground"
				:class="compact ? 'py-1' : 'py-1.5'"
				:style="{ width: `${allDayColumnWidth}px` }"
			>
				All day
			</div>
			<div class="relative flex-1 min-w-0">
				<div class="flex">
					<div
						v-for="h in hourTicks"
						:key="h"
						class="flex-1 px-1.5 text-2xs font-medium text-muted-foreground"
						:class="compact ? 'py-1' : 'py-1.5'"
					>
						{{ formatHour(h, locale) }}
					</div>
				</div>
			</div>
		</div>

		<!-- Day rows -->
		<div class="flex-1 overflow-auto">
			<div
				v-for="day in weekDays"
				:key="day.toISODate()"
				data-slot="event-calendar-week-horizontal-row"
				:data-date="day.toISODate()"
				class="flex border-b last:border-b-0"
			>
				<!-- Day label cell -->
				<div
					class="shrink-0 flex flex-col items-center justify-center border-r"
					:class="[compact ? 'py-1.5' : 'py-2', isToday(day) ? 'bg-primary/5' : '']"
					:style="{ width: `${dayLabelWidth}px` }"
				>
					<span class="text-[10px] uppercase text-muted-foreground leading-none">
						{{ formatDow(day, locale) }}
					</span>
					<span
						class="font-semibold tabular-nums leading-none mt-0.5"
						:class="[
							compact ? 'text-xs' : 'text-sm',
							isToday(day) ? 'text-primary' : 'text-foreground',
						]"
					>
						{{ day.day }}
					</span>
				</div>

				<!-- All-day column (only when the week has any all-day events) -->
				<div
					v-if="hasAnyAllDay"
					class="shrink-0 border-r relative flex flex-wrap gap-0.5 p-0.5 overflow-hidden"
					:style="{ width: `${allDayColumnWidth}px` }"
				>
					<div
						v-for="event in getAllDayEventsForDay(day)"
						:key="`all-${event.id}`"
						:class="[
							eventCalendarTimedEventVariants({ variant: event.variant ?? 'primary' }),
							selectedEventId === event.id && 'ring-2 ring-inset ring-primary z-30',
							'static w-full flex items-center gap-1 px-1.5 py-0.5',
						]"
						@click.stop="emit('eventClick', { item: event, event: $event })"
						@mouseenter="onEventHover(event, $event)"
						@mouseleave="emit('eventLeave', event)"
					>
						<component
							:is="event.icon"
							v-if="event.icon"
							class="size-3 opacity-70 shrink-0"
							aria-hidden="true"
						/>
						<span class="truncate text-2xs font-semibold">{{ event.title }}</span>
					</div>
				</div>

				<!-- Lane: hour grid + timed events -->
				<div
					class="relative flex-1 min-w-0"
					:class="compact ? 'h-9' : 'h-14'"
					@click="onLaneClick(day, $event)"
				>
					<!-- Hour gridlines -->
					<div class="absolute inset-0 flex pointer-events-none">
						<div
							v-for="h in hourTicks"
							:key="h"
							class="flex-1 border-l border-border/50 first:border-l-0"
						/>
					</div>

					<!-- Timed events -->
					<div
						v-for="event in getTimedEventsForDay(day)"
						:key="event.id"
						:class="[
							eventCalendarTimedEventVariants({ variant: event.variant ?? 'primary' }),
							selectedEventId === event.id && 'ring-2 ring-inset ring-primary z-30',
							'top-1 bottom-1 flex items-center gap-1 px-1.5',
						]"
						:style="getTimedStyle(event, day)"
						@click.stop="emit('eventClick', { item: event, event: $event })"
						@mouseenter="onEventHover(event, $event)"
						@mouseleave="emit('eventLeave', event)"
					>
						<component
							:is="event.icon"
							v-if="event.icon"
							class="size-3 opacity-70 shrink-0"
							aria-hidden="true"
						/>
						<div v-if="!compact" class="flex flex-col min-w-0 flex-1 leading-tight">
							<div class="flex items-center gap-1 min-w-0">
								<span class="truncate text-2xs font-semibold">{{ event.title }}</span>
							</div>
							<span class="text-3xs truncate opacity-80">
								{{ formatEventTime(event, locale) }}
							</span>
						</div>

						<!-- Segments (breaks/lunch/etc.) — offset/size are 0–1 fractions of the parent. -->
						<div class="absolute inset-0 pointer-events-none">
							<div
								v-for="(seg, si) in event.segments ?? []"
								:key="si"
								class="absolute top-[1px] h-[calc(100%-2px)] rounded-[5px] border flex items-center justify-center opacity-50"
								:class="segmentClasses[seg.variant ?? 'gray']"
								:style="{
									left: `${seg.offset * 100}%`,
									width: `${seg.size * 100}%`,
								}"
								:title="seg.label"
							>
								<component
									:is="seg.icon"
									v-if="seg.icon && !compact"
									class="size-3 opacity-80"
									aria-hidden="true"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import {
	eventCalendarTimedEventVariants,
	type EventCalendarItem,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
	type EventCalendarSlotClickPayload,
} from './event-calendar';
import {
	isOnDate,
	isToday,
	formatHour,
	formatEventTime,
	getWeekStart,
} from './composables/useEventCalendarGrid';

interface Props {
	selectedDate: ForgeDate;
	events: EventCalendarItem[];
	weekStartsOn?: number;
	dayStartHour?: number;
	dayEndHour?: number;
	locale?: string;
	selectedEventId?: string | null;
	/** Width of the day-label cell on the left. */
	dayLabelWidth?: number;
	/**
	 * Width of the All-day column. Only rendered when at least one day in the
	 * visible week has an all-day event.
	 */
	allDayColumnWidth?: number;
	/** Hour tick interval. Defaults to 3 (00, 03, 06, …). 6 reads cleaner in compact. */
	hourStep?: number;
	/** Compact: shorter rows, fewer hour ticks, hides event titles inside narrow chips. */
	compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	weekStartsOn: 1,
	dayStartHour: 0,
	dayEndHour: 24,
	locale: 'en',
	selectedEventId: null,
	dayLabelWidth: 56,
	allDayColumnWidth: 100,
	hourStep: 3,
	compact: false,
});

const emit = defineEmits<{
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
	slotClick: [payload: EventCalendarSlotClickPayload];
}>();

const weekDays = computed<ForgeDate[]>(() => {
	const start = getWeekStart(props.selectedDate, props.weekStartsOn);
	return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }));
});

const totalMinutes = computed(() => (props.dayEndHour - props.dayStartHour) * 60);

const hourTicks = computed(() => {
	const step = props.compact ? Math.max(props.hourStep, 6) : props.hourStep;
	const ticks: number[] = [];
	for (let h = props.dayStartHour; h < props.dayEndHour; h += step) ticks.push(h);
	return ticks;
});

function getAllDayEventsForDay(day: ForgeDate): EventCalendarItem[] {
	return props.events.filter((e) => e.allDay && isOnDate(e, day));
}

function getTimedEventsForDay(day: ForgeDate): EventCalendarItem[] {
	return props.events.filter((e) => !e.allDay && isOnDate(e, day));
}

const hasAnyAllDay = computed(() =>
	weekDays.value.some((d) => getAllDayEventsForDay(d).length > 0),
);

function getTimedStyle(event: EventCalendarItem, day: ForgeDate): Record<string, string> {
	const dayStartMin = props.dayStartHour * 60;
	const start = clampMinutes(eventStartMinutesOnDay(event, day) - dayStartMin);
	const end = clampMinutes(eventEndMinutesOnDay(event, day) - dayStartMin);
	const left = (start / totalMinutes.value) * 100;
	const width = Math.max(0.5, ((end - start) / totalMinutes.value) * 100);
	return {
		left: `${Math.max(0, left)}%`,
		width: `${Math.min(100 - Math.max(0, left), width)}%`,
	};
}

function eventStartMinutesOnDay(event: EventCalendarItem, day: ForgeDate): number {
	if (event.start.isSame(day, 'day')) {
		return event.start.hour * 60 + event.start.minute;
	}
	// Event began on a previous day — render from the start of this day.
	return props.dayStartHour * 60;
}

function eventEndMinutesOnDay(event: EventCalendarItem, day: ForgeDate): number {
	if (event.end.isSame(day, 'day')) {
		return event.end.hour * 60 + event.end.minute;
	}
	// Event ends on a later day — render through the end of this day.
	return props.dayEndHour * 60;
}

function clampMinutes(value: number): number {
	return Math.max(0, Math.min(value, totalMinutes.value));
}

function formatDow(date: ForgeDate, locale: string): string {
	const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
	return formatter.format(date.toDate());
}

function onEventHover(item: EventCalendarItem, e: MouseEvent) {
	const el = e.currentTarget as HTMLElement;
	emit('eventHover', { item, rect: el.getBoundingClientRect(), event: e });
}

function onLaneClick(day: ForgeDate, e: MouseEvent) {
	emit('slotClick', { date: day, event: e });
}

const segmentClasses: Record<string, string> = {
	green: 'bg-success/10 border-success/30',
	purple: 'bg-info/10 border-info/30',
	blue: 'bg-info/10 border-info/30',
	amber: 'bg-warning/10 border-warning/30',
	red: 'bg-destructive/10 border-destructive/30',
	gray: 'bg-muted border-border',
};
</script>
