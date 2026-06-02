import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Painted checkbox square. `::before` expands the hit-area to ≥ 24×24 (WCAG SC
 * 2.5.8) without inflating the visual size. Indeterminate shares the same
 * colour treatment as checked.
 */
export const checkboxVariants = cva(
	[
		'peer relative inline-flex shrink-0 items-center justify-center',
		'rounded border border-input bg-background',
		'transition-[background-color,border-color,box-shadow] outline-none',
		'cursor-pointer',
		'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
		'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
		// Click hit-area expansion to ≥ 24×24 — purely interactive, not visual.
		"before:content-[''] before:absolute before:inset-0 before:-m-1",
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-3.5',
				default: 'size-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

/** Tick or dash icon inside the painted square. */
export const checkboxIndicatorVariants = cva(
	'grid place-content-center text-current pointer-events-none',
	{
		variants: {
			size: {
				sm: '[&_svg]:size-2.5',
				default: '[&_svg]:size-3',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
export type CheckboxSize = NonNullable<CheckboxVariants['size']>;
