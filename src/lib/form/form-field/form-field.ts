import { cva, type VariantProps } from 'class-variance-authority';

// FormField pairs a Label, the slotted control, optional helper text, and an
// error message. It owns:
//   - field id (auto-generated if not provided) so consumers don't have to
//     wire `for`/`id` by hand
//   - aria-describedby wiring — error id wins over hint id
//   - layout: `vertical` stacks; `horizontal` aligns label-on-left at md+
//   - error state propagated down to the label / helper-text
//
// The wrapper itself is a `<div>` (not a fieldset) — most form fields hold a
// single control, and a fieldset would add unnecessary semantic noise.
export const formFieldVariants = cva('group/field flex w-full', {
	variants: {
		layout: {
			// Vertical stack: label, control, hint/error.
			vertical: 'flex-col gap-1.5',
			// Horizontal: label-and-description on the left, control on the right.
			// Stacked at mobile; switches at md+. Vertical padding mirrors the
			// existing settings-row convention so divide-y parents render evenly.
			horizontal:
				'min-h-10 flex-col gap-2 px-3 py-3 md:flex-row md:items-center md:justify-between md:gap-4',
		},
	},
	defaultVariants: {
		layout: 'vertical',
	},
});

// Label + helper column. In horizontal layout it grows to fill the row; the
// control column sits on the right and shrinks to its content.
export const formFieldLabelColVariants = cva('flex min-w-0 flex-col gap-0.5', {
	variants: {
		layout: {
			vertical: '',
			horizontal: 'md:flex-1',
		},
	},
	defaultVariants: {
		layout: 'vertical',
	},
});

export const formFieldControlColVariants = cva('flex min-w-0 flex-col gap-1.5', {
	variants: {
		layout: {
			vertical: '',
			horizontal: 'w-full md:w-auto md:shrink-0',
		},
	},
	defaultVariants: {
		layout: 'vertical',
	},
});

// Hint / error text shares a token (text-xs) so the field doesn't reflow when
// state flips between hint and error.
export const formFieldMessageVariants = cva('text-xs leading-snug', {
	variants: {
		tone: {
			hint: 'text-muted-foreground',
			error: 'text-destructive',
		},
	},
	defaultVariants: {
		tone: 'hint',
	},
});

export type FormFieldVariants = VariantProps<typeof formFieldVariants>;
export type FormFieldLayout = NonNullable<FormFieldVariants['layout']>;
