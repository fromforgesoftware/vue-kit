import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

/** Breadcrumb visual variant — currently only `default`; reserved for future tones. */
export type BreadcrumbVariant = 'default';

/** Injection key — `Breadcrumb` provides this so child sub-components inherit the variant. */
export const BREADCRUMB_VARIANT_KEY: InjectionKey<Ref<BreadcrumbVariant>> =
	Symbol('breadcrumb-variant');

/** Breadcrumb root nav. Wraps on small viewports. */
export const breadcrumbVariants = cva(
	'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
	{ variants: {}, defaultVariants: {} },
);

export const breadcrumbListVariants = cva(
	'flex flex-wrap items-center gap-1.5 break-words sm:gap-2.5',
	{ variants: {}, defaultVariants: {} },
);

export const breadcrumbItemVariants = cva('inline-flex items-center gap-1.5', {
	variants: {},
	defaultVariants: {},
});

// Focus-visible ring is applied via the same token system used elsewhere.
// Hit area: at least the size of the body text — rely on the surrounding row
// (gap-1.5) to leave clearance for ≥ 24 px target via padding.
export const breadcrumbLinkVariants = cva(
	'inline-flex items-center gap-1 rounded-sm px-0.5 py-0.5 -mx-0.5 transition-colors hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
	{
		variants: {
			active: {
				true: 'text-foreground font-normal pointer-events-none',
				false: '',
			},
		},
		defaultVariants: { active: false },
	},
);

export const breadcrumbSeparatorVariants = cva(
	'inline-flex items-center [&>svg]:size-3.5 text-muted-foreground',
	{ variants: {}, defaultVariants: {} },
);

export const breadcrumbEllipsisVariants = cva(
	'inline-flex h-6 w-6 items-center justify-center text-muted-foreground',
	{ variants: {}, defaultVariants: {} },
);

export const breadcrumbPageVariants = cva('font-normal text-foreground', {
	variants: {},
	defaultVariants: {},
});

export type BreadcrumbVariants = VariantProps<typeof breadcrumbVariants>;
export type BreadcrumbLinkVariants = VariantProps<typeof breadcrumbLinkVariants>;

export interface BreadcrumbItem {
	label: string;
	href?: string;
}
