import { cva, type VariantProps } from 'class-variance-authority';

// Base classes guarantee:
// - WCAG 2.5.8 target size: every non-icon size meets ≥ 24×24 px (the smallest
//   `sm` is 28 px high; icon `xs` is 24 px square).
// - WCAG 2.4.7 / 2.4.13 focus visible: 3 px ring at ≥ 3:1 contrast.
// - WCAG 1.4.11 disabled state: 50 % opacity + pointer-events-none.
//
// Sizes are identical on mobile and desktop. Earlier passes bumped `default`/
// `lg`/`icon` to 44 px on `max-sm:` to chase Apple HIG / Material's primary-
// touch-target guidance, but it broke proportions inside dense layouts
// (toolbars, table actions, popovers) where a button suddenly grew 12 px
// taller than its neighbours. Keeping a single sizing pass across viewports
// lets the consumer choose `lg` (40 px) or `default` (32 px) explicitly when
// they want a true touch target.
export const buttonVariants = cva(
	[
		'data-[slot=button] inline-flex items-center justify-center gap-1.5',
		'whitespace-nowrap rounded-md text-sm font-medium cursor-pointer',
		'transition-[color,background-color,border-color,box-shadow,opacity]',
		'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
		"[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
		'outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
		'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
	].join(' '),
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				destructive:
					'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30',
				outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary-text underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:underline',
				// Soft variants for low-emphasis surfaces (toolbars, secondary actions in dense layouts).
				'soft-destructive':
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30',
				'soft-success': 'bg-success/10 text-success hover:bg-success/20',
				'soft-warning': 'bg-warning/10 text-warning-foreground hover:bg-warning/20',
				'soft-info': 'bg-info/10 text-info hover:bg-info/20',
			},
			size: {
				// Text-bearing sizes
				xs: 'h-6 px-2 text-xs has-[>svg]:px-1.5',
				sm: 'h-7 px-2.5 text-xs has-[>svg]:px-2',
				default: 'h-8 px-3 text-sm has-[>svg]:px-2.5',
				lg: 'h-10 px-4 text-sm has-[>svg]:px-3.5',
				// Icon-only sizes — square. Names align with text sizes; consumers must
				// pass an `aria-label` to satisfy WCAG SC 4.1.2.
				'icon-xs': 'size-6',
				'icon-sm': 'size-7',
				icon: 'size-8',
				'icon-lg': 'size-10',
			},
			block: {
				true: 'w-full',
				false: '',
			},
		},
		compoundVariants: [
			// Link variant has no padding/box semantics — keep height auto.
			{ variant: 'link', size: 'xs', class: 'h-auto px-0' },
			{ variant: 'link', size: 'sm', class: 'h-auto px-0' },
			{ variant: 'link', size: 'default', class: 'h-auto px-0' },
			{ variant: 'link', size: 'lg', class: 'h-auto px-0' },
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			block: false,
		},
	},
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariants['variant']>;
export type ButtonSize = NonNullable<ButtonVariants['size']>;
