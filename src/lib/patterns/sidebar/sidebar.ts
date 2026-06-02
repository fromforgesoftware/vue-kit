import { cva, type VariantProps } from 'class-variance-authority';
import type { ComputedRef, InjectionKey, Ref } from 'vue';

/** Default expanded sidebar width on desktop. */
export const SIDEBAR_WIDTH = '15.5rem';
/** Sidebar width when collapsed to icon-only mode. */
export const SIDEBAR_WIDTH_COLLAPSED = '4rem';
/** Sidebar width on mobile (offcanvas overlay). */
export const SIDEBAR_WIDTH_MOBILE = '18rem';
/** localStorage key persisting the open/closed state across sessions. */
export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
/** Keyboard shortcut (with ⌘ / Ctrl) to toggle the sidebar. */
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/** How the sidebar collapses on desktop — `offcanvas` slides off, `icon` shrinks to icon-only, `none` disables collapse. */
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';
/** Side the sidebar docks to. */
export type SidebarSide = 'left' | 'right';
/** Current visual state — derived from `open` + viewport. */
export type SidebarState = 'expanded' | 'collapsed';

/** Reactive sidebar context exposed to children via {@link SIDEBAR_CONTEXT_KEY}. */
export interface SidebarContext {
	state: ComputedRef<SidebarState>;
	open: Ref<boolean>;
	setOpen: (value: boolean) => void;
	toggleSidebar: () => void;
	openMobile: Ref<boolean>;
	setOpenMobile: (value: boolean) => void;
	isMobile: Ref<boolean>;
	collapsible: ComputedRef<SidebarCollapsible>;
	side: ComputedRef<SidebarSide>;
}

/** Injection key — `SidebarProvider` provides this; children consume via `injectSidebar()`. */
export const SIDEBAR_CONTEXT_KEY: InjectionKey<SidebarContext> = Symbol('sidebar-context');

/** Layout wrapper that pairs a {@link Sidebar} with the page content area. */
export const sidebarProviderVariants = cva(
	'group/sidebar-wrapper flex h-svh w-full bg-sidebar overflow-hidden',
	{ variants: {}, defaultVariants: {} },
);

/** Sidebar container — animates width on collapse / expand. */
export const sidebarVariants = cva(
	`flex h-svh shrink-0 flex-col
   bg-sidebar text-sidebar-foreground transition-[width,min-width,max-width] duration-200 ease-linear`,
	{
		variants: {
			side: {
				left: '',
				right: '',
			},
		},
		defaultVariants: {
			side: 'left',
		},
	},
);

// Gap placeholder reserves layout space when the sidebar is offcanvas/animating.
export const sidebarGapVariants = cva(
	'relative shrink-0 bg-transparent transition-[width,min-width,max-width] duration-200 ease-linear',
	{
		variants: {
			side: {
				left: '',
				right: 'rotate-180',
			},
		},
		defaultVariants: { side: 'left' },
	},
);

export const sidebarHeaderVariants = cva('flex flex-col justify-center gap-2 h-16 px-3', {
	variants: {},
	defaultVariants: {},
});

export const sidebarContentVariants = cva('flex min-h-0 flex-1 flex-col overflow-auto', {
	variants: {},
	defaultVariants: {},
});

export const sidebarFooterVariants = cva('flex flex-col gap-2 px-3 py-3', {
	variants: {},
	defaultVariants: {},
});

export const sidebarGroupVariants = cva('relative flex w-full min-w-0 flex-col px-3 py-2', {
	variants: {},
	defaultVariants: {},
});

export const sidebarGroupLabelVariants = cva(
	`flex h-8 shrink-0 items-center rounded-md px-2
   text-xs font-medium text-sidebar-foreground/70 outline-none
   ring-sidebar-ring focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0`,
	{ variants: {}, defaultVariants: {} },
);

export const sidebarGroupContentVariants = cva('w-full text-sm', {
	variants: {},
	defaultVariants: {},
});

