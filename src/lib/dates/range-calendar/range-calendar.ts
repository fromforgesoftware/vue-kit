import { cva, type VariantProps } from 'class-variance-authority';

/** Root wrapper for {@link RangeCalendar}. Size scales header, cell, and select density together. */
export const rangeCalendarRootVariants = cva(
	'w-fit overflow-hidden rounded-xl border border-border bg-background shadow-sm text-foreground',
	{
		variants: {
			size: {
				sm: '',
				default: '',
				lg: '',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

// Padding for the calendar block inside the root (presets sit alongside).
export const rangeCalendarPanelVariants = cva('', {
	variants: {
		size: {
			sm: 'p-3',
			default: 'p-4',
			lg: 'p-5',
		},
	},
	defaultVariants: { size: 'default' },
});

export const rangeCalendarHeaderVariants = cva('flex items-center justify-between');

export const rangeCalendarHeadingVariants = cva('font-medium text-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

export const rangeCalendarSelectVariants = cva(
	[
		'appearance-none rounded-md border-none bg-transparent font-medium text-foreground outline-none cursor-pointer',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:cursor-not-allowed disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'px-1 py-0.5 text-xs',
				default: 'px-1 py-0.5 text-sm',
				lg: 'px-1.5 py-1 text-base',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const rangeCalendarNavButtonVariants = cva(
	[
		'inline-flex cursor-pointer items-center justify-center rounded-md',
		'bg-transparent text-muted-foreground',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-6',
				default: 'size-7',
				lg: 'size-8',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const rangeCalendarGridVariants = cva('w-full border-collapse select-none space-y-1');

export const rangeCalendarGridRowVariants = cva('mb-1 grid w-full grid-cols-7');

export const rangeCalendarHeadCellVariants = cva('rounded-md text-muted-foreground', {
	variants: {
		size: {
			sm: 'text-2xs',
			default: 'text-xs',
			lg: 'text-sm',
		},
	},
	defaultVariants: { size: 'default' },
});

export const rangeCalendarCellVariants = cva('relative text-center', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

// Range trigger uses square hit area + visual range visualisation:
// `selected` → in-range tint, `selection-start` / `selection-end` → bookend tint.
export const rangeCalendarCellTriggerVariants = cva(
	[
		'relative flex items-center justify-center rounded-md',
		'whitespace-nowrap font-normal outline-none transition-colors',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'data-[selected]:bg-accent data-[selected]:rounded-none',
		'data-[highlighted]:bg-accent data-[highlighted]:rounded-none',
		'data-[selection-start]:!bg-primary data-[selection-start]:text-primary-foreground data-[selection-start]:hover:bg-primary/90 data-[selection-start]:!rounded-md',
		'data-[selection-end]:!bg-primary data-[selection-end]:text-primary-foreground data-[selection-end]:hover:bg-primary/90 data-[selection-end]:!rounded-md',
		'data-[outside-view]:text-muted-foreground',
		'data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground data-[unavailable]:line-through',
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
		'before:absolute before:bottom-1 before:hidden before:size-1 before:rounded-full before:bg-primary',
		'data-[today]:before:block data-[selection-start]:before:bg-primary-foreground data-[selection-end]:before:bg-primary-foreground',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-7 text-xs',
				default: 'size-8 text-sm',
				lg: 'size-9 text-base',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export type RangeCalendarVariants = VariantProps<typeof rangeCalendarRootVariants>;
export type RangeCalendarSize = NonNullable<RangeCalendarVariants['size']>;
