import { cva } from 'class-variance-authority';

export const fileInputVariants = cva(
	'inline-flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
	{
		variants: {
			size: {
				sm: 'h-8 text-xs px-2',
				default: 'h-9',
				lg: 'h-10 px-4 text-base',
			},
			disabled: {
				true: 'opacity-50 pointer-events-none',
				false: '',
			},
		},
		defaultVariants: { size: 'default', disabled: false },
	},
);

export type FileInputVariant = Parameters<typeof fileInputVariants>[0];
