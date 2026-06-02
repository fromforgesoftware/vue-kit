import { cva, type VariantProps } from 'class-variance-authority';

/** Wrapper for the trigger button. */
export const colorPickerRootVariants = cva('inline-flex');

/** Trigger button. `before:` expansion keeps the hit-area ≥ 24×24 at every size (WCAG SC 2.5.8). */
export const colorPickerTriggerVariants = cva(
	[
		'relative inline-flex cursor-pointer items-center justify-center rounded-md border border-input shadow-xs',
		'transition-[color,box-shadow] outline-none',
		'hover:opacity-90',
		'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:cursor-not-allowed disabled:opacity-50',
		"before:content-[''] before:absolute before:inset-0 before:-m-0.5",
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 w-12',
				default: 'h-8 w-16',
				lg: 'h-10 w-20',
			},
			// Square trigger renders just a colour preview tile (no extra label area).
			shape: {
				default: '',
				square: '',
			},
		},
		compoundVariants: [
			{ shape: 'square', size: 'sm', class: 'w-7' },
			{ shape: 'square', size: 'default', class: 'w-8' },
			{ shape: 'square', size: 'lg', class: 'w-10' },
		],
		defaultVariants: {
			size: 'default',
			shape: 'default',
		},
	},
);

/** Popover/Dialog content — holds the area + slider + field stack. */
export const colorPickerContentVariants = cva('flex flex-col gap-3', {
	variants: {
		width: {
			compact: 'w-64',
			expanded: 'w-72',
		},
	},
	defaultVariants: { width: 'compact' },
});

/** Row containing the eyedropper, swatch, and hue/alpha slider stack. */
export const colorPickerSliderRowVariants = cva('flex items-center gap-2');

/** Stack of hue + alpha sliders inside the slider row. */
export const colorPickerSlidersStackVariants = cva('flex flex-1 flex-col gap-2');

export type ColorPickerChannelsMode = 'hex' | 'all' | false;

export type ColorPickerVariants = VariantProps<typeof colorPickerTriggerVariants>;
export type ColorPickerSize = NonNullable<ColorPickerVariants['size']>;
export type ColorPickerShape = NonNullable<ColorPickerVariants['shape']>;
