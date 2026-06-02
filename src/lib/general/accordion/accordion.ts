import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

/** `default` renders a bordered card; `ghost` strips the surface for embedded use. */
export type AccordionVariant = 'default' | 'ghost';

/** Chevron placement on the trigger row — `left` for nav menus, `right` for FAQs. */
export type AccordionChevronPosition = 'left' | 'right';

/** Density tier — `sm` for compact lists, `default` for prose. */
export type AccordionSize = 'sm' | 'default';

/** Injection keys — `Accordion` provides these so child sub-components inherit the settings. */
export const ACCORDION_VARIANT_KEY: InjectionKey<Ref<AccordionVariant>> =
	Symbol('accordion-variant');
export const ACCORDION_CHEVRON_POSITION_KEY: InjectionKey<Ref<AccordionChevronPosition>> = Symbol(
	'accordion-chevron-position',
);
export const ACCORDION_SIZE_KEY: InjectionKey<Ref<AccordionSize>> = Symbol('accordion-size');

/** Accordion root — bordered card or ghost wrapper. */
export const accordionVariants = cva('w-full', {
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

export const accordionItemVariants = cva('', {
	variants: {
		variant: {
			default: 'border-b border-border last:border-b-0',
			ghost: '',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export const accordionTriggerVariants = cva(
	`flex flex-1 cursor-pointer items-center text-left font-medium
   transition-all outline-none
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
				left: 'gap-2 [&[data-state=open]>svg]:rotate-90',
				right: 'justify-between [&[data-state=open]>svg]:rotate-180',
			},
		},
		compoundVariants: [
			// Padding pairs with size only when surface is `default`. Ghost stays compact.
			{ variant: 'default', size: 'sm', class: 'px-3 py-2 min-h-9' },
			{ variant: 'default', size: 'default', class: 'px-4 py-3 min-h-11' },
			{ variant: 'ghost', size: 'sm', class: 'px-1.5 py-1 min-h-8' },
			{ variant: 'ghost', size: 'default', class: 'px-2 py-1.5 min-h-9' },
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			chevronPosition: 'right',
		},
	},
);

export const accordionContentVariants = cva(
	`overflow-hidden text-sm
   data-[state=closed]:animate-accordion-up
   data-[state=open]:animate-accordion-down`,
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

export const accordionContentInnerVariants = cva('', {
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

export type AccordionVariants = VariantProps<typeof accordionVariants>;
export type AccordionItemVariants = VariantProps<typeof accordionItemVariants>;
export type AccordionTriggerVariants = VariantProps<typeof accordionTriggerVariants>;
export type AccordionContentVariants = VariantProps<typeof accordionContentVariants>;
