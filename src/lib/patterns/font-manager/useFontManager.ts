import { ref, readonly } from 'vue';
import { type FontSize, FONT_SIZE_LOCAL_STORAGE_KEY, FONT_SIZE_MAP } from './font-manager.js';

function getFontSizeFromLocalStorage(): FontSize {
	if (typeof window === 'undefined') {
		return 'default';
	}
	const saved = localStorage.getItem(FONT_SIZE_LOCAL_STORAGE_KEY) as FontSize | null;
	return saved ?? 'default';
}

function applyFontSize(size: FontSize): void {
	if (typeof document === 'undefined') {
		return;
	}
	document.documentElement.style.setProperty('font-size', FONT_SIZE_MAP[size]);
}

const fontSize = ref<FontSize>(getFontSizeFromLocalStorage());

// Apply the persisted font size on module load (runs once).
applyFontSize(fontSize.value);

/**
 * Composable that manages global font size.
 *
 * State is shared across all consumers (singleton ref) and persisted to
 * localStorage. Calling `setFontSize` updates the `<html>` element's
 * `font-size` style property so every rem/em-based size in the app scales
 * accordingly.
 */
export function useFontManager() {
	function setFontSize(size: FontSize): void {
		fontSize.value = size;
		applyFontSize(size);
		if (typeof window !== 'undefined') {
			localStorage.setItem(FONT_SIZE_LOCAL_STORAGE_KEY, size);
		}
	}

	return {
		/** The current font size key (reactive, read-only). */
		fontSize: readonly(fontSize),
		/** Set a new font size, persist it, and apply it to the document. */
		setFontSize,
	};
}
