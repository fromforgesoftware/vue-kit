<template>
	<ScrollArea data-slot="event-calendar-year" class="flex-1 h-full">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
			<div
				v-for="m in months"
				:key="m.month"
				data-slot="event-calendar-year-month"
				:data-month="m.month"
				:class="eventCalendarYearMiniMonthVariants()"
				@click="emit('monthClick', { month: m.month, event: $event })"
			>
				<!-- Month label -->
				<div class="text-sm font-semibold mb-2 text-center">{{ m.label }}</div>

				<!-- Weekday headers -->
				<div class="grid grid-cols-7 place-items-center mb-1">
					<div
						v-for="label in weekDayLabels"
						:key="label"
						class="size-6 flex items-center justify-center text-2xs text-muted-foreground"
					>
						{{ label }}
					</div>
				</div>

				<!-- Mini month grid -->
				<div v-for="(week, wIdx) in m.grid" :key="wIdx" class="grid grid-cols-7 place-items-center">
					<template v-for="day in week" :key="day.toISODate()">
						<slot
							v-if="isInMonth(day, m.month)"
							name="day"
							:date="day"
							:events="getEventsOnDate(day)"
							:is-today="isToday(day)"
							:has-events="hasEventsOnDate(day)"
							:day-class="
								eventCalendarYearMiniDayVariants({
									today: isToday(day),
									hasEvents: hasEventsOnDate(day),
									outsideMonth: false,
								})
							"
						>
							<EventCalendarDayPopover
								v-if="hasEventsOnDate(day)"
								trigger="hover"
								:date="day"
								:events="getEventsOnDate(day)"
								:locale="locale"
								@event-click="(p) => emit('eventClick', p)"
								@event-hover="(p) => emit('eventHover', p)"
								@event-leave="(p) => emit('eventLeave', p)"
							>
								<Button
									variant="ghost"
									size="icon-xs"
									:class="
										eventCalendarYearMiniDayVariants({
											today: isToday(day),
											hasEvents: true,
											outsideMonth: false,
										})
									"
									:aria-label="dayHoverLabel(day, getEventsOnDate(day))"
									@click.stop="emit('dateClick', { date: day, event: $event })"
								>
									{{ day.day }}
								</Button>
							</EventCalendarDayPopover>
							<div
								v-else
								:class="
									eventCalendarYearMiniDayVariants({
										today: isToday(day),
										hasEvents: false,
										outsideMonth: false,
									})
								"
								@click.stop="emit('dateClick', { date: day, event: $event })"
							>
								{{ day.day }}
							</div>
						</slot>
						<!-- Outside-month placeholder (no events styling, no slot) -->
						<div v-else :class="eventCalendarYearMiniDayVariants({ outsideMonth: true })" />
					</template>
				</div>

				<!-- Current month indicator dot -->
				<div
					v-if="!hideMonthDots && m.grid.flat().some((d) => isInMonth(d, m.month) && isToday(d))"
					class="flex justify-center mt-1"
				>
					<div class="size-1.5 rounded-full bg-primary" />
				</div>
			</div>
		</div>
	</ScrollArea>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { type ForgeDate, getWeekStart as getWeekStartPref } from '@fromforgesoftware/ts-kit';
import ScrollArea from '../../general/scroll-area/ScrollArea.vue';
import Button from '../../general/button/Button.vue';
import EventCalendarDayPopover from './EventCalendarDayPopover.vue';
import {
	eventCalendarYearMiniMonthVariants,
	eventCalendarYearMiniDayVariants,
	type EventCalendarItem,
	type EventCalendarDateClickPayload,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
} from './event-calendar.js';
import {
	buildMonthGrid,
	isToday,
	isOnDate,
	useWeekDayLabels,
} from './composables/useEventCalendarGrid.js';

interface Props {
	selectedDate: ForgeDate;
	events: EventCalendarItem[];
	weekStartsOn?: number;
	locale?: string;
	/** Hide the month-level event indicator dot */
	hideMonthDots?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	hideMonthDots: false,
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartPref());

const emit = defineEmits<{
	dateClick: [payload: EventCalendarDateClickPayload];
	monthClick: [payload: { month: number; event: MouseEvent }];
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
}>();

const weekDayLabels = useWeekDayLabels(
	toRef(() => resolvedWeekStart.value),
	toRef(() => props.locale),
	'narrow',
);

const months = computed(() => {
	const year = props.selectedDate.year;
	const monthFormatter = new Intl.DateTimeFormat(props.locale, { month: 'long' });

	return Array.from({ length: 12 }, (_, i) => ({
		month: i + 1,
		label: monthFormatter.format(new Date(year, i, 1)),
		grid: buildMonthGrid(year, i + 1, resolvedWeekStart.value),
	}));
});

function isInMonth(date: ForgeDate, month: number): boolean {
	return date.month === month && date.year === props.selectedDate.year;
}

function hasEventsOnDate(date: ForgeDate): boolean {
	return props.events.some((e) => isOnDate(e, date));
}

function getEventsOnDate(date: ForgeDate): EventCalendarItem[] {
	return props.events.filter((e) => isOnDate(e, date));
}

const dateFormatter = computed(
	() => new Intl.DateTimeFormat(props.locale, { weekday: 'short', month: 'short', day: 'numeric' }),
);

function dayHoverLabel(date: ForgeDate, evs: EventCalendarItem[]): string {
	return `${dateFormatter.value.format(date.toDate())}, ${evs.length} ${evs.length === 1 ? 'event' : 'events'}`;
}

defineExpose({ getEventsOnDate });
</script>
