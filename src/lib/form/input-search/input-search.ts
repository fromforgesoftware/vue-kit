import { cva, type VariantProps } from 'class-variance-authority';

// Wrapper. Border + ring live here so leading icon and trailing clear button
// share the same focus-within / error states.
export const inputSearchVariants = cva(
	[
		'relative flex w-full min-w-0 items-center rounded-md border bg-transparent',
		'transition-[color,box-shadow] outline-none',
		'border-input',
		'has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-inset has-[input:focus-visible]:ring-primary',
		'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
		'has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-destructive/20',
				ghost:
					'border-transparent shadow-none rounded-none has-[input:focus-visible]:border-transparent has-[input:focus-visible]:ring-0',
			},
			size: {
				sm: 'h-7',
				default: 'h-8',
				lg: 'h-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

// The native input. Border lives on the wrapper. Padding accounts for the
// leading magnifying glass and trailing clear button via size variants.
export const inputSearchInputVariants = cva(
	[
		'peer flex-1 min-w-0 bg-transparent outline-none border-0',
		'text-foreground placeholder:text-muted-foreground/70',
		'disabled:cursor-not-allowed',
		'[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
		'[&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 py-1 text-sm',
				default: 'h-8 py-1 text-sm',
				lg: 'h-10 py-2 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Leading magnifying glass affixed inside the wrapper. Padding mirrors
// Input's affix variant so search and Input visually align.
export const inputSearchIconVariants = cva(
	[
		'flex shrink-0 items-center justify-center text-muted-foreground',
		'[&_svg]:pointer-events-none [&_svg]:shrink-0',
		'ps-3 pe-1.5',
	].join(' '),
	{
		variants: {
			size: {
				sm: '',
				default: '',
				lg: '',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Trailing clear button. Square so it always meets WCAG 2.2 SC 2.5.8
// (≥ 24×24) regardless of input size.
export const inputSearchClearVariants = cva(
	[
		'inline-flex shrink-0 items-center justify-center cursor-pointer rounded-sm',
		'text-muted-foreground transition-colors hover:text-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
		'me-1.5',
		'[&_svg]:pointer-events-none [&_svg]:shrink-0',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-6',
				default: 'size-6',
				lg: 'size-8',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type InputSearchVariants = VariantProps<typeof inputSearchVariants>;
export type InputSearchSize = NonNullable<InputSearchVariants['size']>;
export type InputSearchVariant = NonNullable<InputSearchVariants['variant']>;
