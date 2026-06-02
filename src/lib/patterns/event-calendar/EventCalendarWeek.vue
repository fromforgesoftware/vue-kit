<template>
	<!--
    Single scroll container for both axes: sticky-top headers and sticky-left
    time gutter must share the same scroll context. Splitting headers/grid
    across two scroll containers breaks sticky-left, because the inner
    scroll context can't see the outer horizontal scroll.
  -->
	<div
		data-slot="event-calendar-week"
		class="flex flex-col flex-1 h-full overflow-hidden"
		style="touch-action: manipulation"
	>
		<div ref="scrollContainer" class="flex-1 overflow-auto">
			<div class="flex flex-col w-fit min-w-full">
				<div
					data-slot="event-calendar-week-headers"
					class="sticky top-0 z-30 flex border-b bg-background"
				>
					<div class="w-16 flex-shrink-0 border-r sticky left-0 z-40 bg-background" />
					<div
						v-for="day in weekDays"
						:key="day.toISODate()"
						data-slot="event-calendar-week-header"
						:data-date="day.toISODate()"
						:class="cn(eventCalendarDayHeaderVariants(), isToday(day) && 'bg-primary/5')"
						class="flex-1 max-sm:flex-none max-sm:w-[140px] flex flex-col items-center gap-0.5 cursor-pointer"
						@click="emit('dateClick', { date: day, event: $event })"
					>
						<span class="text-2xs uppercase">{{ formatDayHeader(day) }}</span>
						<span
							:class="[
								'inline-flex size-7 items-center justify-center rounded-full text-sm font-medium',
								isToday(day) ? 'bg-primary text-primary-foreground' : '',
							]"
						>
							{{ day.day }}
						</span>
					</div>
				</div>

				<div v-if="weekDays.some((d) => getAllDayEventsForDay(d).length > 0)" class="flex border-b">
					<div
						class="w-16 flex-shrink-0 border-r flex items-center justify-end pr-2 sticky left-0 z-20 bg-background"
					>
						<span class="text-2xs text-muted-foreground">All day</span>
					</div>
					<div
						v-for="day in weekDays"
						:key="`allday-${day.toISODate()}`"
						class="flex-1 max-sm:flex-none max-sm:w-[140px] border-r last:border-r-0 p-0.5 space-y-0.5"
					>
						<EventCalendarEvent
							v-for="event in getAllDayEventsForDay(day)"
							:key="event.id"
							:item="event"
							:class="selectedEventId === event.id ? 'ring-2 ring-inset ring-primary' : undefined"
							@click="emit('eventClick', $event)"
							@hover="emit('eventHover', $event)"
							@leave="emit('eventLeave', $event)"
						/>
					</div>
				</div>

				<div class="flex min-h-0">
					<!--
            Hour labels float on each row's top border with a `bg-background`
            mask + horizontal padding so the line passes behind the text
            instead of cutting through. First hour is skipped (no line above
            the top row).
          -->
					<div class="flex-shrink-0 w-16 sticky left-0 z-20 bg-background">
						<div
							v-for="(hour, idx) in hours"
							:key="hour"
							:class="cn(eventCalendarHourRowVariants(), 'relative')"
						>
							<span
								v-if="idx > 0"
								class="absolute top-0 right-1 -translate-y-1/2 px-1 bg-background text-2xs leading-none text-muted-foreground tabular-nums select-none"
							>
								{{ formatHour(hour, locale) }}
							</span>
						</div>
					</div>

					<!-- Day columns -->
					<div
						v-for="day in weekDays"
						:key="`col-${day.toISODate()}`"
						data-slot="event-calendar-week-column"
						:data-date="day.toISODate()"
						class="flex-1 max-sm:flex-none max-sm:w-[140px] relative border-l"
						:class="isToday(day) && 'bg-primary/[0.02]'"
					>
						<!-- Hour rows -->
						<div
							v-for="hour in hours"
							:key="hour"
							data-slot="event-calendar-week-hour-row"
							:data-hour="hour"
							:class="eventCalendarHourRowVariants()"
							class="cursor-pointer hover:bg-accent/20"
							@click="onSlotClick(day, hour, $event)"
						/>

						<!-- Now line -->
						<div
							v-if="isToday(day)"
							:class="eventCalendarNowLineVariants()"
							:style="{ top: `${getNowLineTop()}px` }"
						/>

						<!-- Timed events (with overlap columns) -->
						<div
							v-for="pos in getPositionedEventsForDay(day)"
							:key="pos.event.id"
							:class="[
								eventCalendarTimedEventVariants({ variant: pos.event.variant ?? 'primary' }),
								selectedEventId === pos.event.id && 'ring-2 ring-inset ring-primary z-30',
							]"
							:style="getPositionedEventStyle(pos)"
							@click.stop="emit('eventClick', { item: pos.event, event: $event })"
							@mouseenter="onTimedEventHover(pos.event, $event)"
							@mouseleave="emit('eventLeave', pos.event)"
						>
							<div class="font-semibold truncate text-2xs">{{ pos.event.title }}</div>
							<div v-if="pos.height > 30" class="text-3xs opacity-80 truncate">
								{{ formatEventTime(pos.event, locale) }}
							</div>
							<!-- Segment blocks (breaks, lunch, etc.) -->
							<div
								v-for="(seg, si) in pos.event.segments ?? []"
								:key="si"
								class="absolute left-[3px] right-[3px] rounded-[5px] border flex items-center justify-center pointer-events-none opacity-50"
								:class="segmentClasses[seg.variant ?? 'gray']"
								:style="{
									top: `${seg.offset * 100}%`,
									height: `${seg.size * 100}%`,
									minHeight: '4px',
								}"
							>
								<component
									:is="seg.icon"
									v-if="seg.icon && pos.height * seg.size > 14"
									class="size-3.5 opacity-80"
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
import { computed, ref, toRef } from 'vue';
import { ForgeDate, getWeekStart as getWeekStartPref } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import EventCalendarEvent from './EventCalendarEvent.vue';
import {
	eventCalendarTimedEventVariants,
	eventCalendarHourRowVariants,
	eventCalendarDayHeaderVariants,
	eventCalendarNowLineVariants,
	type EventCalendarItem,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
	type EventCalendarSlotClickPayload,
} from './event-calendar';
import {
	getWeekStart,
	isOnDate,
	isToday,
	formatHour,
	formatEventTime,
	layoutOverlappingEvents,
	getPositionedEventStyle,
	useNowLine,
	useAutoScroll,
	type PositionedEvent,
} from './composables/useEventCalendarGrid';

