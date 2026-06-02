import { cva, type VariantProps } from 'class-variance-authority';

export type TourPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface TourStep {
	/** CSS selector to find the target element, e.g. '[data-tour="sidebar"]' */
	target: string;
	/** Step title */
	title: string;
	/** Step description */
	description?: string;
	/** Preferred placement of the card relative to target */
	placement?: TourPlacement;
	/** Extra offset in px from target (default 12) */
	offset?: number;
	/** Action to run when this step becomes active */
	onActivate?: () => void | Promise<void>;
}

export const tourCardVariants = cva(
	`z-[51] w-[calc(100vw-2rem)] sm:w-80 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg
   animate-in fade-in-0 zoom-in-95
   data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
   data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type TourCardVariants = VariantProps<typeof tourCardVariants>;

export const tourCardTitleVariants = cva('text-sm font-semibold leading-none', {
	variants: {},
	defaultVariants: {},
});

export const tourCardDescriptionVariants = cva('mt-1.5 text-sm text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const tourCardFooterVariants = cva('mt-4 flex items-center justify-between', {
	variants: {},
	defaultVariants: {},
});

export const tourCardCounterVariants = cva('text-xs tabular-nums text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});
