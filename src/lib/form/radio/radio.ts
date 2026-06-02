import { cva, type VariantProps } from 'class-variance-authority';

/** RadioGroup container — arranges items vertically or horizontally with a consistent gap. */
export const radioGroupVariants = cva('flex', {
	variants: {
		orientation: {
			horizontal: 'flex-row gap-4',
			vertical: 'flex-col gap-3',
		},
	},
	defaultVariants: {
		orientation: 'vertical',
	},
});

/**
 * Painted radio circle. `::before` expands the click target to ≥ 24×24 (WCAG SC
 * 2.5.8) without inflating the visual size — visible circle stays compact for
 * dense forms.
 */
export const radioItemVariants = cva(
	[
		'peer relative inline-flex shrink-0 items-center justify-center',
		'rounded-full border border-input bg-background shadow-xs',
		'transition-[color,border-color,box-shadow] outline-none',
		'cursor-pointer',
		'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
		'data-[state=checked]:border-primary data-[state=checked]:text-primary',
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

/** Inner dot painted when `data-state="checked"`; sized relative to the painted circle. */
export const radioIndicatorVariants = cva(
	'flex items-center justify-center text-current pointer-events-none',
	{
		variants: {
			size: {
				sm: '[&_svg]:size-2',
				default: '[&_svg]:size-2.5',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type RadioGroupVariants = VariantProps<typeof radioGroupVariants>;
export type RadioItemVariants = VariantProps<typeof radioItemVariants>;
export type RadioOrientation = NonNullable<RadioGroupVariants['orientation']>;
export type RadioSize = NonNullable<RadioItemVariants['size']>;
