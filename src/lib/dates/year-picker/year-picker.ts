import { cva, type VariantProps } from 'class-variance-authority';

/** Root wrapper for {@link YearPicker}. `variant="error"` opts into red ring; default is neutral. */
export const yearPickerRootVariants = cva(
	'w-fit rounded-xl border border-border bg-background shadow-sm text-foreground',
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-2 ring-destructive/20',
			},
			size: {
				sm: 'p-3',
				default: 'p-4',
				lg: 'p-5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const yearPickerContentVariants = cva(
	[
		'z-60 rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none',
		// Reka's floating-ui sets inline position/transform, so a `max-sm:fixed`
		// bottom-sheet override never sticks. Cap dimensions to the viewport instead
		// and rely on `collision-padding` on the Content tag for edge-safety.
		'max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-auto',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'p-3',
				default: 'p-4',
				lg: 'p-5',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const yearPickerHeaderVariants = cva('flex items-center justify-between');

export const yearPickerHeadingVariants = cva('font-medium text-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

export const yearPickerNavButtonVariants = cva(
	[
		'inline-flex cursor-pointer items-center justify-center rounded-md',
		'bg-transparent text-muted-foreground',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-6',
				default: 'size-7',
				lg: 'size-8',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const yearPickerGridVariants = cva('mt-3');

export const yearPickerGridRowVariants = cva('grid grid-cols-4');

export const yearPickerCellVariants = cva('relative p-0.5 text-center', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

export const yearPickerCellTriggerVariants = cva(
	[
		'inline-flex w-full items-center justify-center rounded-md',
		'whitespace-nowrap font-normal outline-none transition-colors',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary/90',
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
		'data-[highlighted]:bg-accent',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'px-2 py-1 text-xs min-h-6',
				default: 'px-2 py-1.5 text-sm min-h-7',
				lg: 'px-3 py-2 text-sm min-h-9',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export type YearPickerVariants = VariantProps<typeof yearPickerRootVariants>;
export type YearPickerSize = NonNullable<YearPickerVariants['size']>;
export type YearPickerVariant = NonNullable<YearPickerVariants['variant']>;
