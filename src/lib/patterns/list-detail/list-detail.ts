import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Responsive master–detail layout primitives.
 *
 * `ListDetail` is a two-pane shell: a selectable list (the "master") on the
 * left and a detail panel on the right. On wide viewports both panes show
 * side-by-side (resizable via the kit Splitter); on narrow viewports it
 * collapses to a single column that drills down — list first, then the detail
 * slides in with a back affordance.
 *
 * The breakpoint at which the layout switches from drill-down to two-pane.
 * Matches the `useResponsive` semantic helpers.
 */
export type ListDetailBreakpoint = 'sm' | 'md' | 'lg';

export const listDetailVariants = cva('flex h-full min-h-0 w-full', {
	variants: {},
	defaultVariants: {},
});

/**
 * A single selectable row in the master list. `active` lifts the row with the
 * accent surface so the current selection reads clearly against the rail.
 */
export const listDetailItemVariants = cva(
	[
		'group/list-item flex w-full items-center gap-3 rounded-md px-2 py-2 text-left',
		'transition-colors outline-none',
		'focus-visible:ring-2 focus-visible:ring-ring',
		'disabled:pointer-events-none disabled:opacity-50',
	],
	{
		variants: {
			active: {
				true: 'bg-accent text-accent-foreground',
				false: 'hover:bg-accent/50',
			},
		},
		defaultVariants: {
			active: false,
		},
	},
);

export const listDetailHeaderVariants = cva(
	'flex items-center gap-4 border-b border-border px-4 py-4 sm:px-6',
);

export type ListDetailVariants = VariantProps<typeof listDetailVariants>;
export type ListDetailItemVariants = VariantProps<typeof listDetailItemVariants>;
