import { cva, type VariantProps } from 'class-variance-authority';

/** Picker layout. `flow` wraps; `grid` lays out a 6-column matrix. */
export const colorSwatchPickerRootVariants = cva('inline-flex flex-wrap gap-2', {
	variants: {
		layout: {
			flow: 'flex-wrap',
			grid: 'grid grid-cols-6',
		},
	},
	defaultVariants: {
		layout: 'flow',
	},
});

/** Picker item — sized to meet WCAG SC 2.5.8 (≥24×24) at every size. */
export const colorSwatchPickerItemVariants = cva(
	[
		'relative inline-flex shrink-0 items-center justify-center rounded-md outline-none cursor-pointer',
		'transition-shadow',
		'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-7',
				default: 'size-9',
				lg: 'size-11',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

/** Visible swatch chip inside each item. Inset ring keeps near-white swatches legible. */
export const colorSwatchPickerItemSwatchVariants = cva(
	'block size-full rounded-md ring-1 ring-inset ring-foreground/15',
);

/** Selection check-mark overlay shown on the active swatch. */
export const colorSwatchPickerItemIndicatorVariants = cva(
	[
		'absolute inset-0 flex items-center justify-center text-white',
		'drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]',
	].join(' '),
);

export type ColorSwatchPickerVariants = VariantProps<typeof colorSwatchPickerRootVariants>;
export type ColorSwatchPickerLayout = NonNullable<ColorSwatchPickerVariants['layout']>;
export type ColorSwatchPickerItemVariants = VariantProps<typeof colorSwatchPickerItemVariants>;
export type ColorSwatchPickerSize = NonNullable<ColorSwatchPickerItemVariants['size']>;
