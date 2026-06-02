/**
 * Dark/light mode toggle with localStorage persistence and theme application.
 *
 * Uses shared singleton state per configuration key, so all components with the same
 * options share the same reactive state.
 *
 * Supports two strategies for applying the theme:
 * - `class`: Adds/removes the 'dark' class on documentElement (default, Tailwind-compatible)
 * - `attribute`: Sets a data attribute (e.g., data-mode="dark") on documentElement
 *
 * @param options - Configuration options
 * @param options.storageKey - localStorage key (default: 'theme')
 * @param options.defaultTheme - Default theme when no preference stored (default: 'system')
 * @param options.selector - Strategy: 'class' or 'attribute' (default: 'class')
 * @param options.attributeName - Attribute name when using 'attribute' selector (default: 'mode' -> data-mode)
 * @returns Theme state and manipulation methods
 *
 * @example
 * ```ts
 * // Class-based (default, toggles 'dark' class on documentElement)
 * const { theme, resolvedTheme, toggle, setTheme } = useTheme()
 *
 * // Attribute-based (for CSS custom properties with [data-mode="dark"])
 * const { toggle } = useTheme({
 *   selector: 'attribute',
 *   attributeName: 'mode'  // Sets data-mode="light" or data-mode="dark"
 * })
 *
 * // Current setting: 'light', 'dark', or 'system'
 * console.log(theme.value)
 *
 * // Actual applied theme (resolves 'system' to light/dark)
 * console.log(resolvedTheme.value)
 *
 * // Toggle between light and dark
 * toggle()
 *
 * // Set specific theme
 * setTheme('dark')
 * setTheme('system') // Follow OS preference
 * ```
 */
import {
	ref,
	computed,
	watch,
	onMounted,
	onUnmounted,
	nextTick,
	type Ref,
	type ComputedRef,
} from 'vue';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface UseThemeOptions {
	/** localStorage key (default: 'theme') */
	storageKey?: string;
	/** Default theme when no preference stored (default: 'system') */
	defaultTheme?: Theme;
	/** Strategy for applying theme: 'class' adds .dark class, 'attribute' sets data attribute (default: 'class') */
	selector?: 'class' | 'attribute';
	/** Attribute name when using 'attribute' selector (default: 'mode' -> data-mode) */
	attributeName?: string;
}

export interface UseThemeReturn {
	/** Current theme setting */
	theme: Ref<Theme>;
	/** Resolved theme (system preference resolved to light/dark) */
	resolvedTheme: ComputedRef<ResolvedTheme>;
	/** Toggle between light and dark */
	toggle: () => void;
	/** Set specific theme */
	setTheme: (newTheme: Theme) => void;
}

const DARK_CLASS = 'dark';

/**
 * Reset all shared theme states. For testing only.
 * @internal
 */
export function __resetThemeStates(): void {
	sharedStates.clear();
}

// Shared state maps keyed by configuration
const sharedStates = new Map<
	string,
	{
		theme: Ref<Theme>;
		systemPreference: Ref<ResolvedTheme>;
		resolvedTheme: ComputedRef<ResolvedTheme>;
		initialized: boolean;
		mountCount: number;
		mediaQuery: MediaQueryList | null;
		handleSystemChange: ((e: MediaQueryListEvent) => void) | null;
	}
>();

function getStateKey(options: UseThemeOptions): string {
	return `${options.storageKey ?? 'theme'}:${options.selector ?? 'class'}:${options.attributeName ?? 'mode'}`;
}

function getSystemPreference(): ResolvedTheme {
	if (typeof window === 'undefined') {
		return 'light';
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
	if (typeof window === 'undefined') {
		return defaultTheme;
	}

	const stored = localStorage.getItem(storageKey);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return defaultTheme;
}

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
	const {
		storageKey = 'theme',
		defaultTheme = 'system',
		selector = 'class',
		attributeName = 'mode',
	} = options;

	const stateKey = getStateKey(options);

	// Get or create shared state
	let state = sharedStates.get(stateKey);
	if (!state) {
		// Priority: localStorage (user's explicit choice) > DOM (SSR value) > default
		// localStorage always wins because it represents the user's explicit choice
		const storedTheme = getStoredTheme(storageKey, defaultTheme);
		const themeRef = ref<Theme>(storedTheme);
		const systemPrefRef = ref<ResolvedTheme>(getSystemPreference());

		// Create shared computed so all components use the same instance
		const resolvedThemeComputed = computed<ResolvedTheme>(() => {
			if (themeRef.value === 'system') {
				return systemPrefRef.value;
			}
			return themeRef.value;
		});

		state = {
			theme: themeRef,
			systemPreference: systemPrefRef,
			resolvedTheme: resolvedThemeComputed,
			initialized: false,
			mountCount: 0,
			mediaQuery: null,
			handleSystemChange: null,
		};
		sharedStates.set(stateKey, state);
	}

	const { theme, systemPreference, resolvedTheme } = state;

	const applyTheme = (resolved: ResolvedTheme): void => {
		if (typeof document === 'undefined') return;

		if (selector === 'attribute') {
			document.documentElement.setAttribute(`data-${attributeName}`, resolved);
		} else {
			if (resolved === 'dark') {
				document.documentElement.classList.add(DARK_CLASS);
			} else {
				document.documentElement.classList.remove(DARK_CLASS);
			}
		}
	};

	const setTheme = (newTheme: Theme): void => {
		theme.value = newTheme;
		if (typeof window !== 'undefined') {
			localStorage.setItem(storageKey, newTheme);
		}
	};

	const toggle = (): void => {
		const newTheme: Theme = resolvedTheme.value === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	};

	// At this point state is guaranteed to exist
	const currentState = state;

	// Set up watcher only once per state (persists across navigation)
	if (!currentState.initialized) {
		currentState.initialized = true;
		watch(
			resolvedTheme,
			(resolved) => {
				applyTheme(resolved);
			},
			{ immediate: true },
		);
	}

	onMounted(() => {
		currentState.mountCount++;

		// Always re-apply theme on mount to ensure it's correct after navigation
		// Use nextTick to apply AFTER any other framework code (like Nuxt's color-mode)
		nextTick(() => {
			applyTheme(resolvedTheme.value);
		});

		// Set up system preference listener only once
		if (currentState.mountCount === 1 && typeof window !== 'undefined') {
			currentState.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			currentState.handleSystemChange = (e: MediaQueryListEvent): void => {
				systemPreference.value = e.matches ? 'dark' : 'light';
			};
			currentState.mediaQuery.addEventListener('change', currentState.handleSystemChange);
		}
	});

	onUnmounted(() => {
		currentState.mountCount--;

		// Clean up listeners when all components unmount, but keep state persistent
		// This prevents theme reset during SPA navigation
		if (currentState.mountCount === 0) {
			if (currentState.mediaQuery && currentState.handleSystemChange) {
				currentState.mediaQuery.removeEventListener('change', currentState.handleSystemChange);
				currentState.mediaQuery = null;
				currentState.handleSystemChange = null;
			}
			// Don't delete state or reset initialized - keeps theme persistent across navigation
		}
	});

	return {
		theme,
		resolvedTheme,
		toggle,
		setTheme,
	};
}
