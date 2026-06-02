import { cva } from 'class-variance-authority';

export const FONT_SIZE_LOCAL_STORAGE_KEY = 'mmc-font-size-preference';

export type FontSize = 'smaller' | 'small' | 'default' | 'large' | 'larger';

export interface FontSizeOption {
	label: string;
	value: FontSize;
	description: string;
}

/** Maps font size keys to percentage values applied to the root element. */
export const FONT_SIZE_MAP: Record<FontSize, string> = {
	smaller: '75%',
	small: '87.5%',
	default: '100%',
	large: '112.5%',
	larger: '125%',
};

export const DEFAULT_FONT_SIZE_OPTIONS: FontSizeOption[] = [
	{
		label: 'Smaller',
		value: 'smaller',
		description: '75% (-25% from base)',
	},
	{
		label: 'Small',
		value: 'small',
		description: '87.5% (-12.5% from base)',
	},
	{
		label: 'Default',
		value: 'default',
		description: '100% (base size)',
	},
	{
		label: 'Large',
		value: 'large',
		description: '112.5% (+12.5% from base)',
	},
	{
		label: 'Larger',
		value: 'larger',
		description: '125% (+25% from base)',
	},
];

export const fontManagerContainerVariants = cva(['flex flex-col gap-2']);

export const fontManagerTriggerVariants = cva(['w-56']);

export const fontManagerItemLabelVariants = cva(['text-sm font-medium']);
