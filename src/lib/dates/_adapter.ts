/**
 * Internal adapter between ForgeDate (@fromforgesoftware/ts-kit) and Reka UI date types
 * (@internationalized/date). Not exported to consumers.
 */
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import { CalendarDate, CalendarDateTime, Time, type DateValue } from '@internationalized/date';

// ── ForgeDate → Reka UI ──────────────────────────────────────────────

export function hiveDateToCalendarDate(d: ForgeDate): CalendarDate {
	return new CalendarDate(d.year, d.month, d.day);
}

export function hiveDateToCalendarDateTime(d: ForgeDate): CalendarDateTime {
	return new CalendarDateTime(d.year, d.month, d.day, d.hour, d.minute, d.second);
}

export function hiveDateToTime(d: ForgeDate): Time {
	return new Time(d.hour, d.minute, d.second);
}

export function hiveDateRangeToRekaRange(range: { start: ForgeDate; end: ForgeDate }) {
	return {
		start: hiveDateToCalendarDate(range.start),
		end: hiveDateToCalendarDate(range.end),
	};
}

// ── Reka UI → ForgeDate ──────────────────────────────────────────────

// Reka emits one of three shapes from @internationalized/date:
//   - `CalendarDate`     — year/month/day only
//   - `CalendarDateTime` — year/month/day + hour/minute/second
//   - `Time`             — hour/minute/second only (TimeField, TimeRangeField)
//
// `Time` doesn't have year/month/day. We can't tell `Time` from
// `CalendarDateTime` by `'hour' in d` alone — both have `hour`. Use the
// presence of `year` to distinguish: `Time` has `undefined` year, `Calendar*`
// types always have a numeric year. Without this disambiguation, a `Time`
// value would call `setFullYear(undefined, -1, undefined)` and produce an
// invalid Date — exactly what was breaking TimeRangeField updates.
export function calendarDateToForgeDate(d: DateValue): ForgeDate {
	const hasDate = typeof (d as { year?: number }).year === 'number';

	if (!hasDate && 'hour' in d) {
		// Pure Time — anchor the time to today's date so the resulting JS Date
		// is valid. Consumers that care about the date part of a time-only
		// input should never use ForgeDate-as-date for it.
		const t = d as unknown as Time;
		const today = new Date();
		const date = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			t.hour,
			t.minute,
			t.second,
			0,
		);
		return new ForgeDate(date);
	}

	if ('hour' in d) {
		const dt = d as CalendarDateTime;
		const date = new Date(0);
		date.setFullYear(dt.year, dt.month - 1, dt.day);
		date.setHours(dt.hour, dt.minute, dt.second, 0);
		return new ForgeDate(date);
	}

	const date = new Date(0);
	date.setFullYear(d.year, d.month - 1, d.day);
	date.setHours(0, 0, 0, 0);
	return new ForgeDate(date);
}

export function timeToForgeDate(t: Time, base?: ForgeDate): ForgeDate {
	const b = base ?? ForgeDate.now();
	return new ForgeDate(new Date(b.year, b.month - 1, b.day, t.hour, t.minute, t.second));
}

export function rekaRangeToForgeDateRange(range: { start?: DateValue; end?: DateValue }) {
	if (!range.start || !range.end) return null;
	return {
		start: calendarDateToForgeDate(range.start),
		end: calendarDateToForgeDate(range.end),
	};
}

// Null-safe wrappers for optional v-model values.

export function toRekaDate(d: ForgeDate | null | undefined): CalendarDate | undefined {
	return d ? hiveDateToCalendarDate(d) : undefined;
}

export function toRekaDateTime(d: ForgeDate | null | undefined): CalendarDateTime | undefined {
	return d ? hiveDateToCalendarDateTime(d) : undefined;
}

export function toRekaTime(d: ForgeDate | null | undefined): Time | undefined {
	return d ? hiveDateToTime(d) : undefined;
}

export function toRekaRange(r: { start: ForgeDate; end: ForgeDate } | null | undefined) {
	return r ? hiveDateRangeToRekaRange(r) : undefined;
}
