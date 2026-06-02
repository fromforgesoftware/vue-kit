import { cva } from 'class-variance-authority';
import type { DialogSize } from '../../general/dialog/dialog';

export interface SurveyDialogProps {
	/** Whether the dialog is open. */
	open?: boolean;
	/** Dialog title. */
	title?: string;
	/** Step labels — defines the number of steps. A single-element array means no step navigation. */
	steps: string[];
	/** Submit button label (shown on the last step). */
	submitLabel?: string;
	/** Next button label. */
	nextLabel?: string;
	/** Back button label. */
	backLabel?: string;
	/** Whether the form is currently submitting. */
	loading?: boolean;
	/** Dialog size variant. */
	size?: DialogSize;
	class?: string;
}

export interface SurveyDialogEmits {
	'update:open': [value: boolean];
	/** Emitted when the user clicks Submit on the last step. */
	submit: [];
	/** Emitted when a step changes. */
	'update:step': [index: number];
}

export const surveyDialogBodyVariants = cva(['min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-4']);

export const surveyDialogFooterVariants = cva([
	'flex-none flex flex-col sm:flex-row items-center gap-2 sm:gap-0 rounded-b-xl border-t bg-muted/40 px-6 py-4',
]);

export const surveyDialogStepIndicatorVariants = cva(['text-xs text-muted-foreground']);

export const surveyDialogActionsVariants = cva(['ml-auto flex items-center gap-2']);
