import { cva, type VariantProps } from 'class-variance-authority';

export type { SkeletonAnimate } from './types';

export const skeletonVariants = cva('', {
	variants: {
		variant: {
			default: 'rounded-md',
			circle: 'rounded-full',
			text: 'rounded h-4',
		},
		animate: {
			pulse: 'bg-primary/10 animate-pulse',
			shimmer: 'skeleton-shimmer',
			solid: 'bg-primary/10',
		},
	},
	defaultVariants: {
		variant: 'default',
		animate: 'pulse',
	},
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
export type SkeletonVariant = NonNullable<SkeletonVariants['variant']>;
