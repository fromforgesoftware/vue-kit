import { cva, type VariantProps } from 'class-variance-authority';

export interface SplitButtonAction {
	/** Unique value used for selection tracking. */
	value: string;
	/** Label shown in the dropdown and on the primary button when selected. */
	label: string;
	/** Optional description shown below the label in the dropdown. */
	description?: string;
	/** Whether this action is disabled. */
	disabled?: boolean;
}

// Shadow lives on the root (not each Button) so the two buttons don't
// double-stack box-shadows where they meet.
export const splitButtonRootVariants = cva('inline-flex rounded-md shadow-xs isolate');

// Primary button — joins to the chevron trigger on the right. `focus-visible:z-10`
// keeps the focus ring on top of the divider when keyboard-focused.
export const splitButtonPrimaryVariants = cva(
	'rounded-r-none border-r-0 focus-visible:z-10 shadow-none',
);

// Chevron trigger button.
export const splitButtonTriggerVariants = cva(
	[
		'rounded-l-none focus-visible:z-10 shadow-none',
		// Divider line between primary and trigger — uses the variant's foreground
		// at low opacity so it reads against any button colour.
		'border-l border-l-current/30',
	].join(' '),
);

// Dropdown row — title above, optional description below.
export const splitButtonItemVariants = cva('flex flex-col gap-0.5 text-left');
export const splitButtonItemLabelVariants = cva('text-sm font-medium');
export const splitButtonItemDescriptionVariants = cva('text-muted-foreground text-xs');

export type SplitButtonVariants = VariantProps<typeof splitButtonRootVariants>;
