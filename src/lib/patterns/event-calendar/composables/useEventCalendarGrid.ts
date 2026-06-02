import { computed, ref, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { ForgeDate, ForgeTime } from '@fromforgesoftware/ts-kit';
import type { EventCalendarItem } from '../event-calendar.js';

export function getWeekStart(date: ForgeDate, weekStartsOn: number): ForgeDate {
	const current = date.startOf('day');
	const wd = current.weekday; // 1=Mon, 7=Sun (ISO)
	const diff = (wd - weekStartsOn + 7) % 7;
	return current.minus({ days: diff });
}

export function buildMonthGrid(year: number, month: number, weekStartsOn: number): ForgeDate[][] {
	const firstOfMonth = new ForgeDate(new Date(year, month - 1, 1));
	const gridStart = getWeekStart(firstOfMonth, weekStartsOn);

	const weeks: ForgeDate[][] = [];
	let current = gridStart;

	for (let w = 0; w < 6; w++) {
		const week: ForgeDate[] = [];
		for (let d = 0; d < 7; d++) {
			week.push(current);
			current = current.plus({ days: 1 });
		}
		weeks.push(week);
	}
	return weeks;
}

export function isOnDate(event: EventCalendarItem, date: ForgeDate): boolean {
	const eventStart = event.start.startOf('day');
	const eventEnd = event.end.startOf('day');
	return (
		date.isSame(eventStart, 'day') ||
		date.isSame(eventEnd, 'day') ||
		date.isBetween(eventStart, eventEnd)
	);
}

export function isToday(date: ForgeDate): boolean {
	return date.isSame(ForgeDate.now(), 'day');
}

export function getEventsForDate(
	events: EventCalendarItem[],
	date: ForgeDate,
): EventCalendarItem[] {
	return events.filter((e) => isOnDate(e, date));
}

export function useWeekDayLabels(
	weekStartsOn: Ref<number>,
	locale: Ref<string>,
	weekday: 'short' | 'narrow' = 'short',
) {
	return computed(() => {
		// 2024-01-01 is a Monday (ISO weekday 1). Offset to get the desired start day.
		const base = new Date(2024, 0, 1 + ((weekStartsOn.value - 1 + 7) % 7));
		const formatter = new Intl.DateTimeFormat(locale.value, { weekday });
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(base);
			d.setDate(d.getDate() + i);
			return formatter.format(d);
		});
	});
}

export function formatHour(hour: number, _locale: string): string {
	return ForgeTime.formatTimeOfDay(hour * 3600);
}

export function formatEventTime(event: EventCalendarItem, _locale: string): string {
	const startSec = event.start.hour * 3600 + event.start.minute * 60;
	const endSec = event.end.hour * 3600 + event.end.minute * 60;
	return ForgeTime.formatSecRange(startSec, endSec);
}

// 56px = Tailwind `h-14`; the grid layout depends on this matching the row class.
const HOUR_HEIGHT = 56;

export { HOUR_HEIGHT };

export interface PositionedEvent {
	event: EventCalendarItem;
	top: number;
	height: number;
	column: number;
	totalColumns: number;
}

/**
 * Convert an event's start/end to minute offsets relative to dayStartHour.
 */
function eventToMinutes(
	event: EventCalendarItem,
	dayStartHour: number,
): { startMin: number; endMin: number } {
	const startMin = event.start.hour * 60 + event.start.minute - dayStartHour * 60;
	const endMin = event.end.hour * 60 + event.end.minute - dayStartHour * 60;
	return { startMin, endMin: Math.max(endMin, startMin + 15) };
}

/**
 * Assign column positions to overlapping events so they render side-by-side
 * instead of stacking on top of each other. Uses a greedy left-to-right packing.
 */
