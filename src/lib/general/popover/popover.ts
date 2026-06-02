import { cva, type VariantProps } from 'class-variance-authority';

export const popoverContentVariants = cva(
	// `max-w-[min(var(--reka-popover-content-available-width),20rem)]` clamps
	// the popover to the viewport on narrow screens. Reka exposes the available
	// width as a CSS var; without this clamp the fixed `w-72`/`w-80`/`w-96`
	// sizes overflow at 320 px.
	`relative z-60 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none
   max-w-[min(var(--reka-popover-content-available-width),20rem)]
   data-[state=open]:animate-in data-[state=closed]:animate-out
   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
   data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
   data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
	{
		variants: {
			size: {
				sm: 'w-56',
				default: 'w-72',
				lg: 'w-80',
				xl: 'w-96',
				auto: 'w-auto max-w-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const popoverCloseVariants = cva(
	`absolute top-2 right-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors
   hover:bg-accent hover:text-foreground
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type PopoverContentVariants = VariantProps<typeof popoverContentVariants>;
export type PopoverSize = NonNullable<PopoverContentVariants['size']>;
