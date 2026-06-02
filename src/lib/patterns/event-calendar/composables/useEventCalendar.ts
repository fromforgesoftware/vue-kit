import { computed, type Ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import type { EventCalendarItem, EventCalendarView } from '../event-calendar.js';

export interface UseEventCalendarOptions {
	selectedDate: Ref<ForgeDate>;
	view: Ref<EventCalendarView>;
	events: Ref<EventCalendarItem[]>;
	weekStartsOn: Ref<number>;
	locale: Ref<string>;
}

export interface UseEventCalendarReturn {
	/** Title string for the header (e.g. "April 2026", "Apr 14 - 20, 2026") */
	title: Ref<string>;
	/** Days of the week header labels */
	weekDayLabels: Ref<string[]>;
	/** Array of hours for the time gutter (0-23) */
	hours: Ref<number[]>;
	/** Days in the current week view */
	weekDays: Ref<ForgeDate[]>;
	/** Grid of weeks for month view: each week is an array of dates */
	monthGrid: Ref<ForgeDate[][]>;
	/** 12 months for year view, each with its grid */
	yearMonths: Ref<{ month: number; label: string; grid: ForgeDate[][] }[]>;
	/** Navigate to previous period */
	navigatePrev: () => ForgeDate;
	/** Navigate to next period */
	navigateNext: () => ForgeDate;
	/** Navigate to today */
	navigateToday: () => ForgeDate;
	/** Get events for a specific date */
	getEventsForDate: (date: ForgeDate) => EventCalendarItem[];
	/** Get timed (non-all-day) events for a date */
	getTimedEventsForDate: (date: ForgeDate) => EventCalendarItem[];
	/** Get all-day events for a date */
	getAllDayEventsForDate: (date: ForgeDate) => EventCalendarItem[];
	/** Check if a date is today */
	isToday: (date: ForgeDate) => boolean;
	/** Check if a date is in the currently displayed month */
	isCurrentMonth: (date: ForgeDate) => boolean;
	/** Format an hour number to display string */
	formatHour: (hour: number) => string;
}

function getWeekStart(date: ForgeDate, weekStartsOn: number): ForgeDate {
	const current = date.startOf('day');
	const wd = current.weekday; // 1=Mon, 7=Sun (ISO)
	const diff = (wd - weekStartsOn + 7) % 7;
	return current.minus({ days: diff });
}

function buildMonthGrid(year: number, month: number, weekStartsOn: number): ForgeDate[][] {
	const firstOfMonth = new ForgeDate(new Date(year, month - 1, 1));
	const gridStart = getWeekStart(firstOfMonth, weekStartsOn);

	const weeks: ForgeDate[][] = [];
	let current = gridStart;

	// Always show 6 weeks for consistent height
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

export function useEventCalendar(options: UseEventCalendarOptions): UseEventCalendarReturn {
	const { selectedDate, view, events, weekStartsOn, locale } = options;

	const title = computed(() => {
		const d = selectedDate.value;
		const v = view.value;
		const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' });
		const shortFormatter = new Intl.DateTimeFormat(locale.value, {
			month: 'short',
			day: 'numeric',
		});
		const yearFormatter = new Intl.DateTimeFormat(locale.value, { year: 'numeric' });

		switch (v) {
			case 'day': {
				const dayFormatter = new Intl.DateTimeFormat(locale.value, {
					weekday: 'long',
					month: 'long',
					day: 'numeric',
					year: 'numeric',
				});
				return dayFormatter.format(d.toDate());
			}
			case 'week': {
				const start = getWeekStart(d, weekStartsOn.value);
				const end = start.plus({ days: 6 });
				const startStr = shortFormatter.format(start.toDate());
				const endStr = shortFormatter.format(end.toDate());
				const yr = yearFormatter.format(end.toDate());
				return `${startStr} – ${endStr}, ${yr}`;
			}
			case 'month':
				return formatter.format(d.toDate());
			case 'year':
				return yearFormatter.format(d.toDate());
			default:
				return '';
		}
	});

	const weekDayLabels = computed(() => {
		// 2024-01-01 is a Monday (ISO weekday 1). Offset to get the desired start day.
		const base = new Date(2024, 0, 1 + ((weekStartsOn.value - 1 + 7) % 7));
		const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(base);
			d.setDate(d.getDate() + i);
			return formatter.format(d);
		});
	});

	const hours = computed(() => Array.from({ length: 24 }, (_, i) => i));

	const weekDays = computed(() => {
		const start = getWeekStart(selectedDate.value, weekStartsOn.value);
		return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }));
	});

	const monthGrid = computed(() =>
		buildMonthGrid(selectedDate.value.year, selectedDate.value.month, weekStartsOn.value),
	);

	const yearMonths = computed(() => {
		const year = selectedDate.value.year;
		const monthFormatter = new Intl.DateTimeFormat(locale.value, { month: 'long' });
		return Array.from({ length: 12 }, (_, i) => ({
			month: i + 1,
			label: monthFormatter.format(new Date(year, i, 1)),
			grid: buildMonthGrid(year, i + 1, weekStartsOn.value),
		}));
	});

	function navigatePrev(): ForgeDate {
		const d = selectedDate.value;
		switch (view.value) {
			case 'day':
				return d.minus({ days: 1 });
			case 'week':
			case 'week-horizontal':
				return d.minus({ days: 7 });
			case 'month':
				return d.minus({ months: 1 });
			case 'year':
				return d.minus({ years: 1 });
		}
	}

	function navigateNext(): ForgeDate {
		const d = selectedDate.value;
		switch (view.value) {
			case 'day':
				return d.plus({ days: 1 });
			case 'week':
			case 'week-horizontal':
				return d.plus({ days: 7 });
			case 'month':
				return d.plus({ months: 1 });
			case 'year':
				return d.plus({ years: 1 });
		}
	}

	function navigateToday(): ForgeDate {
		return ForgeDate.now();
	}

	function getEventsForDate(date: ForgeDate): EventCalendarItem[] {
		return events.value.filter((e) => {
			const eventStart = e.start.startOf('day');
			const eventEnd = e.end.startOf('day');
			const target = date.startOf('day');
			return (
				target.isSame(eventStart, 'day') ||
				target.isSame(eventEnd, 'day') ||
				target.isBetween(eventStart, eventEnd)
			);
		});
	}

	function getTimedEventsForDate(date: ForgeDate): EventCalendarItem[] {
		return getEventsForDate(date).filter((e) => !e.allDay);
	}

	function getAllDayEventsForDate(date: ForgeDate): EventCalendarItem[] {
		return getEventsForDate(date).filter((e) => e.allDay);
	}

	function isToday(date: ForgeDate): boolean {
		return date.isSame(ForgeDate.now(), 'day');
	}

	function isCurrentMonth(date: ForgeDate): boolean {
		return date.month === selectedDate.value.month && date.year === selectedDate.value.year;
	}

	function formatHour(hour: number): string {
		const d = new Date();
		d.setHours(hour, 0, 0, 0);
		return new Intl.DateTimeFormat(locale.value, {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		}).format(d);
	}

	return {
		title,
		weekDayLabels,
		hours,
		weekDays,
		monthGrid,
		yearMonths,
		navigatePrev,
		navigateNext,
		navigateToday,
		getEventsForDate,
		getTimedEventsForDate,
		getAllDayEventsForDate,
		isToday,
		isCurrentMonth,
		formatHour,
	};
}
