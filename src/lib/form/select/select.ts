import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, ComputedRef } from 'vue';

/**
 * Trigger button — anchor sizes match {@link inputWrapperVariants} so the
 * trigger and Input line up in the same form. `data-placeholder` styles the
 * trigger when no value is selected.
 */
export const selectTriggerVariants = cva(
	[
		'border-input data-placeholder:text-muted-foreground',
		'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-background px-3',
		'text-sm transition-[color,box-shadow] outline-none',
		'focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary',
		'data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-ring/50',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
		'disabled:cursor-not-allowed disabled:opacity-50',
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 py-0 text-sm',
				default: 'h-8 py-1 text-sm',
				lg: 'h-10 py-2 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const selectContentVariants = cva(
	[
		'bg-popover text-popover-foreground relative z-60 max-h-(--reka-select-content-available-height)',
		'min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border border-border shadow-md',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
		'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
		'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
	].join(' '),
	{
		variants: {
			position: {
				popper:
					'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
				'item-aligned': '',
			},
		},
		defaultVariants: {
			position: 'popper',
		},
	},
);

export const selectViewportVariants = cva('p-1', {
	variants: {
		position: {
			popper:
				'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]',
			'item-aligned': '',
		},
	},
	defaultVariants: {
		position: 'popper',
	},
});

// SelectItem — `min-h-6` ensures every option is ≥ 24×24 (WCAG 2.5.8).
// Padding right reserves room for the indicator check icon.
export const selectItemVariants = cva(
	[
		'relative flex w-full min-h-6 cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8',
		'text-sm outline-none transition-colors',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
		'data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground',
	].join(' '),
	{
		variants: {},
		defaultVariants: {},
	},
);

export const selectLabelVariants = cva(
	'px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const selectSeparatorVariants = cva('-mx-1 my-1 h-px bg-border', {
	variants: {},
	defaultVariants: {},
});

export const selectScrollButtonVariants = cva(
	'flex cursor-default items-center justify-center py-1 text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;
export type SelectSize = NonNullable<SelectTriggerVariants['size']>;
export type SelectContentVariants = VariantProps<typeof selectContentVariants>;
export type SelectItemVariants = VariantProps<typeof selectItemVariants>;

// Multi-select context — Trigger reads it to swap padding for chip layout, Value
// reads it to render chips, Items can read it for selection state.
export interface SelectMultiContext {
	modelValue: string[];
	toggle: (value: string) => void;
	isSelected: (value: string) => boolean;
}

export const SELECT_MULTI_KEY: InjectionKey<SelectMultiContext | null> = Symbol('select-multi');

// Size context — Trigger sets it; not strictly required but exposed for parity
// with other group/item primitives in this library.
export const SELECT_SIZE_KEY: InjectionKey<ComputedRef<SelectSize | undefined>> =
	Symbol('select-size');
