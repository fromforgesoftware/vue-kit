import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

export type CardVariant = 'default' | 'muted' | 'ghost' | 'accent';
export const CARD_VARIANT_KEY: InjectionKey<Ref<CardVariant>> = Symbol('card-variant');

/** Surface variants for {@link Card}. Pair with CardHeader / CardContent / CardFooter. */
export const cardVariants = cva('rounded-xl text-card-foreground transition-all duration-150', {
	variants: {
		variant: {
			default: 'border border-border bg-card',
			muted: 'border border-border bg-muted',
			ghost: 'border border-transparent bg-transparent',
			accent: 'border border-border bg-card border-t-4 border-t-border',
		},
		padding: {
			none: '',
			sm: 'p-3',
			default: 'p-5',
			lg: 'p-6',
		},
		interactive: {
			// Subtle hover/active feedback for clickable cards. The cursor and a
			// soft border + shadow shift are enough to signal "clickable" without
			// the card visually leaping on hover.
			true: [
				'cursor-pointer',
				'hover:border-foreground/20 hover:shadow-sm',
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
			].join(' '),
			false: '',
		},
	},
	defaultVariants: {
		variant: 'default',
		padding: 'default',
		interactive: false,
	},
});

export const cardHeaderVariants = cva('flex flex-col gap-1.5', {
	variants: {
		spacing: {
			tight: 'gap-1',
			default: 'gap-1.5',
			loose: 'gap-2',
		},
	},
	defaultVariants: {
		spacing: 'default',
	},
});

export const cardTitleVariants = cva('font-semibold leading-none tracking-tight', {
	variants: {
		size: {
			sm: 'text-sm',
			default: 'text-lg',
			lg: 'text-xl',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export const cardDescriptionVariants = cva('text-muted-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export const cardContentVariants = cva('', {
	variants: {
		spacing: {
			none: '',
			sm: 'mt-3',
			default: 'mt-4',
			lg: 'mt-6',
		},
	},
	defaultVariants: {
		spacing: 'none',
	},
});

export const cardFooterVariants = cva('flex items-center', {
	variants: {
		align: {
			start: 'justify-start',
			center: 'justify-center',
			end: 'justify-end',
			between: 'justify-between',
		},
		spacing: {
			none: '',
			sm: 'mt-3',
			default: 'mt-4',
			lg: 'mt-6',
		},
	},
	defaultVariants: {
		align: 'start',
		spacing: 'none',
	},
});

export type CardVariants = VariantProps<typeof cardVariants>;
export type CardPadding = NonNullable<CardVariants['padding']>;
export type CardTitleVariants = VariantProps<typeof cardTitleVariants>;
export type CardTitleSize = NonNullable<CardTitleVariants['size']>;
export type CardDescriptionVariants = VariantProps<typeof cardDescriptionVariants>;
export type CardHeaderVariants = VariantProps<typeof cardHeaderVariants>;
export type CardContentVariants = VariantProps<typeof cardContentVariants>;
export type CardFooterVariants = VariantProps<typeof cardFooterVariants>;
