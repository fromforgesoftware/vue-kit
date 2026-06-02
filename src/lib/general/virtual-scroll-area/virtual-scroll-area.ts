import { cva, type VariantProps } from 'class-variance-authority';

export const virtualScrollAreaVariants = cva('relative overflow-hidden', {
	variants: {},
	defaultVariants: {},
});

export type VirtualScrollAreaVariants = VariantProps<typeof virtualScrollAreaVariants>;