interface Props {
	selectedDate: ForgeDate;
	events: EventCalendarItem[];
	weekStartsOn?: number;
	dayStartHour?: number;
	dayEndHour?: number;
	locale?: string;
	selectedEventId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
	dayStartHour: 0,
	dayEndHour: 24,
	locale: 'en',
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartPref());

const emit = defineEmits<{
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
	slotClick: [payload: EventCalendarSlotClickPayload];
	dateClick: [payload: { date: ForgeDate; event: MouseEvent }];
}>();

const scrollContainer = ref<HTMLElement>();

const hours = computed(() => {
	const start = props.dayStartHour;
	const end = props.dayEndHour === 0 ? 24 : props.dayEndHour;
	return Array.from({ length: end - start }, (_, i) => start + i);
});

const weekDays = computed(() => {
	const start = getWeekStart(props.selectedDate, resolvedWeekStart.value);
	return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }));
});

const { getNowLineTop } = useNowLine(toRef(() => props.dayStartHour));
useAutoScroll(scrollContainer);

/** Pre-compute positioned events per day (with overlap columns). */
const positionedEventsPerDay = computed(() => {
	const map = new Map<string, PositionedEvent[]>();
	for (const day of weekDays.value) {
		const key = day.toISODate();
		const dayEvents = props.events.filter((e) => !e.allDay && isOnDate(e, day));
		map.set(key, layoutOverlappingEvents(dayEvents, props.dayStartHour));
	}
	return map;
});

function getPositionedEventsForDay(date: ForgeDate): PositionedEvent[] {
	return positionedEventsPerDay.value.get(date.toISODate()) ?? [];
}

function getAllDayEventsForDay(date: ForgeDate): EventCalendarItem[] {
	return props.events.filter((e) => e.allDay && isOnDate(e, date));
}

function formatDayHeader(date: ForgeDate): string {
	return new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format(date.toDate());
}

function onSlotClick(date: ForgeDate, hour: number, e: MouseEvent) {
	const slotDate = new ForgeDate(new Date(date.year, date.month - 1, date.day, hour));
	emit('slotClick', { date: slotDate, event: e });
}

const segmentClasses: Record<string, string> = {
	green: 'bg-emerald-100 border-emerald-300',
	purple: 'bg-violet-100 border-violet-300',
	blue: 'bg-blue-100 border-blue-300',
	amber: 'bg-amber-100 border-amber-300',
	red: 'bg-red-100 border-red-300',
	gray: 'bg-gray-100 border-gray-300',
};

function onTimedEventHover(item: EventCalendarItem, e: MouseEvent) {
	const el = e.currentTarget as HTMLElement;
	emit('eventHover', { item, rect: el.getBoundingClientRect(), event: e });
}
</script>
