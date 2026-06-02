import { cva, type VariantProps } from 'class-variance-authority';

export const tooltipContentVariants = cva(
	`bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95
   data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
   data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
   data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
   relative z-60 max-w-70 rounded-md border px-3 py-1.5 text-xs`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type TooltipContentVariants = VariantProps<typeof tooltipContentVariants>;
