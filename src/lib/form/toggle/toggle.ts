import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Two-state press button. Painted square IS the hit area — no expansion ring
 * needed because Toggle is meaningful on its own (unlike Checkbox, which pairs
 * with a Label that owns the click). All sizes meet WCAG SC 2.5.8 (≥ 24×24).
 * Heights track the form ramp so toolbars line up: sm 28px, default 32px, lg 40px.
 */
export const toggleVariants = cva(
	[
		'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md font-medium',
		'text-sm leading-tight whitespace-nowrap',
		'transition-[color,background-color,border-color,box-shadow] outline-none',
		'hover:bg-accent/60 hover:text-accent-foreground',
		'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'disabled:pointer-events-none disabled:opacity-50',
		'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	].join(' '),
	{
		variants: {
			variant: {
				default: 'bg-transparent text-foreground',
				outline:
					'border border-input bg-transparent text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary',
			},
			size: {
				// 28 px — matches Input `sm`. Min-width keeps icon-only toggles ≥ 28×28.
				sm: 'h-7 min-w-7 px-2 text-sm',
				// 32 px — matches Input `default`.
				default: 'h-8 min-w-8 px-3 text-sm',
				// 40 px — matches Input `lg`.
				lg: 'h-10 min-w-10 px-4 text-sm',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
export type ToggleVariant = NonNullable<ToggleVariants['variant']>;
export type ToggleSize = NonNullable<ToggleVariants['size']>;
