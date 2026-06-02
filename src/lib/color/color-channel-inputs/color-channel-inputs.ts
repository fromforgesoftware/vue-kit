import { cva, type VariantProps } from 'class-variance-authority';

export const colorChannelInputsRootVariants = cva('flex w-full flex-col gap-2');

export const colorChannelInputsListVariants = cva('w-full');

export const colorChannelInputsRowVariants = cva('grid items-center gap-1.5', {
	variants: {
		columns: {
			1: 'grid-cols-1',
			3: 'grid-cols-3',
			4: 'grid-cols-4',
			2: 'grid-cols-2',
		},
	},
	defaultVariants: { columns: 3 },
});

export const colorChannelInputsLabelVariants = cva(
	'mt-0.5 text-center text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground',
);

export type ColorChannelInputsVariants = VariantProps<typeof colorChannelInputsRootVariants>;
export type ColorChannelInputsTab = 'hex' | 'rgb' | 'hsl' | 'hsb';
