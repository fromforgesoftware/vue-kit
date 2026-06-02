import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerContext {
	/** Whether the drawer is currently open */
	isOpen: Ref<boolean>;
	/** Whether the drawer DOM should be visible (stays true during exit animation) */
	isVisible: Ref<boolean>;
	/** Ordered panel name stack – first entry is always the root */
	stack: Ref<string[]>;
	/** Panel name currently entering (animating in). Null when idle. */
	entering: Ref<string | null>;
	/** Panel name currently leaving (animating out). Null when idle. */
	leaving: Ref<string | null>;
	/** Whether the drawer is closing (exit animation in progress) */
	isClosing: Ref<boolean>;
	/** Side the drawer slides in from */
	side: Ref<DrawerSide>;
	/** Push a named panel onto the stack */
	pushStep: (name: string) => void;
	/** Pop the top-most panel (back navigation) */
	popStep: () => void;
	/** Close the entire drawer */
	closeAll: () => void;
	/** Open the drawer (shows the root panel) */
	open: () => void;
}

export const drawerKey: InjectionKey<DrawerContext> = Symbol('drawer');

// Provided by DrawerPanel; consumed by DrawerTitle so the title can register itself
// against the panel for `aria-labelledby` wiring.
export interface DrawerPanelContext {
	/** Stable id used by DrawerTitle's `id` attribute and DrawerPanel's `aria-labelledby`. */
	titleId: string;
	/** Set to true by DrawerTitle on mount so the panel knows a visible title is present. */
	registerTitle: () => void;
	/** Set to false by DrawerTitle on unmount. */
	unregisterTitle: () => void;
}

export const drawerPanelKey: InjectionKey<DrawerPanelContext> = Symbol('drawer-panel');

/**
 * Provided by a `<Drawer>` when it detects it is rendered inside another
 * `<Drawer>`. Lets nested children (DrawerPanel name auto-default,
 * DrawerClose step-scoped close) discover that they live inside a host
 * drawer and adapt accordingly without consumer-side changes.
 */
export interface NestedDrawerContext {
	/** Stable step name pushed onto the parent's stack when this drawer opens. */
	stepName: string;
}

export const nestedDrawerKey: InjectionKey<NestedDrawerContext> = Symbol('drawer-nested');

/** How many pixels of a pushed-back panel peek out from behind */
export const PANEL_PEEK_PX = 48;
/** Gap between stacked panels */
export const PANEL_GAP_PX = 16;
/** Transition duration in ms — paired with the drawer's `data-state` keyframes; tune both together. */
export const TRANSITION_MS = 450;

/** Backdrop behind the drawer. Closes on click. */
export const drawerOverlayVariants = cva('fixed inset-0 z-50 bg-foreground/60 transition-opacity', {
	variants: {},
	defaultVariants: {},
});

/**
 * Drawer panel. `side` chooses which edge it docks to; `size` controls the
 * cross-axis dimension. Below 640px every side renders full-bleed (mobile sheet).
 */
export const drawerPanelVariants = cva(
	`fixed flex flex-col border bg-background text-foreground shadow-2xl
   focus-visible:outline-none
   max-sm:inset-0 max-sm:w-full max-sm:rounded-none`,
	{
		variants: {
			side: {
				right: 'sm:top-4 sm:bottom-4 sm:right-4 sm:rounded-2xl',
				left: 'sm:top-4 sm:bottom-4 sm:left-4 sm:rounded-2xl',
				top: 'sm:top-4 sm:left-4 sm:right-4 sm:rounded-2xl',
				bottom: 'sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-2xl',
			},
			size: {
				sm: '',
				md: '',
				lg: '',
				xl: '',
				full: '',
			},
		},
		compoundVariants: [
			// Side: left/right — size controls width
			{ side: 'right', size: 'sm', class: 'sm:w-1/3 sm:max-w-sm' },
			{ side: 'right', size: 'md', class: 'sm:w-3/4 sm:max-w-md' },
			{ side: 'right', size: 'lg', class: 'sm:w-3/4 sm:max-w-lg' },
			{ side: 'right', size: 'xl', class: 'sm:w-3/4 sm:max-w-2xl' },
			{ side: 'right', size: 'full', class: 'sm:w-[calc(100%-2rem)]' },
			{ side: 'left', size: 'sm', class: 'sm:w-1/3 sm:max-w-sm' },
			{ side: 'left', size: 'md', class: 'sm:w-3/4 sm:max-w-md' },
			{ side: 'left', size: 'lg', class: 'sm:w-3/4 sm:max-w-lg' },
			{ side: 'left', size: 'xl', class: 'sm:w-3/4 sm:max-w-2xl' },
			{ side: 'left', size: 'full', class: 'sm:w-[calc(100%-2rem)]' },
			// Side: top/bottom — size controls height
			{ side: 'top', size: 'sm', class: 'sm:h-1/4 sm:max-h-64' },
			{ side: 'top', size: 'md', class: 'sm:h-1/2 sm:max-h-96' },
			{ side: 'top', size: 'lg', class: 'sm:h-2/3' },
			{ side: 'top', size: 'xl', class: 'sm:h-3/4' },
			{ side: 'top', size: 'full', class: 'sm:h-[calc(100%-2rem)]' },
			{ side: 'bottom', size: 'sm', class: 'sm:h-1/4 sm:max-h-64' },
			{ side: 'bottom', size: 'md', class: 'sm:h-1/2 sm:max-h-96' },
			{ side: 'bottom', size: 'lg', class: 'sm:h-2/3' },
			{ side: 'bottom', size: 'xl', class: 'sm:h-3/4' },
			{ side: 'bottom', size: 'full', class: 'sm:h-[calc(100%-2rem)]' },
		],
		defaultVariants: {
			side: 'right',
			size: 'md',
		},
	},
);

export const drawerHeaderVariants = cva('flex flex-col gap-3 border-b px-6 py-5 text-left', {
	variants: {},
	defaultVariants: {},
});

export const drawerBodyVariants = cva('flex-1 overflow-y-auto px-6 py-4', {
	variants: {},
	defaultVariants: {},
});

export const drawerFooterVariants = cva(
	'flex flex-col-reverse gap-3 rounded-b-2xl border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end max-sm:rounded-b-none',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const drawerTitleVariants = cva('text-xl font-semibold leading-none', {
	variants: {},
	defaultVariants: {},
});

export const drawerBackVariants = cva(
	`inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors
   hover:text-foreground
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:rounded
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const drawerCloseVariants = cva(
	`absolute top-5 right-5 inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors
   hover:bg-accent hover:text-foreground
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type DrawerPanelVariants = VariantProps<typeof drawerPanelVariants>;
export type DrawerSize = NonNullable<DrawerPanelVariants['size']>;
