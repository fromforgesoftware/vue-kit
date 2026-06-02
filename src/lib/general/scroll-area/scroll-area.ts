import { cva, type VariantProps } from 'class-variance-authority';

export const scrollAreaVariants = cva('relative overflow-hidden', {
	variants: {},
	defaultVariants: {},
});

export const scrollAreaViewportVariants = cva(
	'h-full w-full rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>div]:!block',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const scrollAreaScrollbarVariants = cva(
	`flex touch-none select-none transition-colors duration-150
   data-[state=visible]:opacity-100 data-[state=hidden]:opacity-0
   hover:bg-accent/40`,
	{
		variants: {
			orientation: {
				vertical: 'h-full w-2.5 border-l border-l-transparent p-px',
				horizontal: 'h-2.5 flex-col border-t border-t-transparent p-px',
			},
		},
		defaultVariants: {
			orientation: 'vertical',
		},
	},
);

export const scrollAreaThumbVariants = cva(
	'bg-border hover:bg-muted-foreground/60 relative flex-1 rounded-full transition-colors',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type ScrollAreaVariants = VariantProps<typeof scrollAreaVariants>;
export type ScrollAreaScrollbarVariants = VariantProps<typeof scrollAreaScrollbarVariants>;
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';
