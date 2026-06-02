import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

/** Dialog visual variant — currently only `default`; reserved for future use. */
export type DialogVariant = 'default';

/** Injection key — `Dialog` provides this so child sub-components inherit the variant. */
export const DIALOG_VARIANT_KEY: InjectionKey<Ref<DialogVariant>> = Symbol('dialog-variant');

/** Backdrop overlay shown behind the dialog. */
export const dialogOverlayVariants = cva(
	`data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   fixed inset-0 z-60 bg-foreground/50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

/**
 * Dialog content panel. Mobile (< 640px) collapses to a bottom sheet with a
 * drag-to-dismiss handle; desktop centred modal is reserved for `sm:` and up.
 */
export const dialogContentVariants = cva(
	`bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   fixed z-60 flex w-full flex-col overflow-hidden border shadow-lg duration-200
   focus-visible:outline-none
   sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95
   sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-[calc(100%-2rem)] sm:max-h-[85vh] sm:rounded-xl
   max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0
   max-sm:max-h-[90dvh] max-sm:max-w-full max-sm:rounded-t-2xl max-sm:rounded-b-none
   max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom`,
	{
		variants: {
			size: {
				sm: 'sm:max-w-sm',
				default: 'sm:max-w-lg',
				lg: 'sm:max-w-2xl',
				xl: 'sm:max-w-4xl',
				full: 'sm:max-w-[calc(100%-4rem)]',
			},
			// Padding helper for consumers who need to render bare content (e.g. an
			// image gallery) without the standard Header/Body/Footer chrome.
			padded: {
				true: 'p-6',
				false: '',
			},
		},
		defaultVariants: {
			size: 'default',
			padded: false,
		},
	},
);

export const dialogHeaderVariants = cva(
	'flex-none flex flex-col gap-1.5 border-b px-6 pt-5 pb-4 pr-14',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const dialogBodyVariants = cva('min-h-0 flex-1 overflow-y-auto px-6 py-5', {
	variants: {},
	defaultVariants: {},
});

export const dialogFooterVariants = cva(
	'flex-none flex flex-row items-center justify-end gap-3 rounded-b-xl border-t bg-muted/40 px-6 py-4 max-sm:rounded-b-none',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const dialogTitleVariants = cva('text-xl font-semibold leading-none', {
	variants: {},
	defaultVariants: {},
});

export const dialogDescriptionVariants = cva('text-sm text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const dialogCloseVariants = cva(
	`absolute top-5 right-5 inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors
   max-sm:hidden
   hover:bg-accent hover:text-foreground
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type DialogContentVariants = VariantProps<typeof dialogContentVariants>;
export type DialogSize = NonNullable<DialogContentVariants['size']>;
