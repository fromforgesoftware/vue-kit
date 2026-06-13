import { cva, type VariantProps } from 'class-variance-authority';

// Editable wraps Reka's Editable primitive: a Preview that displays the value
// and an Input that replaces it on activation. Sizes track the Input ramp so
// previews and inputs swap visually without reflow.
//
// Hit areas:
//   - Preview is a click target — every size meets WCAG 2.2 SC 2.5.8 (≥24×24)
//     because the preview height matches Input height (28/32/40 px).
//   - Submit / Cancel triggers expose 28×28 minimum (sm) and 32×32 (default+).
export const editablePreviewVariants = cva(
	[
		'inline-flex w-full min-w-0 cursor-pointer items-center rounded-md text-foreground',
		'hover:bg-accent/40',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		// Empty placeholder colour.
		'data-[empty]:text-muted-foreground',
		'transition-colors',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 px-2.5 text-sm',
				default: 'h-8 px-3 text-sm',
				lg: 'h-10 px-3 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Mirrors Input's wrapper styling so swapping preview ↔ input is visually
// stable at every size.
export const editableInputVariants = cva(
	[
		'flex w-full min-w-0 rounded-md border border-input bg-transparent text-foreground',
		'placeholder:text-muted-foreground/70',
		'transition-[color,box-shadow] outline-none',
		'focus-visible:border-primary focus-visible:ring-inset focus-visible:ring-primary',
		'disabled:cursor-not-allowed disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 px-2.5 py-1 text-sm',
				default: 'h-8 px-3 py-1 text-sm',
				lg: 'h-10 px-3 py-2 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Action triggers (Edit / Save / Cancel). Sizes match the form ramp so an
// Editable in a settings row lines up with neighbouring inputs.
export const editableTriggerVariants = cva(
	[
		'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md font-medium',
		'text-sm leading-tight whitespace-nowrap',
		'transition-[color,background-color,border-color,box-shadow] outline-none',
		'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'disabled:pointer-events-none disabled:opacity-50',
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	].join(' '),
	{
		variants: {
			intent: {
				// Neutral action — used for Edit and Cancel.
				edit: 'border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
				cancel:
					'border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
				// Primary action — used for Save / Submit.
				submit: 'bg-primary text-primary-foreground hover:bg-primary/90',
			},
			size: {
				// 28 px — minimum that still meets WCAG 24×24.
				sm: 'h-7 min-w-7 px-2 text-sm',
				default: 'h-8 min-w-8 px-3 text-sm',
				lg: 'h-10 min-w-10 px-4 text-sm',
			},
		},
		defaultVariants: {
			intent: 'edit',
			size: 'default',
		},
	},
);

export type EditableTriggerVariants = VariantProps<typeof editableTriggerVariants>;
export type EditablePreviewVariants = VariantProps<typeof editablePreviewVariants>;
export type EditableInputVariants = VariantProps<typeof editableInputVariants>;
export type EditableSize = NonNullable<EditablePreviewVariants['size']>;
