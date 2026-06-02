import { cva, type VariantProps } from 'class-variance-authority';

export { toast } from 'vue-sonner';
export type { ToasterProps, ExternalToast, ToastT, Action } from 'vue-sonner';

export type ToastPosition =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'bottom-center';

export type ToastTheme = 'light' | 'dark' | 'system';

export const toasterVariants = cva('toaster', {
	variants: {},
	defaultVariants: {},
});

export type ToasterVariants = VariantProps<typeof toasterVariants>;
