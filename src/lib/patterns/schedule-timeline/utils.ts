import type { ForgeDate } from '@fromforgesoftware/ts-kit';
import { computeSegmentLanes } from '../time-range-bar';
import type {
	ScheduleTimelineDayCell,
	ScheduleTimelineEmployeeRow,
	ScheduleTimelineShift,
	ScheduleTimelineShiftVariant,
} from './schedule-timeline';

// Layout constants for the day view's absolute-positioned shift cards.
// Centralised so DayView, DayRow, and DayShift agree on vertical math.
export const DAY_SHIFT_CARD_HEIGHT = 40;
export const DAY_SHIFT_CARD_SPACING = 4;
export const DAY_SHIFT_TOP_PADDING = 6;

// Named z-index layers. Centralised so the half-dozen sticky surfaces
// (hour header, sticky employee column, department header, now-line,
// gap edges) stack predictably. Values are deliberately spaced to leave
// room for future intermediate layers without renumbering callers.
// Legends always render *below* row sticky cells: when a long department
// row scrolls past, the sticky employee cell must paint on top of the
// legend strip, not under it.
export const ScheduleTimelineZ = {
	shiftGapEdge: 6,
	// 8 px hit-zones sit at the card's left / right edges in edit mode so the
	// user lands on the resize gesture instead of the bar body. They must
	// paint above the inner `TimeRangeBar` chrome but stay under sticky
	// headers so a long row doesn't bleed handles onto the sticky cell.
	shiftEdgeHandle: 7,
	// While a user is mid-drag on a shift, lift it above sibling shifts (but
	// still under sticky chrome) so the translated card visually leads the
	// pack instead of getting clipped by neighbours in the same row.
	shiftDragging: 8,
	// Per-shift toolbar (edit mode) — renders just below the selected card.
	// Above sibling shifts and the legend strip so the toolbar isn't
	// visually buried, but below the sticky employee column / headers so
	// those keep painting on top of the toolbar when the user scrolls.
	shiftToolbar: 9,
	legendSticky: 9,
	rowStickyColumn: 10,
	header: 20,
	headerStickyColumn: 25,
	departmentHeaderSticky: 30,
} as const;

// Max shifts rendered per month cell before an inline "+N" overflow button
// appears. MonthView and MonthRow must stay in lockstep — keep here.
export const MAX_VISIBLE_MONTH_SHIFTS = 2;

// `--color-st-*` resolves to `oklch(var(--schedule-timeline-*))` in
// globals.css; using it directly keeps inline styles in the same token
// system as the `bg-st-*` Tailwind classes used everywhere else.
const variantTokenName: Record<ScheduleTimelineShiftVariant, string> = {
	green: '--color-st-logged-in',
	purple: '--color-st-leave',
	blue: '--color-st-work',
	amber: '--color-st-exception',
	red: '--color-st-adherence',
	gray: '--color-st-logged-out',
	break: '--color-st-break',
	meeting: '--color-st-meeting',
	'post-process': '--color-st-post-process',
};

export function variantTokenColor(variant: ScheduleTimelineShiftVariant): string {
	return `var(${variantTokenName[variant]})`;
}

// Cheap stable hash for an id array: avoids the O(n) `join('|')` allocation
// done on every parent render. False-collisions on length+endpoints are
// possible but harmless — the selection Set is rebuilt next time the hash
// drifts. Used by the three views to gate the `selectedSet` rebuild.
export function selectionKey(ids: readonly string[] | undefined): string {
	if (!ids || ids.length === 0) return '0';
	return `${ids.length}|${ids[0]}|${ids[ids.length - 1]}`;
}

export function parseHHMMToSec(s: string | undefined): number {
	if (!s) return NaN;
	const [h, m] = s.split(':').map(Number);
	if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
	return h * 3600 + m * 60;
}

export function shiftStartSec(shift: ScheduleTimelineShift): number {
	const sec = parseHHMMToSec(shift.time);
	return Number.isFinite(sec) ? sec : 0;
}

// Human-readable shift duration ("1d", "1d 8h", "8h", "7h 30m", "45m").
export function formatShiftDuration(durationSec: number | undefined): string {
	if (!durationSec || durationSec <= 0) return '';
	const totalMinutes = Math.round(durationSec / 60);
	const days = Math.floor(totalMinutes / (24 * 60));
	const remainingAfterDays = totalMinutes - days * 24 * 60;
	const hours = Math.floor(remainingAfterDays / 60);
	const minutes = remainingAfterDays - hours * 60;
	if (days > 0 && hours === 0 && minutes === 0) return `${days}d`;
	if (days > 0 && minutes === 0) return `${days}d ${hours}h`;
	if (days > 0) return `${days}d ${hours}h ${minutes}m`;
	if (hours > 0 && minutes === 0) return `${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

export function buildDayRange(from: ForgeDate, to: ForgeDate): ForgeDate[] {
	const days: ForgeDate[] = [];
	let current = from;
	while (current.isBefore(to) || current.isSame(to, 'day')) {
		days.push(current);
		current = current.plus({ days: 1 });
	}
	return days;
}

export function isWeekendDay(day: ForgeDate): boolean {
	return day.weekday >= 6;
}

export function getDayCell(
	row: ScheduleTimelineEmployeeRow,
	dateStr: string,
): ScheduleTimelineDayCell {
	return row.days[dateStr] ?? { shifts: [] };
}

export function getMonthOverflow(cell: ScheduleTimelineDayCell): number {
	return Math.max(0, cell.shifts.length - MAX_VISIBLE_MONTH_SHIFTS);
}

// Single source of truth for the day-view greedy lane assignment used by
// row-height math and per-shift `top` positioning. Adapts shifts onto the
// Segment shape TimeRangeBar's `computeSegmentLanes` expects.
export function computeShiftLanes(shifts: ScheduleTimelineShift[]): {
	lanes: Map<string, number>;
	layers: number;
} {
	if (shifts.length === 0) return { lanes: new Map(), layers: 0 };
	const adapted = shifts.map((s) => ({
		id: s.id,
		offsetSec: shiftStartSec(s),
		durationSec: s.durationSec ?? 0,
		variant: 'gray' as const,
	}));
	const lanes = computeSegmentLanes(adapted);
	let maxLane = 0;
	for (const lane of lanes.values()) if (lane > maxLane) maxLane = lane;
	return { lanes, layers: maxLane + 1 };
}

// Computes the absolute row height for a stacked day-view row. Pass the
// number of vertical layers (from `computeShiftLanes`) plus the per-card
// metrics so callers don't need to know the layout constants.
export function computeStackedRowHeight(
	layers: number,
	minHeight: number,
	cardHeight: number = DAY_SHIFT_CARD_HEIGHT,
	cardSpacing: number = DAY_SHIFT_CARD_SPACING,
	topPadding: number = DAY_SHIFT_TOP_PADDING,
): number {
	if (layers <= 1) return minHeight;
	return Math.max(minHeight, topPadding * 2 + layers * (cardHeight + cardSpacing));
}
