import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

export type ToolbarVariant = 'default' | 'ghost';
export type ToolbarSize = 'sm' | 'default';
export type ToolbarOrientation = 'horizontal' | 'vertical';

export const TOOLBAR_VARIANT_KEY: InjectionKey<Ref<ToolbarVariant>> = Symbol('toolbar-variant');
export const TOOLBAR_SIZE_KEY: InjectionKey<Ref<ToolbarSize>> = Symbol('toolbar-size');
export const TOOLBAR_ORIENTATION_KEY: InjectionKey<Ref<ToolbarOrientation>> =
	Symbol('toolbar-orientation');

export const toolbarVariants = cva(
	// Mobile: wrap items so they don't horizontally clip; reset min-width so
	// wrapping can actually happen (sm:min-w-max keeps the desktop overflow contract).
	'flex w-full items-center gap-0.5 max-sm:flex-wrap max-sm:gap-1 max-sm:min-w-0 sm:min-w-max',
	{
		variants: {
			variant: {
				default: 'rounded-lg border border-border bg-card p-2 shadow-sm',
				ghost: 'p-0',
			},
			orientation: {
				horizontal: 'flex-row',
				vertical: 'flex-col items-stretch',
			},
		},
		defaultVariants: {
			variant: 'default',
			orientation: 'horizontal',
		},
	},
);

// All interactive items hit the WCAG 2.5.8 target-size minimum (24×24).
// `min-h-9` (36 px) on default size; `min-h-8` (32 px) on `sm`.
const itemBase = `inline-flex shrink-0 cursor-pointer items-center justify-center
  rounded font-medium leading-none
  transition-colors outline-none select-none
  hover:bg-accent hover:text-accent-foreground
  focus-visible:ring-[3px] focus-visible:ring-ring/50
  disabled:pointer-events-none disabled:opacity-50`;

export const toolbarButtonVariants = cva(itemBase, {
	variants: {
		size: {
			sm: 'h-8 px-2.5 text-xs',
			default: 'h-9 px-3 text-sm',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export const toolbarLinkVariants = cva(
	`${itemBase} bg-transparent text-muted-foreground underline-offset-4 hover:underline`,
	{
		variants: {
			size: {
				sm: 'h-8 px-2 text-xs',
				default: 'h-9 px-2.5 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const toolbarSeparatorVariants = cva('shrink-0 bg-border', {
	variants: {
		orientation: {
			horizontal: 'mx-2 h-5 w-px',
			vertical: 'my-2 h-px w-5',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export const toolbarToggleGroupVariants = cva('flex items-center gap-0.5', {
	variants: {
		orientation: {
			horizontal: 'flex-row',
			vertical: 'flex-col items-stretch',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export const toolbarToggleItemVariants = cva(
	`${itemBase} text-muted-foreground
   data-[state=on]:bg-accent data-[state=on]:text-accent-foreground
   [&_svg]:pointer-events-none [&_svg]:shrink-0`,
	{
		variants: {
			size: {
				sm: 'h-8 min-w-8 px-2 text-xs [&_svg]:size-3.5',
				default: 'h-9 min-w-9 px-2.5 text-sm [&_svg]:size-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type ToolbarVariants = VariantProps<typeof toolbarVariants>;
