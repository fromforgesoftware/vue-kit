import { cva } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

export interface CommandPaletteContext {
	/** Current search query */
	search: Ref<string>;
	/** Filter function — returns true if the item value matches the query */
	filter: (value: string, search: string) => boolean;
	/** Currently active submenu ID (null = root) */
	activeSubmenu: Ref<string | null>;
	/** Label of the active submenu (for the back button) */
	submenuLabel: Ref<string | null>;
	/** Push a submenu into view */
	pushSubmenu: (id: string, label: string) => void;
	/** Pop back to root */
	popSubmenu: () => void;
	/** Number of currently visible items (used by CommandPaletteEmpty) */
	visibleCount: Ref<number>;
	/** Called by CommandPaletteItem when it becomes visible */
	incrementVisible: () => void;
	/** Called by CommandPaletteItem when it becomes hidden or unmounts */
	decrementVisible: () => void;
	/** Recently selected item values, persisted to sessionStorage */
	recentValues: Ref<string[]>;
	/** Record an item selection — called automatically by CommandPaletteItem on select */
	recordSelection: (value: string) => void;
	/** The currently highlighted item value (unified for keyboard + hover) */
	highlightedValue: Ref<string | null>;
	/** Set the highlighted item — called by items on hover and by input on arrow keys */
	setHighlight: (value: string | null) => void;
	/** Remove a single item from recents */
	removeSelection: (value: string) => void;
	/** Clear all recent selections */
	clearSelections: () => void;
}

export const COMMAND_PALETTE_KEY: InjectionKey<CommandPaletteContext> = Symbol('command-palette');
export const COMMAND_PALETTE_SUB_ID_KEY: InjectionKey<string> = Symbol('command-palette-sub-id');

export interface CommandPaletteGroupContext {
	incrementVisible: () => void;
	decrementVisible: () => void;
}

export const COMMAND_PALETTE_GROUP_KEY: InjectionKey<CommandPaletteGroupContext> =
	Symbol('command-palette-group');

export const commandPaletteVariants = cva(
	'flex flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground',
	{ variants: {}, defaultVariants: {} },
);

export const commandPaletteInputWrapperVariants = cva('flex items-center border-b', {
	variants: {},
	defaultVariants: {},
});

export const commandPaletteInputVariants = cva(
	`flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none
   placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50`,
	{ variants: {}, defaultVariants: {} },
);

export const commandPaletteListVariants = cva(
	'max-h-[300px] overflow-y-auto overflow-x-hidden p-1',
	{ variants: {}, defaultVariants: {} },
);

export const commandPaletteEmptyVariants = cva('py-6 text-center text-sm text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const commandPaletteGroupVariants = cva(
	`[&_[data-command-group-heading]]:px-2 [&_[data-command-group-heading]]:py-1.5
   [&_[data-command-group-heading]]:text-xs [&_[data-command-group-heading]]:font-medium
   [&_[data-command-group-heading]]:text-muted-foreground`,
	{ variants: {}, defaultVariants: {} },
);

export const commandPaletteItemVariants = cva(
	`relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none
   data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground
   data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
	{ variants: {}, defaultVariants: {} },
);

export const commandPaletteSeparatorVariants = cva('-mx-1 my-1 h-px bg-border', {
	variants: {},
	defaultVariants: {},
});

export const commandPaletteFooterVariants = cva(
	'flex items-center border-t px-3 py-2.5 text-[11px] text-muted-foreground shrink-0 select-none gap-1.5',
	{ variants: {}, defaultVariants: {} },
);
