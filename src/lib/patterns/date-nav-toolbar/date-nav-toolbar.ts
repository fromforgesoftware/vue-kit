import { cva } from 'class-variance-authority';

export interface DateNavToolbarView {
	value: string;
	label: string;
}

export type DateNavToolbarPickerType = 'date' | 'month' | 'year';

export const dateNavToolbarVariants = cva('flex items-center justify-between gap-3 flex-wrap');

export const dateNavToolbarLeftClusterVariants = cva('flex items-center gap-3 flex-wrap');

export const dateNavToolbarNavGroupVariants = cva('flex items-center gap-1');

export const dateNavToolbarActionsVariants = cva('flex items-center gap-2');
