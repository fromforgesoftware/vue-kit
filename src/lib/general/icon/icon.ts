import { cva, type VariantProps } from 'class-variance-authority';

export const iconVariants = cva('inline-flex shrink-0', {
	variants: {
		size: {
			'2xs': 'size-2',
			xs: 'size-3',
			'xs-sm': 'size-3.5',
			sm: 'size-4',
			md: 'size-5',
			default: 'size-6',
			lg: 'size-8',
			xl: 'size-12',
			none: '',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export type IconVariants = VariantProps<typeof iconVariants>;
export type IconSize = NonNullable<IconVariants['size']>;
