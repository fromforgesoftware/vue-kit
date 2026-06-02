import { describe, it, expect, beforeEach } from 'vitest';
import { generateHourTicks, segmentVariantClasses } from './time-range-bar';
import type { SegmentVariant } from './time-range-bar';
import { ForgeTime, setHourCycleProvider } from '@fromforgesoftware/ts-kit/date';

// ── ForgeTime.formatTimeOfDay (24h — default) ─────────────────────────────

describe('ForgeTime.formatTimeOfDay (24h)', () => {
	beforeEach(() => setHourCycleProvider(() => 24));

	it('formats midnight as 00:00', () => {
		expect(ForgeTime.formatTimeOfDay(0)).toBe('00:00');
	});

	it('formats 9am as 09:00', () => {
		expect(ForgeTime.formatTimeOfDay(32400)).toBe('09:00');
	});

	it('formats 17:30', () => {
		expect(ForgeTime.formatTimeOfDay(63000)).toBe('17:30');
	});

	it('formats 23:59', () => {
		expect(ForgeTime.formatTimeOfDay(86340)).toBe('23:59');
	});

	it('pads single-digit hours and minutes', () => {
		expect(ForgeTime.formatTimeOfDay(3660)).toBe('01:01');
	});

	it('wraps exactly 24:00 (86400s) to 00:00', () => {
		expect(ForgeTime.formatTimeOfDay(86400)).toBe('00:00');
	});

	it('wraps overnight end times past 24h (e.g. 22:00 + 8h)', () => {
		// 22:00 + 8h = 30:00 → should display as 06:00
		expect(ForgeTime.formatTimeOfDay(108000)).toBe('06:00');
	});
});

// ── ForgeTime.formatTimeOfDay (12h) ───────────────────────────────────────

describe('ForgeTime.formatTimeOfDay (12h)', () => {
	beforeEach(() => setHourCycleProvider(() => 12));

	it('formats midnight as 12:00 AM', () => {
		expect(ForgeTime.formatTimeOfDay(0)).toBe('12:00 AM');
	});

	it('formats 9am as 9:00 AM', () => {
		expect(ForgeTime.formatTimeOfDay(32400)).toBe('9:00 AM');
	});

	it('formats 17:30 as 5:30 PM', () => {
		expect(ForgeTime.formatTimeOfDay(63000)).toBe('5:30 PM');
	});

	it('formats noon as 12:00 PM', () => {
		expect(ForgeTime.formatTimeOfDay(43200)).toBe('12:00 PM');
	});
});

// ── ForgeTime.formatTimeRange ─────────────────────────────────────────────

describe('ForgeTime.formatTimeRange', () => {
	beforeEach(() => setHourCycleProvider(() => 24));

	it('formats a shift range', () => {
		expect(ForgeTime.formatTimeRange('09:00', 28800)).toBe('09:00 – 17:00');
	});

	it('returns empty for empty time', () => {
		expect(ForgeTime.formatTimeRange('', 3600)).toBe('');
	});
});

describe('ForgeTime.formatTimeRange (12h)', () => {
	beforeEach(() => setHourCycleProvider(() => 12));

	it('formats a shift range in 12h mode', () => {
		expect(ForgeTime.formatTimeRange('09:00', 28800)).toBe('9:00 AM – 5:00 PM');
	});
});

// ── generateHourTicks ──────────────────────────────────────────────────────

describe('generateHourTicks', () => {
	beforeEach(() => setHourCycleProvider(() => 24));

	it('generates ticks for an 8h shift starting at 09:00', () => {
		const ticks = generateHourTicks(32400, 28800); // 09:00, 8h
		expect(ticks.length).toBeGreaterThan(0);
		expect(ticks.length).toBeLessThanOrEqual(9);
		// First tick should be at an hour boundary
		expect(ticks[0].label).toMatch(/^\d{2}:\d{2}$/);
		// All percents should be between 0 and 100
		for (const tick of ticks) {
			expect(tick.percent).toBeGreaterThanOrEqual(0);
			expect(tick.percent).toBeLessThanOrEqual(100);
		}
	});

	it('generates 1h step ticks for short durations (4h)', () => {
		const ticks = generateHourTicks(32400, 14400); // 09:00, 4h
		// With 4h and 1h step, expect ~4-5 ticks
		expect(ticks.length).toBeGreaterThanOrEqual(3);
		expect(ticks.length).toBeLessThanOrEqual(5);
	});

	it('uses larger steps for long durations (24h)', () => {
		const ticks = generateHourTicks(0, 86400); // 00:00, 24h
		// Should auto-pick 3h or 4h step to stay under ~8 ticks
		expect(ticks.length).toBeLessThanOrEqual(9);
	});

	it('returns empty for zero duration', () => {
		const ticks = generateHourTicks(0, 0);
		expect(ticks).toEqual([]);
	});

	it('places ticks at correct percentages', () => {
		// 09:00 start, 4h duration → 10:00 is 25%, 11:00 is 50%, 12:00 is 75%, 13:00 is 100%
		const ticks = generateHourTicks(32400, 14400);
		const tick10 = ticks.find((t) => t.label === '10:00');
		expect(tick10).toBeDefined();
		expect(tick10!.percent).toBeCloseTo(25, 0);

		const tick12 = ticks.find((t) => t.label === '12:00');
		expect(tick12).toBeDefined();
		expect(tick12!.percent).toBeCloseTo(75, 0);
	});
});

// ── segmentVariantClasses ──────────────────────────────────────────────────

describe('segmentVariantClasses', () => {
	const variants: SegmentVariant[] = ['green', 'purple', 'blue', 'amber', 'red', 'gray'];

	it('defines all six variants', () => {
		for (const v of variants) {
			expect(segmentVariantClasses[v]).toBeDefined();
		}
	});

	it('each variant has bg, text, and border classes', () => {
		for (const v of variants) {
			const classes = segmentVariantClasses[v];
			expect(classes.bg).toMatch(/^bg-/);
			expect(classes.text).toMatch(/^text-/);
			expect(classes.border).toMatch(/^border-/);
		}
	});
});
