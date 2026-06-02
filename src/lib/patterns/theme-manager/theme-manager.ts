import { cva, type VariantProps } from 'class-variance-authority';

// --- Types ---

export type Theme = 'light' | 'dark' | 'auto' | 'custom';

export interface ThemeOption {
	/** Display name shown in the dropdown. */
	name: string;
	/** The theme value. */
	value: Theme;
}

export interface CustomThemeColors {
	primary: string;
	background: string;
	foreground: string;
	secondary: string;
	accent: string;
	muted: string;
}

export const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
	primary: '#3b82f6',
	background: '#ffffff',
	foreground: '#0a0a0a',
	secondary: '#f1f5f9',
	accent: '#f59e0b',
	muted: '#64748b',
};

export const COLOR_FIELDS: { key: keyof CustomThemeColors; label: string }[] = [
	{ key: 'primary', label: 'Primary' },
	{ key: 'background', label: 'Background' },
	{ key: 'foreground', label: 'Foreground' },
	{ key: 'secondary', label: 'Secondary' },
	{ key: 'accent', label: 'Accent' },
	{ key: 'muted', label: 'Muted' },
];

// --- Constants ---

export const THEME_STORAGE_KEY = 'mmc-preferred-theme';
export const CUSTOM_THEME_STORAGE_KEY = 'mmc-custom-theme-colors';
export const DATA_THEME_ATTR = 'data-theme';
export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

// --- CVA Variants ---

export const themeManagerRootVariants = cva('flex flex-col gap-2', {
	variants: {},
	defaultVariants: {},
});

export const themeManagerCustomPanelVariants = cva(
	'mt-2 flex flex-col gap-4 rounded-md border bg-card p-4',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const themeManagerColorRowVariants = cva('flex items-center justify-between', {
	variants: {},
	defaultVariants: {},
});

export const themeManagerColorLabelVariants = cva('text-sm font-medium', {
	variants: {},
	defaultVariants: {},
});

export const themeManagerColorInputVariants = cva('h-8 w-16 cursor-pointer rounded border', {
	variants: {},
	defaultVariants: {},
});

export const themeManagerSwatchVariants = cva('relative mr-1 ml-1 inline-block h-4 w-4 pt-1', {
	variants: {},
	defaultVariants: {},
});

export type ThemeManagerRootVariants = VariantProps<typeof themeManagerRootVariants>;
export type ThemeManagerCustomPanelVariants = VariantProps<typeof themeManagerCustomPanelVariants>;
