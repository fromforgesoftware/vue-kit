import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Wrapper carries border/ring/focus via `:has(input:focus-visible)` so it
 * matches the form Input next to it; the inner Reka input is borderless.
 */
export const colorFieldRootVariants = cva(
	[
		'relative flex w-full min-w-0 items-center gap-2 rounded-md border bg-transparent shadow-xs',
		'transition-[color,box-shadow] outline-none',
		'border-input',
		'has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/50',
		'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-destructive/20',
			},
			size: {
				sm: 'h-7 px-2',
				default: 'h-8 px-2.5',
				lg: 'h-10 px-3',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

/** Leading colour swatch shown inside the field next to the hex input. */
export const colorFieldSwatchVariants = cva(
	'shrink-0 rounded-sm ring-1 ring-inset ring-foreground/15',
	{
		variants: {
			size: {
				sm: 'size-4',
				default: 'size-5',
				lg: 'size-6',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

/** Native hex/channel input — borderless; the wrapper carries focus state. */
export const colorFieldInputVariants = cva(
	[
		'peer w-full min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none border-0',
		'placeholder:text-muted-foreground',
		'disabled:cursor-not-allowed read-only:cursor-default',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 text-sm',
				default: 'h-8 text-sm',
				lg: 'h-10 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type ColorFieldVariants = VariantProps<typeof colorFieldRootVariants>;
export type ColorFieldVariant = NonNullable<ColorFieldVariants['variant']>;
export type ColorFieldSize = NonNullable<ColorFieldVariants['size']>;
