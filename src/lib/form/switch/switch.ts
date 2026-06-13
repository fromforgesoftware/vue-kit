import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Painted toggle track. `::before` expands the click target to ≥ 24×24 (WCAG SC
 * 2.5.8) without inflating the visual size — `default` paints a 20px track,
 * `sm` paints 16px, both inside a 24×24 hit area.
 */
export const switchVariants = cva(
	[
		'peer relative inline-flex shrink-0 items-center rounded-full',
		'border-2 border-transparent shadow-xs',
		'transition-[background-color,box-shadow] outline-none',
		'cursor-pointer',
		'focus-visible:ring-[3px] focus-visible:ring-ring/50',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
		'aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20',
		// Click hit-area expansion to ≥ 24×24 — purely interactive, not visual.
		"before:content-[''] before:absolute before:inset-0 before:-m-1",
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-4 w-7',
				default: 'h-5 w-9',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

/**
 * Round knob inside the track. `translate-x-*` distance must match the track
 * width minus thumb size minus border so the thumb sits flush at both ends.
 */
export const switchThumbVariants = cva(
	[
		'pointer-events-none block rounded-full bg-background shadow-xs',
		'ring-0 transition-transform',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0 data-[state=checked]:rtl:-translate-x-3',
				default:
					'size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 data-[state=checked]:rtl:-translate-x-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type SwitchVariants = VariantProps<typeof switchVariants>;
export type SwitchSize = NonNullable<SwitchVariants['size']>;
