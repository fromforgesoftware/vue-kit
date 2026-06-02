<template>
	<div :class="rootClasses" data-slot="event-calendar">
		<EventCalendarHeader
			v-if="!hideHeader"
			:title="title"
			:view="view"
			:selected-date="selectedDate"
			@prev="onPrev"
			@next="onNext"
			@update:view="onViewChange"
			@update:selected-date="onPickDate"
		>
			<template v-if="$slots.headerActions" #actions>
				<slot name="headerActions" />
			</template>
		</EventCalendarHeader>

		<EventCalendarDay
			v-if="view === 'day'"
			:selected-date="selectedDate"
			:events="events"
			:day-start-hour="dayStartHour"
			:day-end-hour="dayEndHour"
			:locale="locale"
			:selected-event-id="selectedEventId"
			@event-click="emit('eventClick', $event)"
			@event-hover="emit('eventHover', $event)"
			@event-leave="emit('eventLeave', $event)"
			@slot-click="emit('slotClick', $event)"
		/>

		<EventCalendarWeek
			v-else-if="view === 'week'"
			:selected-date="selectedDate"
			:events="events"
			:week-starts-on="resolvedWeekStart"
			:day-start-hour="dayStartHour"
			:day-end-hour="dayEndHour"
			:locale="locale"
			:selected-event-id="selectedEventId"
			@event-click="emit('eventClick', $event)"
			@event-hover="emit('eventHover', $event)"
			@event-leave="emit('eventLeave', $event)"
			@slot-click="emit('slotClick', $event)"
			@date-click="onDateClick"
		/>

		<EventCalendarMonth
			v-else-if="view === 'month'"
			:selected-date="selectedDate"
			:events="events"
			:week-starts-on="resolvedWeekStart"
			:locale="locale"
			:selected-event-id="selectedEventId"
			@event-click="emit('eventClick', $event)"
			@event-hover="emit('eventHover', $event)"
			@event-leave="emit('eventLeave', $event)"
			@date-click="onDateClick"
		/>

		<EventCalendarYear
			v-else-if="view === 'year'"
			:selected-date="selectedDate"
			:events="events"
			:week-starts-on="resolvedWeekStart"
			:locale="locale"
			@date-click="onDateClick"
			@month-click="onMonthClick"
			@event-click="emit('eventClick', $event)"
			@event-hover="emit('eventHover', $event)"
			@event-leave="emit('eventLeave', $event)"
		/>

		<EventCalendarWeekHorizontal
			v-else-if="view === 'week-horizontal'"
			:selected-date="selectedDate"
			:events="events"
			:week-starts-on="resolvedWeekStart"
			:day-start-hour="dayStartHour"
			:day-end-hour="dayEndHour"
			:locale="locale"
			:selected-event-id="selectedEventId"
			:compact="compact"
			@event-click="emit('eventClick', $event)"
			@event-hover="emit('eventHover', $event)"
			@event-leave="emit('eventLeave', $event)"
			@slot-click="emit('slotClick', $event)"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import EventCalendarHeader from './EventCalendarHeader.vue';
import EventCalendarDay from './EventCalendarDay.vue';
import EventCalendarWeek from './EventCalendarWeek.vue';
import EventCalendarMonth from './EventCalendarMonth.vue';
import EventCalendarYear from './EventCalendarYear.vue';
import EventCalendarWeekHorizontal from './EventCalendarWeekHorizontal.vue';
import { ForgeDate, getWeekStart as getWeekStartPref } from '@fromforgesoftware/ts-kit';
import {
	eventCalendarRootVariants,
	type EventCalendarProps,
	type EventCalendarView,
	type EventCalendarItem,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
	type EventCalendarSlotClickPayload,
	type EventCalendarDateClickPayload,
} from './event-calendar';
import { useEventCalendar } from './composables/useEventCalendar';
import { toRef } from 'vue';

const props = withDefaults(defineProps<EventCalendarProps>(), {
	dayStartHour: 0,
	dayEndHour: 24,
	showWeekNumbers: false,
	locale: 'en',
	selectedEventId: null,
	compact: false,
	hideHeader: false,
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartPref());

const emit = defineEmits<{
	'update:view': [view: EventCalendarView];
	'update:selectedDate': [date: ForgeDate];
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
	slotClick: [payload: EventCalendarSlotClickPayload];
	dateClick: [payload: EventCalendarDateClickPayload];
}>();

defineSlots<{
	/** Custom content for the header right side (next to view switcher) */
	headerActions?: () => unknown;
}>();

const { title, navigatePrev, navigateNext } = useEventCalendar({
	selectedDate: toRef(() => props.selectedDate),
	view: toRef(() => props.view),
	events: toRef(() => props.events),
	weekStartsOn: toRef(() => resolvedWeekStart.value),
	locale: toRef(() => props.locale),
});

const rootClasses = computed(() => cn(eventCalendarRootVariants(), props.class));

function onPrev() {
	emit('update:selectedDate', navigatePrev());
}

function onNext() {
	emit('update:selectedDate', navigateNext());
}

function onPickDate(date: ForgeDate) {
	emit('update:selectedDate', date);
}

function onViewChange(view: EventCalendarView) {
	emit('update:view', view);
}

function onDateClick(payload: EventCalendarDateClickPayload) {
	emit('dateClick', payload);
}

function onMonthClick(payload: { month: number; event: MouseEvent }) {
	const date = new ForgeDate(new Date(props.selectedDate.year, payload.month - 1, 1));
	emit('update:selectedDate', date);
	emit('update:view', 'month');
}
</script>
