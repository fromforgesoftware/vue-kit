import { cva, type VariantProps } from 'class-variance-authority';

// Base / shared variants track the workair UI library so the two design systems
// stay visually identical (text-base, gap-2, h-7/8/9 size ramp, shadow-xs on the
// solid/outline variants only). Forge keeps a few additions workair lacks but
// consumers rely on: the `soft-*` low-emphasis variants, the `xs` text size and
// the `icon-xs/-sm/-lg` square sizes, the `block` modifier, plus stronger a11y
// (aria-disabled handling, WCAG 2.5.8 ≥24px targets — smallest `xs` is 24px).
export const buttonVariants = cva(
	[
		'data-[slot=button] inline-flex items-center justify-center gap-2',
		'whitespace-nowrap rounded-md text-base font-medium cursor-pointer transition-all',
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
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
				outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				// Soft variants for low-emphasis surfaces (toolbars, secondary actions in dense layouts).
				'soft-destructive':
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30',
				'soft-success': 'bg-success/10 text-success hover:bg-success/20',
				'soft-warning': 'bg-warning/10 text-warning-foreground hover:bg-warning/20',
				'soft-info': 'bg-info/10 text-info hover:bg-info/20',
			},
			size: {
				// Text-bearing sizes — sm/default/lg track workair; xs is forge-only.
				xs: 'h-6 px-2 text-xs has-[>svg]:px-1.5',
				sm: 'h-7 gap-1.5 px-2.5 has-[>svg]:px-2',
				default: 'h-8 px-3 py-2 has-[>svg]:px-2.5',
				lg: 'h-9 px-4 has-[>svg]:px-3',
				// Icon-only sizes — square. Names align with text sizes; consumers must
				// pass an `aria-label` to satisfy WCAG SC 4.1.2. Only `icon` (size-8)
				// exists in workair; the rest are forge additions.
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
