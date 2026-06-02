<template>
	<div data-slot="event-calendar-month" class="flex flex-col flex-1 h-full overflow-hidden">
		<!-- Weekday headers -->
		<div data-slot="event-calendar-month-weekdays" class="grid grid-cols-7 border-b">
			<div
				v-for="label in weekDayLabels"
				:key="label"
				data-slot="event-calendar-month-weekday"
				:class="cn(eventCalendarDayHeaderVariants())"
			>
				{{ label }}
			</div>
		</div>

		<!-- Month grid -->
		<ScrollArea class="flex-1">
			<div
				v-for="(week, weekIdx) in monthGrid"
				:key="weekIdx"
				data-slot="event-calendar-month-row"
				class="grid grid-cols-7"
			>
				<div
					v-for="day in week"
					:key="day.toISODate()"
					data-slot="event-calendar-month-cell"
					:data-date="day.toISODate()"
					:class="
						eventCalendarMonthCellVariants({
							today: isToday(day),
							outsideMonth: !isCurrentMonth(day),
						})
					"
					class="cursor-pointer"
					@click="emit('dateClick', { date: day, event: $event })"
				>
					<!-- Day number -->
					<div class="flex items-center justify-end mb-1">
						<span
							:class="
								eventCalendarMonthDayNumberVariants({
									today: isToday(day),
									outsideMonth: !isCurrentMonth(day),
								})
							"
						>
							{{ day.day }}
						</span>
					</div>

					<!-- Events -->
					<div class="space-y-0.5">
						<EventCalendarEvent
							v-for="event in eventsForDay(day).slice(0, MAX_VISIBLE_EVENTS)"
							:key="event.id"
							:item="event"
							:class="selectedEventId === event.id ? 'ring-2 ring-inset ring-primary' : undefined"
							@click="emit('eventClick', $event)"
							@hover="emit('eventHover', $event)"
							@leave="emit('eventLeave', $event)"
						/>
						<EventCalendarDayPopover
							v-if="eventsForDay(day).length > MAX_VISIBLE_EVENTS"
							trigger="click"
							:date="day"
							:events="eventsForDay(day)"
							:selected-event-id="selectedEventId"
							:locale="locale"
							@event-click="(p) => emit('eventClick', p)"
							@event-hover="(p) => emit('eventHover', p)"
							@event-leave="(p) => emit('eventLeave', p)"
						>
							<Button
								variant="ghost"
								size="xs"
								data-slot="event-calendar-month-more"
								class="text-2xs h-auto px-2 py-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
								:aria-label="moreLabel(day, eventsForDay(day).length - MAX_VISIBLE_EVENTS)"
								@click.stop
							>
								+{{ eventsForDay(day).length - MAX_VISIBLE_EVENTS }} more
							</Button>
						</EventCalendarDayPopover>
					</div>
				</div>
			</div>
		</ScrollArea>
	</div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { type ForgeDate, getWeekStart as getWeekStartPref } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import ScrollArea from '../../general/scroll-area/ScrollArea.vue';
import Button from '../../general/button/Button.vue';
import EventCalendarEvent from './EventCalendarEvent.vue';
import EventCalendarDayPopover from './EventCalendarDayPopover.vue';
import {
	eventCalendarDayHeaderVariants,
	eventCalendarMonthCellVariants,
	eventCalendarMonthDayNumberVariants,
	type EventCalendarItem,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
	type EventCalendarDateClickPayload,
} from './event-calendar.js';
import {
	buildMonthGrid,
	isToday,
	getEventsForDate,
	useWeekDayLabels,
} from './composables/useEventCalendarGrid.js';

interface Props {
	selectedDate: ForgeDate;
	events: EventCalendarItem[];
	weekStartsOn?: number;
	locale?: string;
	selectedEventId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartPref());

const emit = defineEmits<{
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
	dateClick: [payload: EventCalendarDateClickPayload];
}>();

const MAX_VISIBLE_EVENTS = 3;

const weekDayLabels = useWeekDayLabels(
	toRef(() => resolvedWeekStart.value),
	toRef(() => props.locale),
);

const monthGrid = computed(() =>
	buildMonthGrid(props.selectedDate.year, props.selectedDate.month, resolvedWeekStart.value),
);

function isCurrentMonth(date: ForgeDate): boolean {
	return date.month === props.selectedDate.month && date.year === props.selectedDate.year;
}

function eventsForDay(date: ForgeDate): EventCalendarItem[] {
	return getEventsForDate(props.events, date);
}

const dateFormatter = computed(
	() => new Intl.DateTimeFormat(props.locale, { weekday: 'short', month: 'short', day: 'numeric' }),
);

function moreLabel(date: ForgeDate, hidden: number): string {
	return `Show ${hidden} more event${hidden === 1 ? '' : 's'} on ${dateFormatter.value.format(date.toDate())}`;
}
</script>
