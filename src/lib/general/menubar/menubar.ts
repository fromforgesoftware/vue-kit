import { cva, type VariantProps } from 'class-variance-authority';

export const menubarVariants = cva(
	'flex items-center gap-1 rounded-md border border-border bg-background p-1',
	{
		variants: {
			size: {
				sm: 'h-8 text-xs',
				default: 'h-9 text-sm',
				lg: 'h-10 text-base',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const menubarTriggerVariants = cva(
	`flex cursor-pointer select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none
   focus:bg-accent focus:text-accent-foreground
   focus-visible:ring-2 focus-visible:ring-ring/50
   data-[state=open]:bg-accent data-[state=open]:text-accent-foreground
   data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const menubarContentVariants = cva(
	`relative z-60 max-h-(--reka-menubar-content-available-height) min-w-[12rem]
   origin-(--reka-menubar-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md
   border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none
   data-[state=open]:animate-in data-[state=closed]:animate-out
   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
   data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
   data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const menubarItemVariants = cva(
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

export const menubarCheckboxItemVariants = cva(
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

export const menubarRadioItemVariants = cva(
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

export const menubarLabelVariants = cva(
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

export const menubarSeparatorVariants = cva('-mx-1 my-1 h-px bg-border', {
	variants: {},
	defaultVariants: {},
});

export const menubarShortcutVariants = cva(
	'ml-auto text-xs tracking-widest text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const menubarSubTriggerVariants = cva(
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

export const menubarSubContentVariants = cva(
	`relative z-60 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1
   text-popover-foreground shadow-lg outline-none
   data-[state=open]:animate-in data-[state=closed]:animate-out
   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type MenubarVariants = VariantProps<typeof menubarVariants>;
export type MenubarSize = NonNullable<MenubarVariants['size']>;
export type MenubarContentVariants = VariantProps<typeof menubarContentVariants>;
export type MenubarItemVariants = VariantProps<typeof menubarItemVariants>;
export type MenubarItemVariant = NonNullable<MenubarItemVariants['variant']>;
export type MenubarLabelVariants = VariantProps<typeof menubarLabelVariants>;
