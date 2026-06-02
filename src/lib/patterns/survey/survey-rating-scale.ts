import { cva } from 'class-variance-authority';

export interface SurveyRatingScaleProps {
	/** The current selected value. */
	modelValue?: string;
	/** The question/label displayed above the scale. */
	question?: string;
	/** Minimum value of the scale. */
	min?: number;
	/** Maximum value of the scale. */
	max?: number;
	/** Label for the minimum end of the scale. */
	minLabel?: string;
	/** Label for the maximum end of the scale. */
	maxLabel?: string;
	/** Whether the scale is disabled. */
	disabled?: boolean;
	class?: string;
}

export interface SurveyRatingScaleEmits {
	'update:modelValue': [value: string];
}

export const surveyRatingScaleVariants = cva(['space-y-2']);

export const surveyRatingScaleQuestionVariants = cva(['text-sm font-semibold text-foreground']);

export const surveyRatingScaleLabelsVariants = cva([
	'flex justify-between text-xs text-muted-foreground',
]);
