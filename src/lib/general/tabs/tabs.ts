import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

/** Density tier — `sm` for embedded contexts, `default` for top-level. */
export type TabsSize = 'sm' | 'default';

/** Injection keys — `Tabs` provides these so child sub-components inherit styling. */
export const TABS_VARIANT_KEY: InjectionKey<Ref<TabsVariant>> = Symbol('tabs-variant');
export const TABS_SIZE_KEY: InjectionKey<Ref<TabsSize>> = Symbol('tabs-size');

/** TabsList — wraps the trigger row. `pill`, `underlined`, `ghost`, or default segmented look. */
export const tabsListVariants = cva(
	'relative inline-flex w-fit max-w-full items-center justify-center overflow-x-auto scrollbar-none data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:overflow-x-visible data-[orientation=vertical]:max-w-none',
	{
		variants: {
			variant: {
				default: 'bg-muted text-muted-foreground rounded-md p-0.5',
				pill: 'bg-muted text-muted-foreground rounded-lg p-0.5',
				underlined:
					'border-b border-border p-0 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-r',
				ghost: 'gap-1 p-0',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export const tabsTriggerVariants = cva(
	'relative z-10 inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'rounded-sm data-[state=active]:text-foreground hover:text-foreground/80',
				pill: 'rounded-md data-[state=active]:text-foreground hover:text-foreground/80',
				underlined: 'rounded-none data-[state=active]:text-foreground hover:text-foreground/80',
				ghost: 'rounded-md data-[state=active]:text-accent-foreground hover:text-accent-foreground',
			},
			size: {
				sm: 'text-xs',
				default: 'text-sm',
			},
		},
		compoundVariants: [
			// Padding pairs size with variant — underlined needs vertical padding to fit the indicator.
			{ variant: 'default', size: 'sm', class: 'px-2 py-1 min-h-7' },
			{ variant: 'default', size: 'default', class: 'px-3 py-1.5 min-h-8' },
			{ variant: 'pill', size: 'sm', class: 'px-2 py-1 min-h-7' },
			{ variant: 'pill', size: 'default', class: 'px-3 py-1.5 min-h-8' },
			{ variant: 'underlined', size: 'sm', class: 'px-3 pb-2 pt-1.5 min-h-8' },
			{ variant: 'underlined', size: 'default', class: 'px-4 pb-3 pt-2 min-h-10' },
			{ variant: 'ghost', size: 'sm', class: 'px-2 py-1 min-h-7' },
			{ variant: 'ghost', size: 'default', class: 'px-3 py-1.5 min-h-8' },
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const tabsIndicatorVariants = cva('absolute transition-all duration-200 ease-out', {
	variants: {
		variant: {
			default: 'rounded-sm bg-background shadow-xs',
			pill: 'rounded-md bg-background shadow-xs',
			underlined: 'bg-primary rounded-full',
			ghost: 'rounded-md bg-accent',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export const tabsContentVariants = cva(
	'mt-2 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:rounded-sm',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type TabsListVariants = VariantProps<typeof tabsListVariants>;
export type TabsVariant = NonNullable<TabsListVariants['variant']>;
export type TabsTriggerVariants = VariantProps<typeof tabsTriggerVariants>;
