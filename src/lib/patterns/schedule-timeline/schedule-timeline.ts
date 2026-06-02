import type { Component } from 'vue';
import type { Segment, SegmentVariant } from '../time-range-bar/time-range-bar.js';

export type ScheduleTimelineView = 'day' | 'week' | 'month';

// Variant names are kept (legacy colour-named + semantic) so call sites
// can pick the closest tone; each maps to a `--color-st-*` token below.
export type ScheduleTimelineShiftVariant =
	| 'green'
	| 'purple'
	| 'blue'
	| 'amber'
	| 'red'
	| 'gray'
	| 'break'
	| 'meeting'
	| 'post-process';

export type ScheduleTimelineLegendIndicator = 'swap' | 'covering' | 'sick';

export interface ScheduleTimelineLegendItem {
	type: ScheduleTimelineLegendIndicator;
	label: string;
}

// Public emit payloads. Defined here (not inside a `<script setup>` SFC) so
// downstream views can import them as plain types without depending on the
// orchestrator component's compiled module surface.
export interface ShiftContextMenuEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	x: number;
	y: number;
	meta?: Record<string, unknown>;
}

export type ShiftClickEvent = ShiftContextMenuEvent;

export interface ChildHoverEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	childIndex: number;
	childType: string;
}

// ─── Edit-mode payloads (day view) ──────────────────────────────────────────
// All four carry the shift / employee / date context so a flat handler on
// the page can route mutations into the right draft without re-deriving it.
// `startTimeSec` is wall-clock seconds-of-day (translated from the inner
// `TimeRangeBar`'s zero-anchored axis before emission).

export interface ShiftResizeEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	startTimeSec: number;
	durationSec: number;
	/**
	 * Authoritative children for the resized bar. Already re-anchored so the
	 * segments hold their wall-clock position (resize-start subtracts the
	 * delta from each child's `offsetSec`; resize-end leaves them alone).
	 * Children that fall outside the new bar window are filtered out.
	 *
	 * Consumers MUST replace the shift's children with this array when
	 * persisting — passing only `startTimeSec` + `durationSec` will jump the
	 * segments to a wrong hour the moment the drag preview clears.
	 */
	children: ScheduleTimelineShiftChild[];
}

export interface ShiftMoveEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	startTimeSec: number;
}

/**
 * Edit-mode (day view): a move-drag ended over a different employee row
 * (or different date in multi-day views). Consumers materialise this as
 * delete-original + create-at-target — the bulk save endpoint doesn't
 * carry a `move` op, so the timeline pattern collapses the gesture into
 * the two ops it already supports.
 */
export interface ShiftReassignEvent {
	shiftId: string;
	fromEmployeeId: string;
	fromDateStr: string;
	toEmployeeId: string;
	toDateStr: string;
	startTimeSec: number;
}

export interface ShiftSegmentUpdateEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	segmentId: string;
	offsetSec: number;
	durationSec: number;
}

export interface ShiftSegmentSelectEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	segmentId: string | null;
}

/**
 * Edit-mode: the user clicked the bar surface (not a segment, not an
 * edge). `offsetSec` is the click position within the shift's own
 * duration. Consumers wire this to position any per-shift toolbar and
 * to anchor "Add period" placements at the click point — same coupling
 * the shift-template editor uses internally.
 */
export interface ShiftBarClickEvent {
	shiftId: string;
	employeeId: string;
	dateStr: string;
	offsetSec: number;
}

// Status dot tone on the employee avatar. `online` paints success-green;
// anything else collapses to a muted neutral.
export type ScheduleTimelineEmployeeStatus = 'online' | 'offline';

export interface ScheduleTimelineShiftChild {
	type: string;
	label?: string;
	icon?: Component;
	offsetSec: number;
	durationSec: number;
	variant: ScheduleTimelineShiftVariant;
}

export interface ScheduleTimelineShift {
	id: string;
	name: string;
	timeRange: string;
	// "HH:mm" — used for day view positioning.
	time?: string;
	durationSec?: number;
	variant: ScheduleTimelineShiftVariant;
	icon?: Component;
	children?: ScheduleTimelineShiftChild[];
	isSwap?: boolean;
	isCovering?: boolean;
	isSick?: boolean;
	isDraft?: boolean;
	isLocked?: boolean;
	warnings?: string[];
	// Pass-through for caller-specific data; the timeline ignores it.
	meta?: Record<string, unknown>;
}

