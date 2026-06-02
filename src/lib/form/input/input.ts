import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Wrapper for {@link Input} — owns border, ring, and slots for leading/trailing
 * icons. The native `<input>` is borderless inside; caret hit area covers the
 * full surface. iOS Safari auto-zooms the page on focus when font-size < 16 px;
 * we accept that quirk for visual consistency over a `max-sm:text-[16px]` rule.
 */
export const inputWrapperVariants = cva(
	[
		'relative flex w-full min-w-0 items-center rounded-md border bg-transparent shadow-xs',
		'transition-[color,box-shadow] outline-none',
		'border-input',
		'has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/50',
		'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
		'has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-destructive/20',
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

/** Native input. Border lives on the wrapper; this is just typography + sizing. */
export const inputVariants = cva(
	[
		'peer flex-1 min-w-0 bg-transparent outline-none border-0',
		'text-foreground placeholder:text-muted-foreground',
		'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
		'disabled:cursor-not-allowed',
		'read-only:cursor-default',
		'[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
		'[&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 px-2.5 py-1 text-sm',
				default: 'h-8 px-3 py-1 text-sm',
				lg: 'h-10 px-3 py-2 text-sm',
			},
			hasLeading: { true: 'ps-0', false: '' },
			hasTrailing: { true: 'pe-0', false: '' },
			inputType: {
				default: '',
				file: 'text-muted-foreground italic file:not-italic file:me-3 file:border-r file:border-input file:border-solid file:px-3 file:h-full p-0 pr-3',
			},
		},
		defaultVariants: {
			size: 'default',
			hasLeading: false,
			hasTrailing: false,
			inputType: 'default',
		},
	},
);

/**
 * Leading or trailing icon affixed inside the wrapper. Padding mirrors the
 * size's outer padding so icon and text align.
 */
export const inputAffixVariants = cva(
	[
		'flex shrink-0 items-center justify-center text-muted-foreground',
		'[&_svg]:pointer-events-none [&_svg]:shrink-0',
	].join(' '),
	{
		variants: {
			side: {
				leading: 'ps-3 pe-1.5',
				trailing: 'ps-1.5 pe-3',
			},
			size: {
				sm: '[&_svg:not([class*=size-])]:size-3.5',
				default: '[&_svg:not([class*=size-])]:size-4',
				lg: '[&_svg:not([class*=size-])]:size-4',
			},
		},
		defaultVariants: {
			side: 'leading',
			size: 'default',
		},
	},
);

export type InputVariants = VariantProps<typeof inputVariants>;
export type InputWrapperVariants = VariantProps<typeof inputWrapperVariants>;
export type InputVariant = NonNullable<InputWrapperVariants['variant']>;
export type InputSize = NonNullable<InputWrapperVariants['size']>;
