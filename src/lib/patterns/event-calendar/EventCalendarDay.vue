<template>
	<div data-slot="event-calendar-day" class="flex flex-col flex-1 h-full overflow-hidden">
		<!-- All-day events -->
		<div v-if="allDayEvents.length" class="flex border-b px-2 py-1 gap-1 flex-wrap bg-muted/20">
			<span class="text-2xs text-muted-foreground self-center mr-1">All day</span>
			<EventCalendarEvent
				v-for="event in allDayEvents"
				:key="event.id"
				:item="event"
				:class="selectedEventId === event.id ? 'ring-2 ring-inset ring-primary' : undefined"
				@click="emit('eventClick', $event)"
				@hover="emit('eventHover', $event)"
				@leave="emit('eventLeave', $event)"
			/>
		</div>

		<!-- Timed grid -->
		<ScrollArea ref="scrollContainer" class="flex-1">
			<div class="flex min-h-0">
				<!--
          Hour labels float on each row's top border with a `bg-background`
          mask + horizontal padding so the line passes behind the text
          instead of cutting through. First hour is skipped (no line above
          the top row).
        -->
				<div class="flex-shrink-0 w-16">
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

				<!-- Day column -->
				<div class="flex-1 relative border-l">
					<!-- Hour rows -->
					<div
						v-for="hour in hours"
						:key="hour"
						:class="eventCalendarHourRowVariants()"
						class="cursor-pointer hover:bg-accent/20"
						@click="onSlotClick(hour, $event)"
					/>

					<!-- Now line -->
					<div
						v-if="isTodaySelected && nowLineTop >= 0"
						:class="eventCalendarNowLineVariants()"
						:style="{ top: `${nowLineTop}px` }"
					/>

					<!-- Timed events (with overlap columns) -->
					<div
						v-for="pos in positionedEvents"
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
						<div class="font-semibold truncate">{{ pos.event.title }}</div>
						<div class="text-2xs opacity-80 truncate">{{ formatEventTime(pos.event, locale) }}</div>
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
		</ScrollArea>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import ScrollArea from '../../general/scroll-area/ScrollArea.vue';
import EventCalendarEvent from './EventCalendarEvent.vue';
import {
	eventCalendarTimedEventVariants,
	eventCalendarHourRowVariants,
	eventCalendarNowLineVariants,
	type EventCalendarItem,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
	type EventCalendarSlotClickPayload,
} from './event-calendar.js';
import {
	isOnDate,
	isToday,
	formatHour,
	formatEventTime,
	layoutOverlappingEvents,
	getPositionedEventStyle,
	useNowLine,
	useAutoScroll,
} from './composables/useEventCalendarGrid.js';

interface Props {
	selectedDate: ForgeDate;
	events: EventCalendarItem[];
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

const emit = defineEmits<{
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
	slotClick: [payload: EventCalendarSlotClickPayload];
}>();

const scrollContainer = ref<HTMLElement>();

const hours = computed(() => {
	const start = props.dayStartHour;
	const end = props.dayEndHour === 0 ? 24 : props.dayEndHour;
	return Array.from({ length: end - start }, (_, i) => start + i);
});

const allDayEvents = computed(() =>
	props.events.filter((e) => e.allDay && isOnDate(e, props.selectedDate)),
);

const timedEvents = computed(() =>
	props.events.filter((e) => !e.allDay && isOnDate(e, props.selectedDate)),
);

const positionedEvents = computed(() =>
	layoutOverlappingEvents(timedEvents.value, props.dayStartHour),
);

const isTodaySelected = computed(() => isToday(props.selectedDate));

const { getNowLineTop } = useNowLine(toRef(() => props.dayStartHour));
useAutoScroll(scrollContainer);

const nowLineTop = computed(() => {
	if (!isTodaySelected.value) return -1;
	return getNowLineTop();
});

function onSlotClick(hour: number, e: MouseEvent) {
	const date = new ForgeDate(
		new Date(props.selectedDate.year, props.selectedDate.month - 1, props.selectedDate.day, hour),
	);
	emit('slotClick', { date, event: e });
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
