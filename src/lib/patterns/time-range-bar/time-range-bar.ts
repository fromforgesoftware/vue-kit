import type { Component } from 'vue';
import { ForgeTime } from '@fromforgesoftware/ts-kit';

/** Color tone applied to a child segment's background, text, and border. */
export type SegmentVariant = 'green' | 'purple' | 'blue' | 'amber' | 'red' | 'gray';

/** Tailwind class lookup for each {@link SegmentVariant}. */
export const segmentVariantClasses: Record<
	SegmentVariant,
	{ bg: string; text: string; border: string; bar: string }
> = {
	green: {
		bg: 'bg-trb-green-subtle',
		text: 'text-trb-green-foreground',
		border: 'border-trb-green',
		bar: 'bg-trb-green',
	},
	purple: {
		bg: 'bg-trb-purple-subtle',
		text: 'text-trb-purple-foreground',
		border: 'border-trb-purple',
		bar: 'bg-trb-purple',
	},
	blue: {
		bg: 'bg-trb-blue-subtle',
		text: 'text-trb-blue-foreground',
		border: 'border-trb-blue',
		bar: 'bg-trb-blue',
	},
	amber: {
		bg: 'bg-trb-amber-subtle',
		text: 'text-trb-amber-foreground',
		border: 'border-trb-amber',
		bar: 'bg-trb-amber',
	},
	red: {
		bg: 'bg-trb-red-subtle',
		text: 'text-trb-red-foreground',
		border: 'border-trb-red',
		bar: 'bg-trb-red',
	},
	gray: {
		bg: 'bg-trb-gray-subtle',
		text: 'text-trb-gray-foreground',
		border: 'border-trb-gray',
		bar: 'bg-trb-gray',
	},
};

/** A child block rendered inside the bar at `offsetSec` for `durationSec`. */
export interface Segment {
	/** Stable identifier — used in events and as Vue's `:key`. */
	id: string;
	/** Label shown when the segment is wide enough (≥ 60px). */
	label?: string;
	/** Optional Lucide icon component. */
	icon?: Component;
	/** Offset from the bar's start in seconds. */
	offsetSec: number;
	/** Length of the segment in seconds. */
	durationSec: number;
	/** Color variant — controls bg / text / border. */
	variant: SegmentVariant;
	/**
	 * When the bar's `overlap` mode is `'block'`, segments with `canOverlap: true`
	 * are allowed to sit on top of any other segment. Use it to mark "free
	 * agent" segments (e.g. a sub-status overlay) that bypass the global
	 * overlap rule. Defaults to `false`.
	 */
	canOverlap?: boolean;
	/**
	 * When true, this segment represents a *gap* in the bar's time range — a
	 * region where the bar is visually absent (e.g., employee logged off
	 * mid-shift). Gap segments don't render as colored blocks; they cut the
	 * bar's track via a CSS mask. Default false (regular segment).
	 */
	isGap?: boolean;
	/** Pass-through metadata for the caller. */
	data?: Record<string, unknown>;
}

/** Emitted when a segment is dragged or resized. */
export interface SegmentUpdateEvent {
	segmentId: string;
	offsetSec: number;
	durationSec: number;
}

/** Emitted when a segment is clicked (not dragged). `rect` is for popover anchoring. */
export interface SegmentClickEvent {
	segment: Segment;
	index: number;
	rect: DOMRect;
}

/** Emitted when the empty bar background is clicked. */
export interface RangeClickEvent {
	offsetSec: number;
	event: MouseEvent;
}

/** Emitted when the bar itself is resized via its left/right edges. */
export interface RangeResizeEvent {
	startTimeSec: number;
	durationSec: number;
}

/**
 * Generate hour tick marks for the time ruler.
 * Automatically picks a step size so there are always ~6–8 ticks max.
 * When `compact` is true, labels use short form ("8" vs "08:00").
 * Time format respects the user's hour cycle preference via ForgeTime.
 */
