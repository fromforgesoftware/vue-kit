import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

export type StepperVariant = 'default';
export type StepperOrientation = 'horizontal' | 'vertical';
export const STEPPER_VARIANT_KEY: InjectionKey<Ref<StepperVariant>> = Symbol('stepper-variant');

export const stepperVariants = cva('w-full', {
	variants: {},
	defaultVariants: {},
});

// Horizontal stepper stays horizontal on mobile too — the vertical-collapse
// experiment created a heavy stacked-circles look that didn't read as
// progressive flow. If a stepper has 5+ steps and titles can't fit, the
// consumer should pass `orientation="vertical"` explicitly or shorten labels.
export const stepperListVariants = cva('flex', {
	variants: {
		orientation: {
			horizontal: 'items-start',
			vertical: 'flex-col items-stretch',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export const stepperItemVariants = cva(
	`relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium
   transition-all duration-200
   focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`,
	{
		variants: {
			state: {
				inactive: 'bg-muted text-muted-foreground',
				active: 'bg-primary text-primary-foreground',
				completed: 'bg-primary text-primary-foreground',
				loading: 'bg-primary text-primary-foreground',
			},
			optional: {
				true: '',
				false: '',
			},
			clickable: {
				true: 'cursor-pointer hover:opacity-80',
				false: 'cursor-default',
			},
		},
		defaultVariants: {
			state: 'inactive',
			optional: false,
			clickable: false,
		},
		compoundVariants: [
			{
				optional: true,
				state: 'inactive',
				class: 'bg-transparent border-2 border-dashed border-muted-foreground/40',
			},
		],
	},
);

export const stepperSeparatorVariants = cva('transition-all duration-200', {
	variants: {
		orientation: {
			horizontal: 'mx-2 h-0.5 flex-1',
			vertical: 'my-2 w-0.5 self-center min-h-6',
		},
		completed: {
			true: 'bg-primary',
			false: 'bg-muted',
		},
		dashed: {
			true: 'bg-transparent !h-0',
			false: '',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
		completed: false,
		dashed: false,
	},
	compoundVariants: [
		{ orientation: 'horizontal', dashed: true, class: 'border-t-2 border-dashed' },
		{ orientation: 'vertical', dashed: true, class: 'border-l-2 border-dashed !w-0' },
		{ dashed: true, completed: true, class: 'border-primary' },
		{ dashed: true, completed: false, class: 'border-muted' },
	],
});

export const stepperContentVariants = cva('mt-4', {
	variants: {},
	defaultVariants: {},
});

export const stepperActionsVariants = cva('mt-6 flex justify-between', {
	variants: {},
	defaultVariants: {},
});

export type StepperVariants = VariantProps<typeof stepperVariants>;
export type StepperItemState = 'inactive' | 'active' | 'completed' | 'loading';

export interface Step {
	id: string;
	title: string;
	description?: string;
	disabled?: boolean;
	completed?: boolean;
	optional?: boolean;
}
