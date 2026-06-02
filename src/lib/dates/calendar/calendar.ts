import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Root wrapper for {@link Calendar}. Sized variants control header, day-cell
 * trigger, and select density together so the whole component scales as a unit.
 */
export const calendarRootVariants = cva(
	'w-fit rounded-xl border border-border bg-background p-4 shadow-sm text-foreground',
	{
		variants: {
			size: {
				sm: 'p-3',
				default: 'p-4',
				lg: 'p-5',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const calendarHeaderVariants = cva('flex items-center justify-between');

export const calendarHeadingVariants = cva('font-medium text-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

// Hit area governed by the surrounding nav-button row (≥ 28px tall);
// the <select> stays unstyled so it blends into the header.
export const calendarSelectVariants = cva(
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

// Sizes meet WCAG 2.5.8 (≥24×24) at every variant.
export const calendarNavButtonVariants = cva(
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

export const calendarGridVariants = cva('border-collapse select-none space-y-1');

export const calendarGridRowVariants = cva('grid grid-cols-7');

export const calendarHeadCellVariants = cva('rounded-md text-center text-muted-foreground', {
	variants: {
		size: {
			sm: 'w-7 text-2xs',
			default: 'w-8 text-xs',
			lg: 'w-9 text-sm',
		},
	},
	defaultVariants: { size: 'default' },
});

export const calendarCellVariants = cva('relative text-center', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

/** Day-cell button. Each size meets WCAG SC 2.5.8 (≥ 24×24). */
export const calendarCellTriggerVariants = cva(
	[
		'relative flex items-center justify-center rounded-md',
		'whitespace-nowrap font-normal outline-none transition-colors',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary/90',
		'data-[outside-view]:text-muted-foreground',
		'data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground data-[unavailable]:line-through',
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
		'data-[highlighted]:bg-accent',
		'before:absolute before:bottom-1 before:hidden before:size-1 before:rounded-full before:bg-primary',
		'data-[today]:before:block data-[selected]:before:bg-primary-foreground',
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

export type CalendarVariants = VariantProps<typeof calendarRootVariants>;
export type CalendarSize = NonNullable<CalendarVariants['size']>;
