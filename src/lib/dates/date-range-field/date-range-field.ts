import { cva, type VariantProps } from 'class-variance-authority';

// Wrapper around the dual segmented input. Mirrors DateField's CVA so consumers
// can match heights / errors / sizes across single and range fields.
//
// Error styling is consumer-controlled via `error` prop / `variant="error"`.
// We don't paint red on Reka's automatic `data-[invalid]` (set on empty
// model / first paint).
export const dateRangeFieldRootVariants = cva(
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

export const dateRangeFieldInputVariants = cva(
	[
		'rounded-sm p-0.5 outline-none transition-colors',
		'focus:bg-accent focus:text-accent-foreground',
		'data-[placeholder]:text-muted-foreground',
	].join(' '),
);

// Separator between start and end groups. Sized in step with the field height.
export const dateRangeFieldSeparatorVariants = cva('text-muted-foreground', {
	variants: {
		size: {
			sm: 'mx-1.5',
			default: 'mx-2',
			lg: 'mx-2',
		},
	},
	defaultVariants: { size: 'default' },
});

export type DateRangeFieldVariants = VariantProps<typeof dateRangeFieldRootVariants>;
export type DateRangeFieldSize = NonNullable<DateRangeFieldVariants['size']>;
export type DateRangeFieldVariant = NonNullable<DateRangeFieldVariants['variant']>;