export function generateHourTicks(
	startTimeSec: number,
	durationSec: number,
	compact = false,
): { label: string; percent: number }[] {
	const totalHours = durationSec / 3600;
	const TARGET_TICKS = 8;
	const stepOptions = [1, 2, 3, 4, 6, 8, 12];
	const stepHours = stepOptions.find((s) => totalHours / s <= TARGET_TICKS) ?? 12;
	const stepSec = stepHours * 3600;

	const endSec = startTimeSec + durationSec;
	const firstTick = Math.ceil(startTimeSec / stepSec) * stepSec;
	const ticks: { label: string; percent: number }[] = [];
	const fmt = compact ? ForgeTime.formatTimeOfDayShort : ForgeTime.formatTimeOfDay;

	for (let sec = firstTick; sec <= endSec; sec += stepSec) {
		const percent = ((sec - startTimeSec) / durationSec) * 100;
		if (percent >= 0 && percent <= 100) {
			ticks.push({ label: fmt(sec), percent });
		}
	}
	return ticks;
}

/** Regular (non-gap) segments — the ones that render as colored blocks. */
export function nonGapSegments(segments: Segment[]): Segment[] {
	return segments.filter((s) => s.isGap !== true);
}

/** Gap segments — purely visual cuts in the bar's track. */
export function gapSegments(segments: Segment[]): Segment[] {
	return segments.filter((s) => s.isGap === true);
}

/**
 * Build a `mask-image` linear-gradient that "cuts" the bar at every gap
 * segment's position. Returns `undefined` when there are no gaps so callers
 * can leave the inline style off entirely.
 *
 * The gradient runs `to right` for horizontal bars and `to bottom` for
 * vertical bars, with a 0.15% feather on each gap edge to soften the cut.
 * Mirrors the schedule-timeline DayView's `gapMaskStyle` helper.
 */
export function gapMaskStyle(
	segments: Segment[],
	totalSec: number,
	isVertical: boolean,
): Record<string, string> | undefined {
	const gaps = gapSegments(segments);
	if (!gaps.length || !totalSec) return undefined;

	const sorted = [...gaps].sort((a, b) => a.offsetSec - b.offsetSec);
	const feather = 0.15;

	const stops: string[] = [];
	let lastEnd = 0;
	for (const gap of sorted) {
		const gapStart = (gap.offsetSec / totalSec) * 100;
		const gapEnd = ((gap.offsetSec + gap.durationSec) / totalSec) * 100;
		stops.push(`black ${lastEnd}%`, `black ${gapStart - feather}%`);
		stops.push(`transparent ${gapStart + feather}%`, `transparent ${gapEnd - feather}%`);
		lastEnd = gapEnd + feather;
	}
	stops.push(`black ${lastEnd}%`, `black 100%`);

	const direction = isVertical ? 'to bottom' : 'to right';
	const gradient = `linear-gradient(${direction}, ${stops.join(', ')})`;
	return { maskImage: gradient, WebkitMaskImage: gradient };
}

/**
 * Returns the percentage positions of every gap edge along the time axis,
 * so callers can render a thin solid marker at each cut boundary.
 */
export function gapEdges(
	segments: Segment[],
	totalSec: number,
): { id: string; offsetPct: number }[] {
	const gaps = gapSegments(segments);
	if (!gaps.length || !totalSec) return [];
	const edges: { id: string; offsetPct: number }[] = [];
	for (const gap of gaps) {
		const startPct = (gap.offsetSec / totalSec) * 100;
		const endPct = ((gap.offsetSec + gap.durationSec) / totalSec) * 100;
		edges.push({ id: `${gap.id}-s`, offsetPct: startPct });
		edges.push({ id: `${gap.id}-e`, offsetPct: endPct });
	}
	return edges;
}

/**
 * Compute the overlap lane (0-based row) for each segment.
 * Segments are assigned to the lowest lane where they don't overlap
 * with any previously assigned segment.
 */
export function computeSegmentLanes(segments: Segment[]): Map<string, number> {
	const sorted = [...segments].sort((a, b) => a.offsetSec - b.offsetSec);
	// Each lane tracks the end time of its last assigned segment
	const laneEnds: number[] = [];
	const lanes = new Map<string, number>();

	for (const seg of sorted) {
		const start = seg.offsetSec;
		let placed = false;
		for (let lane = 0; lane < laneEnds.length; lane++) {
			if (start >= laneEnds[lane]) {
				laneEnds[lane] = start + seg.durationSec;
				lanes.set(seg.id, lane);
				placed = true;
				break;
			}
		}
		if (!placed) {
			lanes.set(seg.id, laneEnds.length);
			laneEnds.push(start + seg.durationSec);
		}
	}
	return lanes;
}
