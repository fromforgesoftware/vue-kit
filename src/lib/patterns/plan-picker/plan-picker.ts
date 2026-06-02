import { cva, type VariantProps } from 'class-variance-authority';

export interface PlanOption {
	/** Unique identifier for the plan */
	value: string;
	/** Display name of the plan */
	name: string;
	/** Price description, e.g. "$19 per member/month" */
	price: string;
	/** Whether this option is disabled */
	disabled?: boolean;
}

export interface PlanFeature {
	/** Feature description text */
	label: string;
}

export const planPickerOptionVariants = cva(
	`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors
   data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50`,
	{
		variants: {
			selected: {
				true: 'border-primary bg-primary/5',
				false: 'border-border hover:border-muted-foreground/30',
			},
		},
		defaultVariants: {
			selected: false,
		},
	},
);

export const planPickerOptionNameVariants = cva('text-sm font-semibold leading-none', {
	variants: {},
	defaultVariants: {},
});

export const planPickerOptionPriceVariants = cva('mt-1 text-xs text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const planPickerFeatureVariants = cva('flex items-center gap-2.5 text-sm text-foreground', {
	variants: {},
	defaultVariants: {},
});

export const planPickerFeatureIconVariants = cva('size-4 shrink-0 text-foreground', {
	variants: {},
	defaultVariants: {},
});

export type PlanPickerOptionVariants = VariantProps<typeof planPickerOptionVariants>;
