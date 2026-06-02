import { cva, type VariantProps } from 'class-variance-authority';

export const avatarVariants = cva('relative flex shrink-0 overflow-hidden bg-secondary', {
	variants: {
		size: {
			xs: 'size-6',
			sm: 'size-7',
			default: 'size-8',
			lg: 'size-10',
			xl: 'size-12',
		},
		shape: {
			circle: 'rounded-full',
			rounded: 'rounded-md',
			square: 'rounded-none',
		},
	},
	defaultVariants: {
		size: 'default',
		shape: 'circle',
	},
});

export const avatarImageVariants = cva('aspect-square size-full object-cover', {
	variants: {},
	defaultVariants: {},
});

export const avatarFallbackVariants = cva(
	'flex size-full items-center justify-center rounded-[inherit] bg-muted text-foreground font-semibold',
	{
		variants: {
			size: {
				xs: 'text-2xs',
				sm: 'text-xs',
				default: 'text-xs',
				lg: 'text-sm',
				xl: 'text-base',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type AvatarVariants = VariantProps<typeof avatarVariants>;
export type AvatarFallbackVariants = VariantProps<typeof avatarFallbackVariants>;
export type AvatarSize = NonNullable<AvatarVariants['size']>;
export type AvatarShape = NonNullable<AvatarVariants['shape']>;
