import { type Component } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';

export interface SortFieldOption {
	name: string;
	icon?: Component;
}

export type SortDirection = 'ASC' | 'DESC';

export interface SortField {
	field: SortFieldOption;
	direction: SortDirection;
}

export const sortTriggerVariants = cva('', {
	variants: {},
	defaultVariants: {},
});

export const sortPanelVariants = cva('rounded-lg text-sm', {
	variants: {},
	defaultVariants: {},
});

export const sortRowVariants = cva('flex items-center gap-2', {
	variants: {},
	defaultVariants: {},
});

export const sortDragPlaceholderVariants = cva(
	'min-h-10 h-10 rounded-md border border-dashed border-secondary-foreground bg-secondary transition-shadow',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type SortTriggerVariants = VariantProps<typeof sortTriggerVariants>;
export type SortPanelVariants = VariantProps<typeof sortPanelVariants>;
export type SortRowVariants = VariantProps<typeof sortRowVariants>;
