import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

/**
 * Alert-dialog visual tone. `destructive-confirm` renders an extra confirmation
 * input the user must type — used for irreversible actions (delete user, etc.).
 */
export type AlertDialogVariant = 'default' | 'destructive' | 'destructive-confirm';

/** Injection key — `AlertDialog` provides this so child sub-components inherit the tone. */
export const ALERT_DIALOG_VARIANT_KEY: InjectionKey<Ref<AlertDialogVariant>> =
	Symbol('alert-dialog-variant');

export const alertDialogOverlayVariants = cva(
	`data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   fixed inset-0 z-60 bg-foreground/50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

/**
 * AlertDialog is non-dismissible by Escape / overlay click — forces a deliberate
 * Cancel / Action choice. Focus trap is on by default (Reka).
 */
export const alertDialogContentVariants = cva(
	`bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
   fixed top-1/2 left-1/2 z-60 flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2
   flex-col gap-4 rounded-xl border p-6 shadow-lg duration-200
   focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`,
	{
		variants: {
			size: {
				sm: 'sm:max-w-sm',
				default: 'sm:max-w-md',
				lg: 'sm:max-w-2xl',
				xl: 'sm:max-w-4xl',
				full: 'sm:max-w-[calc(100%-4rem)]',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const alertDialogHeaderVariants = cva('flex items-start gap-4', {
	variants: {},
	defaultVariants: {},
});

export const alertDialogFooterVariants = cva(
	'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const alertDialogTitleVariants = cva('text-base font-semibold leading-snug', {
	variants: {},
	defaultVariants: {},
});

export const alertDialogDescriptionVariants = cva('text-sm text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const alertDialogConfirmInputVariants = cva('relative', {
	variants: {},
	defaultVariants: {},
});

export const alertDialogConfirmInputFieldVariants = cva(
	`border-input placeholder:text-muted-foreground
   flex h-8 w-full min-w-0 rounded-md border bg-transparent
   py-2 pl-9 pr-3 text-sm
   transition-[color,box-shadow] outline-none
   focus:ring-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-inset focus-visible:ring-primary focus-visible:border-primary
   disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export const alertDialogConfirmInputIconVariants = cva(
	'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-destructive',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type AlertDialogContentVariants = VariantProps<typeof alertDialogContentVariants>;
export type AlertDialogSize = NonNullable<AlertDialogContentVariants['size']>;
