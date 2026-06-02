import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Wrapper for the segmented date input. Error styling is opt-in via
 * `variant="error"`, not Reka's `data-[invalid]` — Reka marks any empty model
 * as invalid, which would paint a red ring on every freshly-mounted picker
 * with `null` v-model.
 */
export const dateFieldRootVariants = cva(
	[
		'flex w-fit select-none items-center rounded-md border bg-transparent shadow-xs',
		'transition-[color,box-shadow] outline-none',
		'border-input',
		'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/50',
		'disabled:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-2 ring-destructive/20',
			},
			size: {
				sm: 'h-7 px-2 text-sm',
				default: 'h-8 px-3 text-sm',
				lg: 'h-10 px-3 text-sm',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const dateFieldInputVariants = cva(
	[
		'rounded-sm p-0.5 outline-none transition-colors',
		'focus:bg-accent focus:text-accent-foreground',
		'data-[placeholder]:text-muted-foreground',
	].join(' '),
);

export type DateFieldVariants = VariantProps<typeof dateFieldRootVariants>;
export type DateFieldSize = NonNullable<DateFieldVariants['size']>;
export type DateFieldVariant = NonNullable<DateFieldVariants['variant']>;
