import { cva } from 'class-variance-authority';

export const dropZoneVariants = cva(
	'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-sm transition-colors',
	{
		variants: {
			state: {
				idle: 'border-border bg-transparent text-muted-foreground',
				hover: 'border-primary bg-primary/5 text-foreground',
				disabled: 'border-border bg-muted/40 text-muted-foreground pointer-events-none opacity-60',
			},
			size: {
				sm: 'p-3 min-h-24',
				default: 'p-6 min-h-32',
				lg: 'p-10 min-h-48',
			},
		},
		defaultVariants: { state: 'idle', size: 'default' },
	},
);

export type DropZoneState = NonNullable<Parameters<typeof dropZoneVariants>[0]>['state'];
