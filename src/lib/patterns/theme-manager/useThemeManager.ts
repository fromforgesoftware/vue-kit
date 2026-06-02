import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
	type Theme,
	type CustomThemeColors,
	DEFAULT_CUSTOM_COLORS,
	THEME_STORAGE_KEY,
	CUSTOM_THEME_STORAGE_KEY,
	DATA_THEME_ATTR,
	PREFERS_DARK_QUERY,
} from './theme-manager.js';

// sRGB → linear (IEC 61966-2-1) → OKLab (Björn Ottosson, 2020) → OKLCH.
// Constants are the standard published matrix; do not hand-tune.

function srgbToLinear(c: number): number {
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
	const cleaned = hex.replace('#', '');
	if (cleaned.length !== 6) return null;

	const r = srgbToLinear(parseInt(cleaned.slice(0, 2), 16) / 255);
	const g = srgbToLinear(parseInt(cleaned.slice(2, 4), 16) / 255);
	const b = srgbToLinear(parseInt(cleaned.slice(4, 6), 16) / 255);

	// sRGB linear -> LMS (using OKLab matrix)
	const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

	const l1 = Math.cbrt(l_);
	const m1 = Math.cbrt(m_);
	const s1 = Math.cbrt(s_);

	// LMS -> OKLab
	const L = 0.2104542553 * l1 + 0.793617785 * m1 - 0.0040720468 * s1;
	const a = 1.9779984951 * l1 - 2.428592205 * m1 + 0.4505937099 * s1;
	const bLab = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.808675766 * s1;

	// OKLab -> OKLCH
	const C = Math.sqrt(a * a + bLab * bLab);
	let H = (Math.atan2(bLab, a) * 180) / Math.PI;
	if (H < 0) H += 360;

	return { l: L, c: C, h: H };
}

// --- Composable ---

// Shared state so all instances stay in sync.
const theme = ref<Theme>('auto');
const customTheme = ref<CustomThemeColors | null>(null);
let initialized = false;

function getPreferredScheme(): 'dark' | 'light' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light';
}

function readThemeFromStorage(): Theme | null {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === 'light' || stored === 'dark' || stored === 'auto' || stored === 'custom') {
			return stored;
		}
	} catch {
		// localStorage may be unavailable (SSR, privacy mode).
	}
	return null;
}

function readCustomColorsFromStorage(): CustomThemeColors | null {
	try {
		const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
		if (stored) return JSON.parse(stored) as CustomThemeColors;
	} catch {
		// Ignore parse errors.
	}
	return null;
}

function persistTheme(t: Theme): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, t);
	} catch {
		// Silently ignore.
	}
}

function persistCustomColors(colors: CustomThemeColors): void {
	try {
		localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(colors));
	} catch {
		// Silently ignore.
	}
}

function applyThemeAttribute(resolvedTheme: 'dark' | 'light' | 'custom'): void {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute(DATA_THEME_ATTR, resolvedTheme);
}

function applyCustomCssVariables(colors: CustomThemeColors): void {
	if (typeof document === 'undefined') return;
	const el = document.documentElement;

	const vars: [string, string][] = [
		['--primary', colors.primary],
		['--background', colors.background],
		['--foreground', colors.foreground],
		['--secondary', colors.secondary],
		['--accent', colors.accent],
		['--muted', colors.muted],
	];

	for (const [name, hex] of vars) {
		const oklch = hexToOklch(hex);
		if (oklch) {
			el.style.setProperty(name, `${oklch.l} ${oklch.c} ${oklch.h}`);
		}
	}
}

function removeCustomCssVariables(): void {
	if (typeof document === 'undefined') return;
	const el = document.documentElement;
	for (const name of [
		'--primary',
		'--background',
		'--foreground',
		'--secondary',
		'--accent',
		'--muted',
	]) {
		el.style.removeProperty(name);
	}
}

function applyTheme(t: Theme, colors: CustomThemeColors | null): void {
	if (t === 'custom') {
		applyThemeAttribute('custom');
		if (colors) applyCustomCssVariables(colors);
	} else {
		removeCustomCssVariables();
		applyThemeAttribute(t === 'auto' ? getPreferredScheme() : t);
	}
}

export function useThemeManager() {
	let mediaQuery: MediaQueryList | null = null;
	let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

	function setTheme(t: Theme): void {
		theme.value = t;
		persistTheme(t);
		applyTheme(t, customTheme.value);
	}

	function setCustomTheme(colors: CustomThemeColors): void {
		customTheme.value = colors;
		persistCustomColors(colors);
		if (theme.value === 'custom') {
			applyTheme('custom', colors);
		}
	}

	function updateCustomColor(key: keyof CustomThemeColors, color: string): void {
		const current = customTheme.value ?? { ...DEFAULT_CUSTOM_COLORS };
		setCustomTheme({ ...current, [key]: color });
	}

	const resolvedCustomColors = computed<CustomThemeColors>(() => {
		return customTheme.value ?? { ...DEFAULT_CUSTOM_COLORS };
	});

	const isCustom = computed(() => theme.value === 'custom');

	// Initialization: read persisted values and apply, watch prefers-color-scheme.
	onMounted(() => {
		if (!initialized) {
			const stored = readThemeFromStorage();
			const storedColors = readCustomColorsFromStorage();
			if (storedColors) customTheme.value = storedColors;
			const initial = stored ?? 'auto';
			theme.value = initial;
			applyTheme(initial, customTheme.value);
			initialized = true;
		}

		if (typeof window !== 'undefined') {
			mediaQuery = window.matchMedia(PREFERS_DARK_QUERY);
			mediaHandler = (event: MediaQueryListEvent) => {
				if (theme.value === 'auto') {
					applyThemeAttribute(event.matches ? 'dark' : 'light');
				}
			};
			mediaQuery.addEventListener('change', mediaHandler);
		}
	});

	onUnmounted(() => {
		if (mediaQuery && mediaHandler) {
			mediaQuery.removeEventListener('change', mediaHandler);
		}
	});

	return {
		/** The current theme setting (reactive). */
		theme,
		/** The custom color palette (reactive, may be null if never configured). */
		customTheme,
		/** Resolved custom colors -- falls back to defaults when none are set. */
		resolvedCustomColors,
		/** Whether the current theme is 'custom'. */
		isCustom,
		/** Switch to a new theme and persist it. */
		setTheme,
		/** Replace the full custom color palette and persist it. */
		setCustomTheme,
		/** Update a single custom color key and persist. */
		updateCustomColor,
	};
}
