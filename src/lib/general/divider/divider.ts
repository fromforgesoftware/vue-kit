import { cva, type VariantProps } from 'class-variance-authority';

/** Plain divider line. When a label slot is provided, see `dividerWithLabelVariants` instead. */
export const dividerVariants = cva('shrink-0', {
	variants: {
		orientation: {
			horizontal: 'w-full border-t',
			vertical: 'h-full border-l self-stretch',
		},
		variant: {
			solid: 'border-solid',
			dashed: 'border-dashed',
			dotted: 'border-dotted',
		},
		tone: {
			default: 'border-border',
			muted: 'border-border/60',
			strong: 'border-foreground/30',
		},
		inset: {
			none: '',
			sm: '',
			default: '',
			lg: '',
		},
	},
	compoundVariants: [
		{ orientation: 'horizontal', inset: 'sm', class: 'my-2' },
		{ orientation: 'horizontal', inset: 'default', class: 'my-4' },
		{ orientation: 'horizontal', inset: 'lg', class: 'my-6' },
		{ orientation: 'vertical', inset: 'sm', class: 'mx-2' },
		{ orientation: 'vertical', inset: 'default', class: 'mx-4' },
		{ orientation: 'vertical', inset: 'lg', class: 'mx-6' },
	],
	defaultVariants: {
		orientation: 'horizontal',
		variant: 'solid',
		tone: 'default',
		inset: 'none',
	},
});

// When a label is present, the divider becomes a flex container with two lines
// and a centred text node.
export const dividerWithLabelVariants = cva('flex items-center w-full', {
	variants: {
		inset: {
			none: '',
			sm: 'my-2',
			default: 'my-4',
			lg: 'my-6',
		},
	},
	defaultVariants: {
		inset: 'none',
	},
});

export const dividerLineVariants = cva('flex-1 border-t', {
	variants: {
		variant: {
			solid: 'border-solid',
			dashed: 'border-dashed',
			dotted: 'border-dotted',
		},
		tone: {
			default: 'border-border',
			muted: 'border-border/60',
			strong: 'border-foreground/30',
		},
	},
	defaultVariants: {
		variant: 'solid',
		tone: 'default',
	},
});

export const dividerLabelVariants = cva('mx-3 text-xs font-medium text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export type DividerVariants = VariantProps<typeof dividerVariants>;
export type DividerOrientation = NonNullable<DividerVariants['orientation']>;
export type DividerVariant = NonNullable<DividerVariants['variant']>;
export type DividerTone = NonNullable<DividerVariants['tone']>;
export type DividerInset = NonNullable<DividerVariants['inset']>;
