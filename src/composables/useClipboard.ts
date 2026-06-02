/**
 * In-memory clipboard for Excel-style cell/row copy-paste.
 *
 * Distinct from the browser Clipboard API (`navigator.clipboard`) — that
 * targets the OS clipboard for cross-app text/blobs. This is purely a
 * structured-data buffer the host app uses to copy a selection of model
 * objects and paste them elsewhere in the same document.
 *
 * `copy()` and `paste()` both structurally clone the payload, so the
 * consumer can mutate the result freely without affecting future pastes.
 *
 * @example
 * ```ts
 * const clip = useClipboard<CellEdit[]>()
 *
 * function onCopy() { clip.copy(currentSelection.value) }
 * function onPaste() {
 *   const data = clip.paste()
 *   if (data) applyEdits(data)
 * }
 * ```
 */
import { shallowRef, computed, type Ref, type ComputedRef } from 'vue';

export interface UseClipboardReturn<T> {
	/** Current clipboard payload (cloned on read via `paste()`). */
	data: Ref<T | null>;
	/** Store a structurally-cloned copy of `data`. */
	copy: (data: T) => void;
	/** Returns a structurally-cloned copy of the payload, or null if empty. */
	paste: () => T | null;
	/** Empty the clipboard. */
	clear: () => void;
	/** Whether the clipboard currently holds a payload. */
	hasData: ComputedRef<boolean>;
}

function clone<T>(value: T): T {
	// structuredClone is available in all evergreen browsers + jsdom 22+.
	// Fall back to JSON round-trip for very old runtimes (loses Maps/Sets/Dates,
	// but the common case here is plain serialisable cell data).
	if (typeof structuredClone === 'function') {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value)) as T;
}

export function useClipboard<T>(): UseClipboardReturn<T> {
	// shallowRef avoids wrapping the payload in a deep reactive Proxy — that
	// matters because reactive Proxies aren't cloneable by `structuredClone`.
	const data = shallowRef<T | null>(null) as Ref<T | null>;

	const copy = (value: T): void => {
		data.value = clone(value);
	};

	const paste = (): T | null => {
		if (data.value === null) return null;
		return clone(data.value);
	};

	const clear = (): void => {
		data.value = null;
	};

	const hasData = computed(() => data.value !== null);

	return {
		data,
		copy,
		paste,
		clear,
		hasData,
	};
}
