import { cva } from 'class-variance-authority';
import type { ButtonVariant } from '../../general/button/button';

export interface FeedbackPopoverProps {
	/** Popover heading text. */
	title?: string;
	/** Textarea placeholder text. */
	placeholder?: string;
	/** Submit button label. */
	submitLabel?: string;
	/** Trigger button label. */
	triggerLabel?: string;
	/** Trigger button variant. */
	triggerVariant?: ButtonVariant;
	/** Whether the form is currently submitting. Controlled by the parent. */
	loading?: boolean;
	class?: string;
}

export interface FeedbackPopoverEmits {
	submit: [feedback: string];
}

export const feedbackPopoverTitleVariants = cva(['text-sm font-semibold text-foreground']);

export const feedbackPopoverActionsVariants = cva(['mt-3 flex justify-end']);

export const feedbackPopoverSuccessVariants = cva([
	'flex flex-col items-center gap-2 py-4',
	'text-center text-sm text-muted-foreground',
]);
