import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick } from 'vue';
import {
	formatCurrency,
	formatDate,
	formatDateTime,
	formatNumber,
	formatPercent,
	formatRelative,
	useRelativeTime,
} from './format.js';

describe('formatCurrency', () => {
	it('formats with the requested currency + locale', () => {
		expect(formatCurrency(1234.5, 'EUR', 'de-DE')).toMatch(/1\.234,50/);
		expect(formatCurrency(1234.5, 'USD', 'en-US')).toMatch(/\$1,234\.50/);
	});
});

describe('formatNumber + formatPercent', () => {
	it('respects locale formatting', () => {
		expect(formatNumber(1234567, { maximumFractionDigits: 0 }, 'en-US')).toBe('1,234,567');
		expect(formatPercent(0.235, { maximumFractionDigits: 1 }, 'en-US')).toMatch(/23\.5%/);
	});
});

describe('formatDate + formatDateTime', () => {
	it('formats a date in the requested locale', () => {
		const d = new Date('2026-05-23T10:30:00Z');
		expect(formatDate(d, { dateStyle: 'medium' }, 'en-US')).toMatch(/May 23, 2026/);
		const out = formatDateTime(d, { dateStyle: 'short', timeStyle: 'short' }, 'en-US');
		expect(out).toMatch(/5\/23\/26/);
	});

	it('accepts an ISO string + a number', () => {
		expect(formatDate('2026-05-23T00:00:00Z', { dateStyle: 'medium' }, 'en-US')).toContain('May');
		expect(formatDate(0, { dateStyle: 'medium' }, 'en-US')).toContain('1970');
	});
});

describe('formatRelative', () => {
	const now = new Date('2026-05-23T12:00:00Z').getTime();

	it('renders past + future intervals across unit boundaries', () => {
		expect(formatRelative(now - 30_000, now, 'en-US')).toMatch(/seconds? ago|now/);
		expect(formatRelative(now - 5 * 60_000, now, 'en-US')).toMatch(/5 minutes ago/);
		expect(formatRelative(now + 3 * 60 * 60_000, now, 'en-US')).toMatch(/in 3 hours/);
		expect(formatRelative(now - 2 * 24 * 60 * 60_000, now, 'en-US')).toMatch(/2 days ago/);
		expect(formatRelative(now - 30 * 24 * 60 * 60_000, now, 'en-US')).toMatch(/month/);
	});
});

describe('useRelativeTime', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('retunes its output as the timer fires', async () => {
		vi.setSystemTime(new Date('2026-05-23T12:00:00Z'));
		const scope = effectScope();
		const past = new Date('2026-05-23T11:55:00Z');

		const relative = scope.run(() => useRelativeTime(past, { intervalMs: 60_000 }))!;
		expect(relative.value).toMatch(/5 minutes ago/);

		vi.setSystemTime(new Date('2026-05-23T12:10:00Z'));
		// Make the interval fire so the computed retunes against the new "now".
		vi.advanceTimersByTime(60_000);
		await nextTick();

		// 15 min original gap + 1 min advance during interval tick = 16 minutes
		expect(relative.value).toMatch(/16 minutes ago/);
		scope.stop();
	});

	it('returns empty string for null/undefined sources', () => {
		const scope = effectScope();
		const r = scope.run(() => useRelativeTime(null))!;
		expect(r.value).toBe('');
		scope.stop();
	});

	it('stops the interval when its scope ends', () => {
		const spy = vi.spyOn(globalThis, 'clearInterval');
		const scope = effectScope();
		scope.run(() => useRelativeTime(new Date()))!;
		scope.stop();
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});
