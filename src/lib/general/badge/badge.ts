import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
	'relative inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] [&>svg]:shrink-0 leading-normal',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
				success: 'border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90',
				warning: 'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
				info: 'border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90',
				'soft-success': 'border-transparent bg-success/10 text-success [a&]:hover:bg-success/20',
				'soft-warning':
					'border-transparent bg-warning/10 text-warning-foreground [a&]:hover:bg-warning/20',
				'soft-destructive':
					'border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20',
				'soft-info': 'border-transparent bg-info/10 text-info [a&]:hover:bg-info/20',
			},
			size: {
				xs: 'text-[10px] px-1 py-0 min-h-4',
				sm: 'text-2xs px-1.5 py-0 min-h-5',
				default: 'text-xs px-1.5 py-0.5 min-h-5',
				lg: 'text-sm px-2 py-1 min-h-6',
			},
			shape: {
				default: 'rounded-md',
				pill: 'rounded-full',
			},
		},
		compoundVariants: [
			// Circular shape for icon-only or single-character badges: square aspect + rounded.
			// Consumers opt in by setting shape="pill" alongside passing only an icon/digit.
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			shape: 'default',
		},
	},
);

// Remove button must meet WCAG 2.2 SC 2.5.8: ≥ 24×24 CSS px.
// All sizes meet 24×24; the X icon scales down to keep the button visually
// proportional to the badge text.
export const badgeRemoveVariants = cva(
	'inline-flex items-center justify-center cursor-pointer transition-colors rounded-full -mr-1 ' +
		'hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current ' +
		'shrink-0 size-6 [&>svg]:pointer-events-none',
	{
		variants: {
			size: {
				xs: '[&>svg]:size-3',
				sm: '[&>svg]:size-3',
				default: '[&>svg]:size-3.5',
				lg: '[&>svg]:size-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeVariant = NonNullable<BadgeVariants['variant']>;
export type BadgeSize = NonNullable<BadgeVariants['size']>;
export type BadgeShape = NonNullable<BadgeVariants['shape']>;
