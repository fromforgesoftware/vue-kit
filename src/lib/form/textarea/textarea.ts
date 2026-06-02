import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Multi-line text input. Mirrors {@link inputWrapperVariants} tokens (border,
 * ring, error tones) but stays flat — no wrapper — because textareas don't
 * need leading/trailing affixes. iOS Safari auto-zooms on focus; same trade-off
 * as Input.
 */
export const textareaVariants = cva(
	[
		'flex w-full min-w-0 rounded-md border bg-transparent shadow-xs',
		'border-input text-foreground placeholder:text-muted-foreground',
		'transition-[color,box-shadow] outline-none',
		'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'read-only:cursor-default',
		'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-destructive/20',
			},
			size: {
				sm: 'min-h-16 px-2.5 py-1.5 text-sm',
				default: 'min-h-20 px-3 py-2 text-sm',
				lg: 'min-h-28 px-3 py-2 text-sm',
			},
			autoResize: {
				true: 'resize-none overflow-hidden',
				false: 'resize-y',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			autoResize: false,
		},
	},
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;
export type TextareaVariant = NonNullable<TextareaVariants['variant']>;
export type TextareaSize = NonNullable<TextareaVariants['size']>;