export interface ScheduleTimelineEmployee {
	id: string;
	name: string;
	avatarUrl?: string;
	weeklyHours?: number;
	// Pre-computed by the page; tone reflects actual-vs-contract delta.
	scheduledHours?: number;
	scheduledHoursTone?: 'ok' | 'under' | 'over';
	role?: string;
	status?: ScheduleTimelineEmployeeStatus;
}

export interface ScheduleTimelineDayCell {
	shifts: ScheduleTimelineShift[];
	isOff?: boolean;
	locked?: boolean;
}

export interface ScheduleTimelineEmployeeRow {
	employee: ScheduleTimelineEmployee;
	// Keyed by `yyyy-MM-dd`.
	days: Record<string, ScheduleTimelineDayCell>;
}

export interface ScheduleTimelineDepartment {
	id: string;
	name: string;
	icon?: Component;
	rows: ScheduleTimelineEmployeeRow[];
	legend?: ScheduleTimelineLegendItem[];
}

export const shiftVariantClasses: Record<
	ScheduleTimelineShiftVariant,
	{ bg: string; text: string }
> = {
	green: { bg: 'bg-st-logged-in-subtle', text: 'text-st-logged-in-foreground' },
	purple: { bg: 'bg-st-leave-subtle', text: 'text-st-leave-foreground' },
	blue: { bg: 'bg-st-work-subtle', text: 'text-st-work-foreground' },
	amber: { bg: 'bg-st-exception-subtle', text: 'text-st-exception-foreground' },
	red: { bg: 'bg-st-adherence-subtle', text: 'text-st-adherence-foreground' },
	gray: { bg: 'bg-st-logged-out-subtle', text: 'text-st-logged-out-foreground' },
	break: { bg: 'bg-st-break-subtle', text: 'text-st-break-foreground' },
	meeting: { bg: 'bg-st-meeting-subtle', text: 'text-st-meeting-foreground' },
	'post-process': {
		bg: 'bg-st-post-process-subtle',
		text: 'text-st-post-process-foreground',
	},
};

// Semantic ST variants don't have a 1:1 partner in TimeRangeBar's narrower
// `SegmentVariant`, so they collapse onto the closest base tone.
export function shiftVariantToSegmentVariant(
	variant: ScheduleTimelineShiftVariant,
): SegmentVariant {
	switch (variant) {
		case 'green':
		case 'purple':
		case 'blue':
		case 'amber':
		case 'red':
		case 'gray':
			return variant;
		case 'break':
		case 'post-process':
			return 'gray';
		case 'meeting':
			return 'blue';
		default:
			return 'gray';
	}
}

// `type === 'gap'` children become `isGap` segments so TimeRangeBar applies
// its own mask + edge markers (used by `density="card"`; pill density
// ignores segments). Day view applies its own gap mask on the wrapper —
// the duplicate is harmless because both compute the same cut.
export function shiftChildrenToSegments(shift: ScheduleTimelineShift): Segment[] {
	const out: Segment[] = [];
	const children = shift.children ?? [];
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (!child.durationSec || child.durationSec <= 0) continue;
		if (child.type === 'gap') {
			out.push({
				id: `${shift.id}-child-${i}`,
				label: child.label,
				offsetSec: child.offsetSec,
				durationSec: child.durationSec,
				variant: shiftVariantToSegmentVariant(child.variant),
				isGap: true,
			});
			continue;
		}
		out.push({
			id: `${shift.id}-child-${i}`,
			label: child.label,
			icon: child.icon,
			offsetSec: child.offsetSec,
			durationSec: child.durationSec,
			variant: shiftVariantToSegmentVariant(child.variant),
			// Sub-statuses overlay everything — breaks / lunches can't overlap
			// each other, but a sub-status can sit on top of a work block, a
			// break, or a lunch. Mirrors the shift-template editor's rule
			// (`ShiftBar.vue` sets the same `canOverlap` for sub-status
			// children + `overlap="block"` on the bar). The day-shift card
			// already passes `overlap="block"`, so flipping `canOverlap` here
			// is what lets the rule actually take effect during drag.
			canOverlap: child.type === 'substatus',
		});
	}
	return out;
}
