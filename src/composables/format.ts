import {
	computed,
	onScopeDispose,
	ref,
	type ComputedRef,
	type MaybeRefOrGetter,
	toValue,
} from 'vue';

export function formatCurrency(
	amount: number,
	currency: string,
	locale: string = navigatorLocale(),
	options: Omit<Intl.NumberFormatOptions, 'style' | 'currency'> = {},
): string {
	return new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(amount);
}

export function formatNumber(
	value: number,
	options: Intl.NumberFormatOptions = {},
	locale: string = navigatorLocale(),
): string {
	return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(
	value: number,
	options: Intl.NumberFormatOptions = {},
	locale: string = navigatorLocale(),
): string {
	return new Intl.NumberFormat(locale, { style: 'percent', ...options }).format(value);
}

export function formatDate(
	date: Date | string | number,
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
	locale: string = navigatorLocale(),
): string {
	return new Intl.DateTimeFormat(locale, options).format(toDate(date));
}

export function formatDateTime(
	date: Date | string | number,
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
	locale: string = navigatorLocale(),
): string {
	return new Intl.DateTimeFormat(locale, options).format(toDate(date));
}

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
	{ unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
	{ unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
	{ unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
	{ unit: 'day', ms: 24 * 60 * 60 * 1000 },
	{ unit: 'hour', ms: 60 * 60 * 1000 },
	{ unit: 'minute', ms: 60 * 1000 },
	{ unit: 'second', ms: 1000 },
];

export function formatRelative(
	date: Date | string | number,
	now: Date | number = Date.now(),
	locale: string = navigatorLocale(),
): string {
	const target = toDate(date).getTime();
	const reference = typeof now === 'number' ? now : now.getTime();
	const diff = target - reference;
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	for (const { unit, ms } of RELATIVE_UNITS) {
		if (Math.abs(diff) >= ms || unit === 'second') {
			const value = Math.round(diff / ms);
			return rtf.format(value, unit);
		}
	}
	return rtf.format(0, 'second');
}

export interface UseRelativeTimeOptions {
	locale?: string;
	/** Polling interval in ms. Default 60s. */
	intervalMs?: number;
}

/**
 * Reactive relative-time string ("3 minutes ago") that retunes on a timer
 * so the UI stays current without the consumer re-rendering.
 */
export function useRelativeTime(
	source: MaybeRefOrGetter<Date | string | number | null | undefined>,
	opts: UseRelativeTimeOptions = {},
): ComputedRef<string> {
	const intervalMs = opts.intervalMs ?? 60_000;
	const tick = ref(Date.now());
	const id = setInterval(() => {
		tick.value = Date.now();
	}, intervalMs);
	onScopeDispose(() => clearInterval(id));
	return computed(() => {
		const value = toValue(source);
		if (value === null || value === undefined) return '';
		// Touch tick to make this computed reactive to the timer.
		void tick.value;
		return formatRelative(value, tick.value, opts.locale);
	});
}

function navigatorLocale(): string {
	if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
	return 'en-US';
}

function toDate(date: Date | string | number): Date {
	return date instanceof Date ? date : new Date(date);
}
