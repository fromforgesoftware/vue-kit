import { cva } from 'class-variance-authority';

export type UnsavedChangesMode = 'dialog' | 'banner';

export const unsavedChangesBannerVariants = cva([
	'pointer-events-none fixed inset-x-0 bottom-0 z-50',
	'flex items-center justify-center pb-4',
	'animate-in slide-in-from-bottom-4 fade-in-0 duration-300',
]);

export const unsavedChangesBannerInnerVariants = cva([
	'pointer-events-auto flex items-center',
	'divide-x divide-background/20',
	'rounded-xl border border-background/20',
	'bg-foreground px-2 sm:px-4 py-1 shadow-lg',
]);

export const unsavedChangesBannerInfoVariants = cva(['flex items-center gap-3 pr-3']);

export const unsavedChangesBannerIconWrapperVariants = cva([
	'flex items-center justify-center',
	'size-8 rounded-full',
	'bg-background text-foreground',
]);

export const unsavedChangesBannerTitleVariants = cva(['text-sm font-medium text-background']);

export const unsavedChangesBannerActionsVariants = cva(['flex items-center gap-2 px-3']);

export const unsavedChangesBannerButtonVariants = cva([
	'inline-flex items-center justify-center',
	'rounded-md px-3 py-1.5',
	'text-sm font-medium',
	'text-background',
	'transition-colors',
	'hover:bg-background/20 hover:text-background',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
]);
