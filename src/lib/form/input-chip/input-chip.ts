import { cva, type VariantProps } from 'class-variance-authority';

/** Wrapper for {@link InputChip}. Behaves like {@link inputWrapperVariants} but auto-grows to fit chips. */
export const inputChipVariants = cva(
	[
		'relative flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-md border bg-transparent shadow-xs',
		'transition-[color,box-shadow] outline-none',
		'border-input',
		'has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/50',
		'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-destructive/20',
			},
			size: {
				sm: 'min-h-7 px-2 py-1',
				default: 'min-h-8 px-3 py-1.5',
				lg: 'min-h-10 px-3 py-2',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

// Native input. Border lives on the wrapper.
export const inputChipInputVariants = cva(
	[
		'flex-1 min-w-[8ch] bg-transparent border-0 outline-none',
		'text-foreground placeholder:text-muted-foreground',
		'focus:outline-none focus:ring-0',
		'disabled:cursor-not-allowed',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'text-sm',
				default: 'text-sm',
				lg: 'text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Chip / tag — semantic styling matches a subset of Badge variants.
export const inputChipTagVariants = cva(
	[
		'inline-flex items-center gap-1 rounded-md font-medium leading-normal whitespace-nowrap',
		'border',
	].join(' '),
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				destructive: 'border-transparent bg-destructive text-destructive-foreground',
				outline: 'border-input text-foreground bg-transparent',
				'soft-destructive': 'border-transparent bg-destructive/10 text-destructive',
			},
			size: {
				sm: 'text-2xs px-1.5 py-0 min-h-5',
				default: 'text-xs px-2 py-0.5 min-h-5',
				lg: 'text-sm px-2 py-1 min-h-6',
			},
		},
		defaultVariants: {
			variant: 'secondary',
			size: 'default',
		},
	},
);

// Remove button on each chip. Square so the hit area meets WCAG 2.2 SC 2.5.8.
export const inputChipRemoveVariants = cva(
	[
		'inline-flex items-center justify-center cursor-pointer rounded-full -mr-0.5',
		'transition-colors hover:bg-foreground/10',
		'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current',
		'disabled:pointer-events-none disabled:opacity-50',
		'shrink-0',
		'[&>svg]:pointer-events-none [&>svg]:shrink-0',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-6 [&>svg]:size-3',
				default: 'size-6 [&>svg]:size-3.5',
				lg: 'size-7 [&>svg]:size-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Trailing clear-all button.
export const inputChipClearVariants = cva(
	[
		'inline-flex shrink-0 items-center justify-center cursor-pointer rounded-sm',
		'text-muted-foreground transition-colors hover:text-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
		'ml-auto',
		'[&_svg]:pointer-events-none [&_svg]:shrink-0',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-6 [&_svg:not([class*=size-])]:size-3.5',
				default: 'size-6 [&_svg:not([class*=size-])]:size-4',
				lg: 'size-8 [&_svg:not([class*=size-])]:size-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type InputChipVariants = VariantProps<typeof inputChipVariants>;
export type InputChipTagVariants = VariantProps<typeof inputChipTagVariants>;
export type InputChipSize = NonNullable<InputChipVariants['size']>;
export type InputChipVariant = NonNullable<InputChipVariants['variant']>;
export type InputChipTagVariant = NonNullable<InputChipTagVariants['variant']>;
