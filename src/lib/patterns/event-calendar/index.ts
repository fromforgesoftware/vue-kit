export { default as EventCalendar } from './EventCalendar.vue';
export { default as EventCalendarHeader } from './EventCalendarHeader.vue';
export { default as EventCalendarDay } from './EventCalendarDay.vue';
export { default as EventCalendarWeek } from './EventCalendarWeek.vue';
export { default as EventCalendarMonth } from './EventCalendarMonth.vue';
export { default as EventCalendarYear } from './EventCalendarYear.vue';
export { default as EventCalendarWeekHorizontal } from './EventCalendarWeekHorizontal.vue';
export { default as EventCalendarEvent } from './EventCalendarEvent.vue';

export {
	// Types
	type EventCalendarView,
	type EventCalendarEventVariant,
	type EventCalendarSegmentVariant,
	type EventCalendarSegment,
	type EventCalendarItem,
	type EventCalendarProps,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
	type EventCalendarSlotClickPayload,
	type EventCalendarDateClickPayload,
	// CVA variants
	eventCalendarRootVariants,
	eventCalendarHeaderVariants,
	eventCalendarHeaderTitleVariants,
	eventCalendarEventVariants,
	eventCalendarTimedEventVariants,
	eventCalendarDayHeaderVariants,
	eventCalendarTimeGutterVariants,
	eventCalendarHourRowVariants,
	eventCalendarMonthCellVariants,
	eventCalendarMonthDayNumberVariants,
	eventCalendarNowLineVariants,
	eventCalendarYearMiniMonthVariants,
	eventCalendarYearMiniDayVariants,
	type EventCalendarEventVariants,
} from './event-calendar.js';

// Composables
export {
	useEventCalendar,
	type UseEventCalendarOptions,
	type UseEventCalendarReturn,
} from './composables/useEventCalendar.js';

export {
	getWeekStart,
	buildMonthGrid,
	isOnDate,
	isToday,
	getEventsForDate,
	useWeekDayLabels,
	formatHour,
	formatEventTime,
	layoutOverlappingEvents,
	getPositionedEventStyle,
	useNowLine,
	useAutoScroll,
	HOUR_HEIGHT,
	type PositionedEvent,
} from './composables/useEventCalendarGrid.js';
