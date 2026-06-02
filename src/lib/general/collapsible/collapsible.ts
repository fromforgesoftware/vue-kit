import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

export type CollapsibleVariant = 'default' | 'ghost';
export type CollapsibleSize = 'sm' | 'default';
/** Chevron placement on the trigger row — `left` for nav menus, `right` for FAQs. `none` opts out of an auto-rendered chevron (e.g. when the consumer renders its own). */
export type CollapsibleChevronPosition = 'left' | 'right' | 'none';

export const COLLAPSIBLE_VARIANT_KEY: InjectionKey<Ref<CollapsibleVariant>> =
	Symbol('collapsible-variant');
export const COLLAPSIBLE_SIZE_KEY: InjectionKey<Ref<CollapsibleSize>> = Symbol('collapsible-size');

export const collapsibleVariants = cva('w-full', {
	variants: {
		variant: {
			default: 'rounded-lg border border-border bg-card overflow-hidden',
			ghost: '',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export const collapsibleTriggerVariants = cva(
	`flex w-full cursor-pointer items-center text-left font-medium
   text-foreground transition-colors outline-none
   focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset
   disabled:pointer-events-none disabled:opacity-50`,
	{
		variants: {
			variant: {
				default: 'hover:bg-accent/30',
				ghost: 'rounded-md hover:bg-accent/50 text-muted-foreground',
			},
			size: {
				sm: 'text-xs',
				default: 'text-sm',
			},
			chevronPosition: {
				left: 'gap-2 [&[data-state=open]>svg:first-child]:rotate-90',
				right: 'justify-between [&[data-state=open]>svg:last-child]:rotate-180',
				none: 'justify-between',
			},
		},
		compoundVariants: [
			{ variant: 'default', size: 'sm', class: 'px-3 py-2 min-h-9' },
			{ variant: 'default', size: 'default', class: 'px-4 py-3 min-h-11' },
			{ variant: 'ghost', size: 'sm', class: 'px-1.5 py-1 min-h-8' },
			{ variant: 'ghost', size: 'default', class: 'px-2 py-1.5 min-h-9' },
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			chevronPosition: 'none',
		},
	},
);

export const collapsibleContentVariants = cva(
	`overflow-hidden text-sm
   data-[state=closed]:animate-collapsible-up
   data-[state=open]:animate-collapsible-down`,
	{
		variants: {
			variant: {
				default: 'border-t border-border',
				ghost: '',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export const collapsibleContentInnerVariants = cva('', {
	variants: {
		variant: {
			default: 'text-muted-foreground',
			ghost: '',
		},
		size: {
			sm: 'text-xs',
			default: 'text-sm',
		},
	},
	compoundVariants: [
		{ variant: 'default', size: 'sm', class: 'px-3 py-2' },
		{ variant: 'default', size: 'default', class: 'px-4 py-3' },
		{ variant: 'ghost', size: 'sm', class: 'pl-1.5' },
		{ variant: 'ghost', size: 'default', class: 'pl-2' },
	],
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
});

export type CollapsibleVariants = VariantProps<typeof collapsibleVariants>;
export type CollapsibleTriggerVariants = VariantProps<typeof collapsibleTriggerVariants>;
export type CollapsibleContentVariants = VariantProps<typeof collapsibleContentVariants>;
