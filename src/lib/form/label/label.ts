import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Form label. Tracks the input's disabled state via `peer-*` so the label
 * disables itself regardless of DOM order. Variants are tone only — height
 * stays constant across states so validation changes don't cause layout shift.
 */
export const labelVariants = cva(
	[
		'flex items-center gap-1 text-sm font-medium leading-tight select-none',
		'peer-data-[disabled=true]:pointer-events-none peer-data-[disabled=true]:opacity-50',
		'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
	].join(' '),
	{
		variants: {
			variant: {
				default: 'text-foreground',
				error: 'text-destructive',
			},
			size: {
				sm: 'text-xs',
				default: 'text-sm',
				lg: 'text-base',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export type LabelVariants = VariantProps<typeof labelVariants>;
export type LabelVariant = NonNullable<LabelVariants['variant']>;
export type LabelSize = NonNullable<LabelVariants['size']>;