export function layoutOverlappingEvents(
	events: EventCalendarItem[],
	dayStartHour: number,
): PositionedEvent[] {
	if (events.length === 0) return [];

	// Sort by start time, then by longer duration first (longer events get left column)
	const sorted = [...events].sort((a, b) => {
		const aMin = eventToMinutes(a, dayStartHour);
		const bMin = eventToMinutes(b, dayStartHour);
		if (aMin.startMin !== bMin.startMin) return aMin.startMin - bMin.startMin;
		return bMin.endMin - bMin.startMin - (aMin.endMin - aMin.startMin);
	});

	// For each event, track its column and which "group" of overlapping events it belongs to
	const columns: { event: EventCalendarItem; startMin: number; endMin: number; column: number }[] =
		[];

	for (const event of sorted) {
		const { startMin, endMin } = eventToMinutes(event, dayStartHour);

		// Find the first column where this event doesn't overlap with any existing event
		let col = 0;

		while (true) {
			const conflict = columns.some(
				(c) => c.column === col && startMin < c.endMin && endMin > c.startMin,
			);
			if (!conflict) break;
			col++;
		}

		columns.push({ event, startMin, endMin, column: col });
	}

	// Now group overlapping events to determine totalColumns per group.
	// Two events are in the same group if they overlap (transitively).
	const groups: number[][] = []; // each group is an array of indices into `columns`

	for (let i = 0; i < columns.length; i++) {
		const ci = columns[i];
		let placed = false;
		for (const group of groups) {
			const overlapsGroup = group.some((gi) => {
				const cg = columns[gi];
				return ci.startMin < cg.endMin && ci.endMin > cg.startMin;
			});
			if (overlapsGroup) {
				group.push(i);
				placed = true;
				break;
			}
		}
		if (!placed) {
			groups.push([i]);
		}
	}

	// Merge groups that share overlapping events (transitive closure)
	let merged = true;
	while (merged) {
		merged = false;
		for (let i = 0; i < groups.length; i++) {
			for (let j = i + 1; j < groups.length; j++) {
				const overlaps = groups[i].some((ai) =>
					groups[j].some((bi) => {
						const ca = columns[ai];
						const cb = columns[bi];
						return ca.startMin < cb.endMin && ca.endMin > cb.startMin;
					}),
				);
				if (overlaps) {
					groups[i].push(...groups[j]);
					groups.splice(j, 1);
					merged = true;
					break;
				}
			}
			if (merged) break;
		}
	}

	// For each group, find max column used
	const totalColumnsMap = new Map<number, number>();
	for (const group of groups) {
		const maxCol = Math.max(...group.map((i) => columns[i].column));
		const total = maxCol + 1;
		for (const i of group) {
			totalColumnsMap.set(i, total);
		}
	}

	return columns.map((c, i) => {
		const top = (c.startMin / 60) * HOUR_HEIGHT;
		const height = ((c.endMin - c.startMin) / 60) * HOUR_HEIGHT;

		return {
			event: c.event,
			top,
			height: Math.max(height, 20),
			column: c.column,
			totalColumns: totalColumnsMap.get(i) ?? 1,
		};
	});
}

/**
 * Get CSS style for a positioned event with column layout.
 */
export function getPositionedEventStyle(pos: PositionedEvent): Record<string, string> {
	const widthPercent = 100 / pos.totalColumns;
	const leftPercent = pos.column * widthPercent;
	// Slight inset on the right for visual separation between columns
	const rightGapPx = pos.totalColumns > 1 ? 2 : 0;

	return {
		top: `${pos.top}px`,
		height: `${pos.height}px`,
		left: `calc(${leftPercent}% + 2px)`,
		width: `calc(${widthPercent}% - 4px - ${rightGapPx}px)`,
	};
}

export function useNowLine(dayStartHour: Ref<number>) {
	const now = ref(ForgeDate.now());
	let interval: ReturnType<typeof setInterval> | undefined;

	onMounted(() => {
		// 60s tick: matches ScheduleTimeline; finer ticks waste rAF on a sub-pixel move.
		interval = setInterval(() => {
			now.value = ForgeDate.now();
		}, 60_000);
	});

	onBeforeUnmount(() => {
		if (interval) clearInterval(interval);
	});

	function getNowLineTop(): number {
		const n = now.value;
		const minutes = (n.hour - dayStartHour.value) * 60 + n.minute;
		return (minutes / 60) * HOUR_HEIGHT;
	}

	return { now, getNowLineTop };
}

/**
 * Auto-scrolls to the current hour on mount.
 * Accepts a ref to either a raw HTMLElement or a Vue component instance
 * (e.g. ScrollArea). For component refs, we query for the Reka UI viewport.
 */
export function useAutoScroll(containerRef: Ref<HTMLElement | { $el?: HTMLElement } | undefined>) {
	onMounted(() => {
		// nextTick: scrollIntoView needs the grid mounted with rendered hour rows.
		nextTick(() => {
			const raw = containerRef.value;
			if (!raw) return;

			// Resolve to DOM element: either it IS one, or grab $el from component
			const el = raw instanceof HTMLElement ? raw : raw.$el;
			if (!el) return;

			// ScrollArea wraps content in a [data-reka-scroll-area-viewport] element
			const viewport = el.querySelector<HTMLElement>('[data-reka-scroll-area-viewport]') ?? el;

			const currentHour = ForgeDate.now().hour;
			viewport.scrollTop = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
		});
	});
}
