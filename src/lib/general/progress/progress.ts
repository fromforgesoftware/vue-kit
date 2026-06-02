import { cva, type VariantProps } from 'class-variance-authority';

export const progressVariants = cva('relative w-full overflow-hidden rounded-full', {
	variants: {
		size: {
			sm: 'h-1',
			default: 'h-2',
			lg: 'h-3',
		},
		variant: {
			default: 'bg-primary/20',
			success: 'bg-success/20',
			warning: 'bg-warning/20',
			destructive: 'bg-destructive/20',
			info: 'bg-info/20',
		},
	},
	defaultVariants: {
		size: 'default',
		variant: 'default',
	},
});

export const progressIndicatorVariants = cva('h-full w-full flex-1 transition-all', {
	variants: {
		variant: {
			default: 'bg-primary',
			success: 'bg-success',
			warning: 'bg-warning',
			destructive: 'bg-destructive',
			info: 'bg-info',
		},
		indeterminate: {
			true: 'progress-indeterminate',
			false: '',
		},
	},
	defaultVariants: {
		variant: 'default',
		indeterminate: false,
	},
});

export type ProgressVariants = VariantProps<typeof progressVariants>;
export type ProgressSize = NonNullable<ProgressVariants['size']>;
export type ProgressVariant = NonNullable<ProgressVariants['variant']>;
