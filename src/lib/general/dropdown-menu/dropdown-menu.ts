import { cva, type VariantProps } from 'class-variance-authority';

export const dropdownMenuContentVariants = cva(
	// `max-w-[min(var(--reka-dropdown-menu-content-available-width),20rem)]`
	// clamps the menu width to the viewport on narrow screens. Reka exposes the
	// available width as a CSS var; without it `min-w-[18rem]` (lg) overflows
	// at 320 px. The matching `max-h-(...available-height)` + `overflow-y-auto`
	// does the same for tall lists (e.g. 50 US states) so the menu scrolls
	// instead of running past the viewport edge.
	`relative z-60 overflow-y-auto overflow-x-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none
   max-w-[min(var(--reka-dropdown-menu-content-available-width),20rem)]
   max-h-[min(24rem,var(--reka-dropdown-menu-content-available-height))]
   will-change-[opacity,transform]
   data-[state=open]:animate-in data-[state=closed]:animate-out
   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
   data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
   data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
	{
		variants: {
			size: {
				sm: 'min-w-[10rem]',
				default: 'min-w-[14rem]',
				lg: 'min-w-[18rem]',
				auto: 'min-w-fit',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const dropdownMenuItemVariants = cva(
	`relative flex min-h-6 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none
   focus:bg-accent focus:text-accent-foreground
   focus-visible:ring-2 focus-visible:ring-ring/50
   data-[disabled]:pointer-events-none data-[disabled]:opacity-50
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4
   [&_svg:not([class*='text-'])]:text-muted-foreground`,
	{
		variants: {
			variant: {
				default: '',
				destructive: `text-destructive
          focus:bg-destructive/10 focus:text-destructive
          [&_svg:not([class*='text-'])]:text-destructive`,
			},
			inset: {
				true: 'pl-8',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			inset: false,
		},
	},
);

export const dropdownMenuCheckboxItemVariants = cva(
	`relative flex min-h-6 cursor-default select-none items-center gap-2
   rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors
   focus:bg-accent focus:text-accent-foreground
   focus-visible:ring-2 focus-visible:ring-ring/50
   data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const dropdownMenuRadioItemVariants = cva(
	`relative flex min-h-6 cursor-default select-none items-center gap-2
   rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors
   focus:bg-accent focus:text-accent-foreground
   focus-visible:ring-2 focus-visible:ring-ring/50
   data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const dropdownMenuLabelVariants = cva(
	'px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
	{
		variants: {
			inset: {
				true: 'pl-8',
				false: '',
			},
		},
		defaultVariants: {
			inset: false,
		},
	},
);

export const dropdownMenuSeparatorVariants = cva('-mx-1 my-1 h-px bg-border', {
	variants: {},
	defaultVariants: {},
});

export const dropdownMenuShortcutVariants = cva(
	'ml-auto text-xs tracking-widest text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const dropdownMenuSubTriggerVariants = cva(
	`flex min-h-6 cursor-default select-none items-center gap-2
   rounded-sm px-2 py-1.5 text-sm outline-none
   focus:bg-accent focus:text-accent-foreground
   focus-visible:ring-2 focus-visible:ring-ring/50
   data-[state=open]:bg-accent data-[state=open]:text-accent-foreground
   [&>svg]:size-4 [&>svg]:shrink-0`,
	{
		variants: {
			inset: {
				true: 'pl-8',
				false: '',
			},
		},
		defaultVariants: {
			inset: false,
		},
	},
);

export const dropdownMenuSubContentVariants = cva(
	`relative z-60 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border border-border bg-popover p-1
   text-popover-foreground shadow-lg outline-none
   max-h-[min(24rem,var(--reka-dropdown-menu-content-available-height))]
   data-[state=open]:animate-in data-[state=closed]:animate-out
   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type DropdownMenuContentVariants = VariantProps<typeof dropdownMenuContentVariants>;
export type DropdownMenuContentSize = NonNullable<DropdownMenuContentVariants['size']>;
export type DropdownMenuItemVariants = VariantProps<typeof dropdownMenuItemVariants>;
export type DropdownMenuItemVariant = NonNullable<DropdownMenuItemVariants['variant']>;
export type DropdownMenuLabelVariants = VariantProps<typeof dropdownMenuLabelVariants>;
