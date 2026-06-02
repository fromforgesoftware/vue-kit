import { cva, type VariantProps } from 'class-variance-authority';
import type { ForgeDate } from '@fromforgesoftware/ts-kit';
import type { Component } from 'vue';

/** Calendar view mode — controls grid density and cell layout. */
export type EventCalendarView = 'day' | 'week' | 'month' | 'year' | 'week-horizontal';

/** Event tone — semantic colours, not arbitrary palette. */
export type EventCalendarEventVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'neutral';

// Segment variants apply to child blocks inside a timed event (lunch/break/etc).
export type EventCalendarSegmentVariant = 'green' | 'purple' | 'blue' | 'amber' | 'red' | 'gray';

export interface EventCalendarSegment {
	/** Fraction (0–1) of parent duration where this segment starts */
	offset: number;
	/** Fraction (0–1) of parent duration this segment spans */
	size: number;
	/** Display label (shown when space allows) */
	label?: string;
	/** Lucide icon component */
	icon?: Component;
	/** Color variant */
	variant?: EventCalendarSegmentVariant;
}

/** A calendar event with timing, colour, and optional child segments (lunch / break). */
export interface EventCalendarItem {
	/** Unique identifier */
	id: string;
	/** Event title */
	title: string;
	/** Start date/time */
	start: ForgeDate;
	/** End date/time */
	end: ForgeDate;
	/** All-day event (renders in all-day section, not timed grid) */
	allDay?: boolean;
	/** Visual variant for color theming */
	variant?: EventCalendarEventVariant;
	/** Optional Lucide icon component */
	icon?: Component;
	/** Optional description shown below title in day/week views */
	description?: string;
	/** Child segments rendered as positioned blocks inside timed events */
	segments?: EventCalendarSegment[];
	/** Extensible metadata for consumer use */
	meta?: Record<string, unknown>;
}

/** Props for {@link EventCalendar}. View + selected date are the controlling state; events list drives content. */
export interface EventCalendarProps {
	/** Active view mode */
	view: EventCalendarView;
	/** Currently displayed date (controls which day/week/month/year is visible) */
	selectedDate: ForgeDate;
	/** Events to display */
	events: EventCalendarItem[];
	/** First day of week: ISO weekday (1=Monday, ..., 7=Sunday) */
	weekStartsOn?: number;
	/** Day view start hour (default 0) */
	dayStartHour?: number;
	/** Day view end hour (default 24) */
	dayEndHour?: number;
	/** Show week numbers in month view */
	showWeekNumbers?: boolean;
	/** Locale for formatting (default "en") */
	locale?: string;
	/** ID of the currently selected event (highlighted with ring) */
	selectedEventId?: string | null;
	/**
	 * Compact density. Currently honoured by the `week-horizontal` view: shorter
	 * day rows, fewer hour ticks, hides event titles inside narrow chips. Other
	 * views ignore this and render at their default density.
	 */
	compact?: boolean;
	/**
	 * Suppress the top toolbar (view switcher, prev/next, label). Use when
	 * embedding the calendar as a preview widget and navigation lives elsewhere.
	 */
	hideHeader?: boolean;
	/** Additional CSS classes */
	class?: string;
}

/** Payload emitted when the user clicks an event card. */
export interface EventCalendarEventClickPayload {
	item: EventCalendarItem;
	event: MouseEvent;
}

export interface EventCalendarSlotClickPayload {
	date: ForgeDate;
	event: MouseEvent;
}

export interface EventCalendarEventHoverPayload {
	item: EventCalendarItem;
	/** Bounding rect of the event card element, for popover positioning */
	rect: DOMRect;
	event: MouseEvent;
}

export interface EventCalendarDateClickPayload {
	date: ForgeDate;
	event: MouseEvent;
}

/** Root container. Fills the available height; rounded card surface. */
export const eventCalendarRootVariants = cva(
	'flex flex-col h-full w-full bg-background text-foreground overflow-hidden rounded-lg border',
);

/** Toolbar at the top of the calendar — view switcher + nav buttons. */
export const eventCalendarHeaderVariants = cva(
	'flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-background',
);

/** Title text in the header (e.g. "October 2026"). */
export const eventCalendarHeaderTitleVariants = cva('text-base font-semibold select-none');

