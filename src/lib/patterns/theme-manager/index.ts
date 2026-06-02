export { default as ThemeManager } from './ThemeManager.vue';
export { useThemeManager } from './useThemeManager';
export {
	themeManagerRootVariants,
	themeManagerCustomPanelVariants,
	themeManagerColorRowVariants,
	themeManagerColorLabelVariants,
	themeManagerColorInputVariants,
	themeManagerSwatchVariants,
	type ThemeManagerRootVariants,
	type ThemeManagerCustomPanelVariants,
	type Theme,
	type ThemeOption,
	type CustomThemeColors,
	DEFAULT_CUSTOM_COLORS,
	COLOR_FIELDS,
	THEME_STORAGE_KEY,
	CUSTOM_THEME_STORAGE_KEY,
	DATA_THEME_ATTR,
	PREFERS_DARK_QUERY,
} from './theme-manager';
