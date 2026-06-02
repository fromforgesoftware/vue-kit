import { cva, type VariantProps } from 'class-variance-authority';

/** Root wrapper — supports horizontal and vertical orientation. */
export const colorSliderRootVariants = cva(
	'relative flex touch-none select-none items-center data-[disabled]:opacity-50',
	{
		variants: {
			orientation: {
				horizontal: 'w-full flex-row',
				vertical: 'h-full min-h-44 w-auto flex-col',
			},
			size: {
				sm: '',
				default: '',
			},
		},
		defaultVariants: {
			orientation: 'horizontal',
			size: 'default',
		},
	},
);

/** Slider track — gradient is painted by Reka via inline style; we control the rounded geometry. */
export const colorSliderTrackVariants = cva('relative my-1 grow overflow-hidden rounded-full', {
	variants: {
		orientation: {
			horizontal: 'w-full',
			vertical: 'h-full',
		},
		size: {
			sm: '',
			default: '',
		},
	},
	compoundVariants: [
		{ orientation: 'horizontal', size: 'sm', class: 'h-2' },
		{ orientation: 'horizontal', size: 'default', class: 'h-3' },
		{ orientation: 'vertical', size: 'sm', class: 'w-2' },
		{ orientation: 'vertical', size: 'default', class: 'w-3' },
	],
	defaultVariants: {
		orientation: 'horizontal',
		size: 'default',
	},
});

/**
 * Thumb knob. `::before` expands the pointer hit-target to ≥ 24×24 (WCAG SC 2.5.8)
 * without changing the visible size. White border keeps it visible on any gradient.
 */
export const colorSliderThumbVariants = cva(
	[
		'relative block shrink-0 rounded-full border-2 border-white bg-white/0 shadow-md',
		'transition-[box-shadow] outline-none cursor-pointer',
		'hover:ring-4 hover:ring-ring/30',
		'focus-visible:ring-4 focus-visible:ring-ring/40',
		'disabled:pointer-events-none disabled:opacity-50',
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

export type ColorSliderVariants = VariantProps<typeof colorSliderRootVariants>;
export type ColorSliderOrientation = NonNullable<ColorSliderVariants['orientation']>;
export type ColorSliderSize = NonNullable<ColorSliderVariants['size']>;