/** Event card. Tone is driven by `variant`; uses event-calendar-specific tokens. */
export const eventCalendarEventVariants = cva(
	'rounded-md px-2 py-0.5 text-xs font-medium truncate cursor-pointer select-none border-l-[3px] transition-shadow hover:shadow-sm',
	{
		variants: {
			variant: {
				primary: 'bg-ec-primary-subtle text-ec-primary-foreground border-l-ec-primary',
				secondary: 'bg-ec-secondary-subtle text-ec-secondary-foreground border-l-ec-secondary',
				success: 'bg-ec-success-subtle text-ec-success-foreground border-l-ec-success',
				warning: 'bg-ec-warning-subtle text-ec-warning-foreground border-l-ec-warning',
				danger: 'bg-ec-danger-subtle text-ec-danger-foreground border-l-ec-danger',
				info: 'bg-ec-info-subtle text-ec-info-foreground border-l-ec-info',
				neutral: 'bg-ec-neutral-subtle text-ec-neutral-foreground border-l-ec-neutral',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	},
);

export type EventCalendarEventVariants = VariantProps<typeof eventCalendarEventVariants>;

export const eventCalendarTimedEventVariants = cva(
	'absolute rounded-lg px-2.5 py-1.5 text-xs cursor-pointer select-none border border-l-[3px] overflow-hidden transition-shadow hover:shadow-sm',
	{
		variants: {
			variant: {
				primary:
					'bg-ec-primary-subtle text-ec-primary-foreground border-ec-primary/30 border-l-ec-primary',
				secondary:
					'bg-ec-secondary-subtle text-ec-secondary-foreground border-ec-secondary/30 border-l-ec-secondary',
				success:
					'bg-ec-success-subtle text-ec-success-foreground border-ec-success/30 border-l-ec-success',
				warning:
					'bg-ec-warning-subtle text-ec-warning-foreground border-ec-warning/30 border-l-ec-warning',
				danger:
					'bg-ec-danger-subtle text-ec-danger-foreground border-ec-danger/30 border-l-ec-danger',
				info: 'bg-ec-info-subtle text-ec-info-foreground border-ec-info/30 border-l-ec-info',
				neutral:
					'bg-ec-neutral-subtle text-ec-neutral-foreground border-ec-neutral/30 border-l-ec-neutral',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	},
);

export const eventCalendarDayHeaderVariants = cva(
	'text-center py-2 text-xs font-medium text-muted-foreground border-b border-r last:border-r-0',
);

export const eventCalendarTimeGutterVariants = cva(
	'w-16 flex-shrink-0 text-right pr-2 text-2xs text-muted-foreground select-none',
);

export const eventCalendarHourRowVariants = cva('border-b border-border/50 relative', {
	variants: {
		height: {
			default: 'h-14',
			compact: 'h-10',
		},
	},
	defaultVariants: {
		height: 'default',
	},
});

export const eventCalendarMonthCellVariants = cva(
	'min-h-28 border-r border-b last:border-r-0 p-1 transition-colors',
	{
		variants: {
			today: {
				true: 'bg-primary/5',
				false: '',
			},
			outsideMonth: {
				true: 'bg-muted/30',
				false: '',
			},
		},
		defaultVariants: {
			today: false,
			outsideMonth: false,
		},
	},
);

export const eventCalendarMonthDayNumberVariants = cva(
	'inline-flex size-7 items-center justify-center rounded-full text-sm',
	{
		variants: {
			today: {
				true: 'bg-primary text-primary-foreground font-semibold',
				false: '',
			},
			outsideMonth: {
				true: 'text-muted-foreground',
				false: '',
			},
		},
		defaultVariants: {
			today: false,
			outsideMonth: false,
		},
	},
);

export const eventCalendarNowLineVariants = cva(
	'absolute left-0 right-0 h-[2px] bg-destructive z-20 pointer-events-none before:absolute before:left-0 before:-top-[4px] before:size-[10px] before:rounded-full before:bg-destructive',
);

export const eventCalendarYearMiniMonthVariants = cva(
	'rounded-lg border bg-background p-3 transition-colors hover:bg-accent/30 cursor-pointer',
);

export const eventCalendarYearMiniDayVariants = cva(
	'size-6 flex items-center justify-center rounded-full text-xs cursor-pointer hover:bg-accent',
	{
		variants: {
			today: {
				true: 'bg-primary text-primary-foreground font-semibold',
				false: '',
			},
			hasEvents: {
				true: 'bg-primary/15 font-medium text-primary-text',
				false: '',
			},
			outsideMonth: {
				true: 'text-transparent pointer-events-none',
				false: '',
			},
		},
		defaultVariants: {
			today: false,
			hasEvents: false,
			outsideMonth: false,
		},
	},
);