export const sidebarMenuVariants = cva('flex w-full min-w-0 flex-col gap-1', {
	variants: {},
	defaultVariants: {},
});

export const sidebarMenuItemVariants = cva('group/menu-item relative', {
	variants: {},
	defaultVariants: {},
});

export const sidebarMenuButtonVariants = cva(
	`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 cursor-pointer
   text-left text-sm outline-none ring-sidebar-ring
   transition-[width,height,padding] duration-200 ease-linear
   hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
   focus-visible:ring-2
   active:bg-sidebar-accent active:text-sidebar-accent-foreground
   disabled:pointer-events-none disabled:opacity-50
   group-has-[[data-sidebar=menu-action]]/menu-item:pr-8
   aria-disabled:pointer-events-none aria-disabled:opacity-50
   data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium
   data-[active=true]:text-sidebar-accent-foreground
   data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground
   [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0`,
	{
		variants: {
			size: {
				sm: 'h-7 text-xs',
				default: 'h-8 text-sm',
				lg: 'h-12 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const sidebarMenuBadgeVariants = cva(
	`pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center
   justify-center rounded-md px-1 text-xs font-medium tabular-nums
   text-sidebar-foreground
   peer-hover/menu-button:text-sidebar-accent-foreground
   peer-data-[active=true]/menu-button:text-sidebar-accent-foreground`,
	{ variants: {}, defaultVariants: {} },
);

export const sidebarMenuActionVariants = cva(
	`absolute right-1 top-1.5 flex items-center justify-center rounded-md p-0
   text-sidebar-foreground outline-none ring-sidebar-ring
   transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
   focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground
   [&>svg]:size-4 [&>svg]:shrink-0
   after:absolute after:-inset-2 after:md:hidden`,
	{
		variants: {
			showOnHover: {
				true: 'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
				false: '',
			},
		},
		defaultVariants: {
			showOnHover: false,
		},
	},
);

export const sidebarMenuSubVariants = cva(
	`ml-3.5 flex min-w-0 translate-x-px flex-col gap-0 relative pl-2.5 py-0.5
  `,
	{ variants: {}, defaultVariants: {} },
);

export const sidebarMenuSubItemVariants = cva('relative pl-4 py-0.5', {
	variants: {},
	defaultVariants: {},
});

export const sidebarMenuSubButtonVariants = cva(
	`flex h-7 min-w-0 -translate-x-px items-center gap-2 cursor-pointer
   overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none
   ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
   focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground
   disabled:pointer-events-none disabled:opacity-50
   aria-disabled:pointer-events-none aria-disabled:opacity-50
   [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0
   data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground`,
	{
		variants: {
			size: {
				sm: 'text-xs',
				default: 'text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const sidebarSeparatorVariants = cva('mx-2 w-auto bg-sidebar-border', {
	variants: {},
	defaultVariants: {},
});

export const sidebarTriggerVariants = cva('', {
	variants: {},
	defaultVariants: {},
});

export const sidebarRailVariants = cva(
	`absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 cursor-pointer
   transition-all duration-200 ease-linear after:absolute after:inset-y-0 after:left-1/2
   after:w-[2px] hover:after:bg-sidebar-border
   group-data-[side=left]:right-0 group-data-[side=right]:left-0
   sm:flex`,
	{ variants: {}, defaultVariants: {} },
);

export const sidebarInputVariants = cva(
	'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
	{ variants: {}, defaultVariants: {} },
);

export type SidebarMenuButtonVariants = VariantProps<typeof sidebarMenuButtonVariants>;
export type SidebarMenuButtonSize = NonNullable<SidebarMenuButtonVariants['size']>;
export type SidebarMenuSubButtonVariants = VariantProps<typeof sidebarMenuSubButtonVariants>;
export type SidebarMenuSubButtonSize = NonNullable<SidebarMenuSubButtonVariants['size']>;
export type SidebarMenuActionVariants = VariantProps<typeof sidebarMenuActionVariants>;
