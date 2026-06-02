export { default as ScheduleTimeline } from './ScheduleTimeline.vue';
export { default as ScheduleTimelineDayRow } from './day/ScheduleTimelineDayRow.vue';
export { default as ScheduleTimelineLegend } from './shared/ScheduleTimelineLegend.vue';

export type {
	ChildHoverEvent,
	ScheduleTimelineDayCell,
	ScheduleTimelineDepartment,
	ScheduleTimelineEmployee,
	ScheduleTimelineEmployeeRow as ScheduleTimelineEmployeeRowType,
	ScheduleTimelineEmployeeStatus,
	ScheduleTimelineLegendIndicator,
	ScheduleTimelineLegendItem,
	ScheduleTimelineShift,
	ScheduleTimelineShiftChild,
	ScheduleTimelineShiftVariant,
	ScheduleTimelineView,
	ShiftClickEvent,
	ShiftContextMenuEvent,
	ShiftResizeEvent,
	ShiftMoveEvent,
	ShiftReassignEvent,
	ShiftSegmentUpdateEvent,
	ShiftSegmentSelectEvent,
	ShiftBarClickEvent,
} from './schedule-timeline.js';

export {
	shiftVariantClasses,
	shiftVariantToSegmentVariant,
	shiftChildrenToSegments,
} from './schedule-timeline.js';

export {
	parseHHMMToSec,
	formatShiftDuration,
	shiftStartSec,
	variantTokenColor,
	buildDayRange,
	isWeekendDay,
} from './utils.js';
