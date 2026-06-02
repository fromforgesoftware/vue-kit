import { cva, type VariantProps } from 'class-variance-authority';

/** Root wrapper for {@link Autocomplete}. Width is fluid; positioning is via Reka. */
export const autocompleteVariants = cva('relative w-full', {
	variants: {},
	defaultVariants: {},
});

/**
 * Visible input container. Mirrors {@link inputWrapperVariants} sizes so an
 * Autocomplete drops cleanly into a form alongside Inputs of the same size.
 *
 * Single-row layout: chips stay on one line. The chip+input region is clipped via the
 * inner wrapper inside Autocomplete.vue so the clear and trigger buttons on the right
 * always stay visible — the anchor itself does NOT clip its contents.
 */
export const autocompleteAnchorVariants = cva(
	[
		'flex w-full items-center gap-1 rounded-md border border-input bg-background px-3',
		'text-sm transition-[color,box-shadow] outline-none',
		'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/50',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
		'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 py-0',
				default: 'h-8 py-1',
				lg: 'h-10 py-2',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const autocompleteContentVariants = cva(
	[
		'absolute z-60 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover',
		'text-popover-foreground shadow-md',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
	].join(' '),
	{
		variants: {},
		defaultVariants: {},
	},
);

export const autocompleteViewportVariants = cva('p-1 max-h-[260px] overflow-auto', {
	variants: {},
	defaultVariants: {},
});

// Item — `min-h-7` ensures every option is ≥ 24×24 (WCAG 2.5.8) and gives the
// description a comfortable second line.
export const autocompleteItemVariants = cva(
	[
		'relative flex w-full min-h-7 cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8',
		'text-sm outline-none',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
	].join(' '),
	{
		variants: {},
		defaultVariants: {},
	},
);

export const autocompleteEmptyVariants = cva('py-6 text-center text-sm text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const autocompleteLoadingVariants = cva('flex items-center justify-center py-4', {
	variants: {},
	defaultVariants: {},
});

export const autocompleteLabelVariants = cva(
	'px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const autocompleteSeparatorVariants = cva('-mx-1 my-1 h-px bg-border', {
	variants: {},
	defaultVariants: {},
});

export type AutocompleteVariants = VariantProps<typeof autocompleteVariants>;
export type AutocompleteAnchorVariants = VariantProps<typeof autocompleteAnchorVariants>;
export type AutocompleteSize = NonNullable<AutocompleteAnchorVariants['size']>;

export interface AutocompleteOption {
	value: string;
	label: string;
	/** Optional second-line caption (e.g. employee external ID, group description). */
	description?: string;
	disabled?: boolean;
}

export interface AutocompleteOptionGroup {
	label: string;
	options: AutocompleteOption[];
}

/** A single page of options returned by an {@link AutocompleteFetcher}. */
export interface AutocompleteFetchPage {
	items: AutocompleteOption[];
	/** True when more pages exist for the current query. */
	hasMore: boolean;
}

/**
 * Server-fetch contract. Implementations must:
 *  - debounce nothing themselves — the component owns the debounce
 *  - honour `signal.aborted` and bail out if the request is superseded
 *  - return `hasMore: true` when the next page would yield more rows
 */
export type AutocompleteFetcher = (
	query: string,
	page: number,
	signal: AbortSignal,
) => Promise<AutocompleteFetchPage>;

/**
 * Resolves selected value(s) to options for chip / displayValue rendering when those
 * values aren't in the current fetch page (typically on form mount).
 */
export type AutocompleteResolver = (ids: string[]) => Promise<AutocompleteOption[]>;
