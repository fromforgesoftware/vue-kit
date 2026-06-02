import { cva, type VariantProps } from 'class-variance-authority';
import { getWeekStart } from '@fromforgesoftware/ts-kit';

/** Wrapper for the row of weekday toggle chips. */
export const weekdaysPickerVariants = cva('flex flex-wrap', {
	variants: {
		size: {
			sm: 'gap-1',
			default: 'gap-1.5',
			lg: 'gap-2',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

/** Day toggle chip. Painted square is the hit area; all sizes meet WCAG SC 2.5.8 (≥ 24×24). */
export const weekdayButtonVariants = cva(
	[
		'inline-flex items-center justify-center rounded-full font-medium uppercase select-none',
		'transition-[color,background-color,border-color,box-shadow]',
		'outline-none',
		'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-7 text-2xs',
				default: 'size-9 text-xs',
				lg: 'size-11 text-sm',
			},
			variant: {
				default: '',
				outline: 'border border-input',
			},
			selected: {
				true: '',
				false: '',
			},
			error: {
				true: '',
				false: '',
			},
		},
		compoundVariants: [
			{
				variant: 'default',
				selected: true,
				class: 'bg-primary text-primary-foreground hover:bg-primary/90',
			},
			{
				variant: 'default',
				selected: false,
				class:
					'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
			},
			{
				variant: 'outline',
				selected: true,
				class: 'bg-primary text-primary-foreground border-primary hover:bg-primary/90',
			},
			{
				variant: 'outline',
				selected: false,
				class:
					'bg-background text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
			},
			// Selected + error keeps the primary fill so users still see the selection;
			// only the focus ring shifts to destructive.
			{
				error: true,
				selected: false,
				class: 'border border-destructive text-destructive',
			},
			{
				error: true,
				class: 'focus-visible:ring-destructive/40',
			},
		],
		defaultVariants: {
			size: 'default',
			variant: 'default',
			selected: false,
			error: false,
		},
	},
);

export type WeekdaysPickerVariants = VariantProps<typeof weekdaysPickerVariants>;
export type WeekdayButtonVariants = VariantProps<typeof weekdayButtonVariants>;
export type WeekdaysPickerSize = NonNullable<WeekdaysPickerVariants['size']>;
export type WeekdaysPickerVariant = NonNullable<WeekdayButtonVariants['variant']>;

/** Day value following JS Date convention: 0=Sunday, 1=Monday, ..., 6=Saturday */
export type WeekdayValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface WeekdayItem {
	/** Single-letter abbreviation */
	label: string;
	/** Full day name for accessibility */
	fullName: string;
	/** JS Date day-of-week value (0=Sunday, 1=Monday, ..., 6=Saturday) */
	value: WeekdayValue;
}

/** All weekdays in fixed Monday-first order (used as the source for rotation) */
const ALL_WEEKDAYS: WeekdayItem[] = [
	{ label: 'M', fullName: 'Monday', value: 1 },
	{ label: 'T', fullName: 'Tuesday', value: 2 },
	{ label: 'W', fullName: 'Wednesday', value: 3 },
	{ label: 'T', fullName: 'Thursday', value: 4 },
	{ label: 'F', fullName: 'Friday', value: 5 },
	{ label: 'S', fullName: 'Saturday', value: 6 },
	{ label: 'S', fullName: 'Sunday', value: 0 },
];

/**
 * Returns weekdays rotated to start on the user's preferred week-start day.
 * `@fromforgesoftware/ts-kit` exposes ISO week (1 Mon - 7 Sun); JS Date and our DOM API
 * use 0 Sun - 6 Sat. Map 7 → 0 here so callers don't have to think about it.
 */
export function getOrderedWeekdays(): WeekdayItem[] {
	const isoStart = getWeekStart();
	const jsStart: WeekdayValue = (isoStart === 7 ? 0 : isoStart) as WeekdayValue;
	const startIndex = ALL_WEEKDAYS.findIndex((d) => d.value === jsStart);
	if (startIndex <= 0) return ALL_WEEKDAYS;
	return [...ALL_WEEKDAYS.slice(startIndex), ...ALL_WEEKDAYS.slice(0, startIndex)];
}

/** @deprecated Use getOrderedWeekdays() which respects the week start preference */
export const DEFAULT_WEEKDAYS: WeekdayItem[] = ALL_WEEKDAYS;
