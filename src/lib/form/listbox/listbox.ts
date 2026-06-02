import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, ComputedRef } from 'vue';

/** Bordered listbox container. `aria-[invalid=true]` flips the border to destructive. */
export const listboxVariants = cva(
	[
		'w-full rounded-md border border-input bg-background text-sm',
		'transition-[color,box-shadow] outline-none',
		'focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-primary',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
		'data-[disabled]:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'max-h-[200px]',
				default: 'max-h-[300px]',
				lg: 'max-h-[400px]',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const listboxContentVariants = cva('overflow-y-auto p-1', {
	variants: {},
	defaultVariants: {},
});

/**
 * Listbox item. `min-h-6` keeps every option ≥ 24×24 (WCAG SC 2.5.8). Selected
 * style is painted by both `data-[state=checked]` (Reka) and `aria-selected=true`
 * so an item with `role="option"` works either way.
 */
export const listboxItemVariants = cva(
	[
		'relative flex w-full min-h-6 cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8',
		'text-sm outline-none transition-colors',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
		'data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground',
		'aria-[selected=true]:bg-accent aria-[selected=true]:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
	].join(' '),
	{
		variants: {},
		defaultVariants: {},
	},
);

export const listboxGroupVariants = cva('py-1', {
	variants: {},
	defaultVariants: {},
});

export const listboxLabelVariants = cva(
	'px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type ListboxVariants = VariantProps<typeof listboxVariants>;
export type ListboxSize = NonNullable<ListboxVariants['size']>;

// Size context — Items don't need it today, but keeping it provided keeps
// future per-size item tweaks consistent with other group/item primitives.
export const LISTBOX_SIZE_KEY: InjectionKey<ComputedRef<ListboxSize | undefined>> =
	Symbol('listbox-size');
