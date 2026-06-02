import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Display-only colour chip. Inset ring keeps near-white swatches legible
 * against the page surface; for alpha < 1, consumers paint a chequerboard
 * background so transparency reads.
 */
export const colorSwatchVariants = cva(
	'inline-flex shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-foreground/15',
	{
		variants: {
			size: {
				xs: 'size-4',
				sm: 'size-6',
				default: 'size-8',
				lg: 'size-10',
				xl: 'size-12',
			},
			shape: {
				square: 'rounded-md',
				circle: 'rounded-full',
			},
		},
		defaultVariants: {
			size: 'default',
			shape: 'square',
		},
	},
);

export type ColorSwatchVariants = VariantProps<typeof colorSwatchVariants>;
export type ColorSwatchSize = NonNullable<ColorSwatchVariants['size']>;
export type ColorSwatchShape = NonNullable<ColorSwatchVariants['shape']>;
