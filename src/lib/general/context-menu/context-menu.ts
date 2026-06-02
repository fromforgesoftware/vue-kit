import { cva, type VariantProps } from 'class-variance-authority';

export const contextMenuContentVariants = cva(
	`relative z-60 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none
   will-change-[opacity,transform]
   data-[state=open]:animate-in data-[state=closed]:animate-out
   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`,
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

export const contextMenuItemVariants = cva(
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

export const contextMenuCheckboxItemVariants = cva(
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

export const contextMenuRadioItemVariants = cva(
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

export const contextMenuLabelVariants = cva(
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

export const contextMenuSeparatorVariants = cva('-mx-1 my-1 h-px bg-border', {
	variants: {},
	defaultVariants: {},
});

export const contextMenuShortcutVariants = cva(
	'ml-auto text-xs tracking-widest text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const contextMenuSubTriggerVariants = cva(
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

export const contextMenuSubContentVariants = cva(
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

export type ContextMenuContentVariants = VariantProps<typeof contextMenuContentVariants>;
export type ContextMenuContentSize = NonNullable<ContextMenuContentVariants['size']>;
export type ContextMenuItemVariants = VariantProps<typeof contextMenuItemVariants>;
export type ContextMenuItemVariant = NonNullable<ContextMenuItemVariants['variant']>;
export type ContextMenuLabelVariants = VariantProps<typeof contextMenuLabelVariants>;
