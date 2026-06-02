import { cva, type VariantProps } from 'class-variance-authority';

// `flex justify-center` without `w-full` so the component sizes to its
// content. Inside flex parents (e.g. DataTable footer with `justify-between`)
// `w-full` would force it to claim 100 % of the row and push siblings below
// on narrow viewports. Standalone consumers can wrap in a centered container
// if they want centered behaviour.
export const paginationVariants = cva('flex justify-center', {
	variants: {},
	defaultVariants: {},
});

export const paginationContentVariants = cva('flex flex-row items-center gap-2', {
	variants: {},
	defaultVariants: {},
});

export const paginationItemVariants = cva('', {
	variants: {},
	defaultVariants: {},
});

// Matches Button outline + icon size (size-8, border, no shadow)
export const paginationLinkVariants = cva(
	`inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-input
   bg-background text-sm font-medium transition-colors outline-none
   hover:bg-accent hover:text-accent-foreground
   focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-inset focus-visible:ring-primary focus-visible:border-primary
   disabled:pointer-events-none disabled:opacity-50`,
	{
		variants: {
			isActive: {
				true: 'bg-accent text-accent-foreground',
				false: '',
			},
		},
		defaultVariants: {
			isActive: false,
		},
	},
);

export const paginationPreviousVariants = cva(
	`inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-input
   bg-background text-sm font-medium transition-colors outline-none
   hover:bg-accent hover:text-accent-foreground
   focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-inset focus-visible:ring-primary focus-visible:border-primary
   disabled:pointer-events-none disabled:opacity-50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const paginationNextVariants = cva(
	`inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-input
   bg-background text-sm font-medium transition-colors outline-none
   hover:bg-accent hover:text-accent-foreground
   focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-inset focus-visible:ring-primary focus-visible:border-primary
   disabled:pointer-events-none disabled:opacity-50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const paginationEllipsisVariants = cva('flex size-8 items-center justify-center', {
	variants: {},
	defaultVariants: {},
});

export type PaginationVariants = VariantProps<typeof paginationVariants>;
export type PaginationLinkVariants = VariantProps<typeof paginationLinkVariants>;
