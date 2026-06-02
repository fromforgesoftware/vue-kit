export { default as TimeRangeBar } from './TimeRangeBar.vue';

export type {
	Segment,
	SegmentVariant,
	SegmentUpdateEvent,
	SegmentClickEvent,
	RangeClickEvent,
	RangeResizeEvent,
} from './time-range-bar';

export { segmentVariantClasses, generateHourTicks, computeSegmentLanes } from './time-range-bar';

export { useSegmentDrag, type UseSegmentDragOptions, type DragPreview } from './useSegmentDrag';
