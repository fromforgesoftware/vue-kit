/**
 * Generic Excel-style grid selection state.
 *
 * Tracks a set of selected IDs plus an "anchor" (the last-selected ID, used
 * as the origin for shift+click range selection). Single-click resets the
 * selection; cmd/ctrl+click toggles; shift+click selects a contiguous range
 * between anchor and target.
 *
 * Range computation uses the canonical order returned by `getAllIds()`. The
 * caller owns that list (sort/filter as appropriate); the composable does not
 * cache it — it's read on demand so dynamic scopes (e.g. visible rows after
 * filtering) work transparently.
 *
 * @example
 * ```ts
 * const allRowIds = computed(() => rows.value.map(r => r.id))
 * const sel = useGridSelection<string>({ getAllIds: () => allRowIds.value })
 *
 * // Click handlers:
 * function onRowClick(id: string, e: MouseEvent) {
 *   if (e.shiftKey) sel.selectRange(sel.anchor.value, id)
 *   else if (e.metaKey || e.ctrlKey) sel.toggle(id)
 *   else sel.select(id)
 * }
 * ```
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue';

export interface UseGridSelectionOptions<T> {
	/** Returns the canonical list of all item IDs in current scope. Used for cmd+A and range selection ordering. */
	getAllIds: () => T[];
}

export interface UseGridSelectionReturn<T> {
	/** Current set of selected IDs. */
	selected: Ref<Set<T>>;
	/** Anchor ID — last-selected item, used as range-select origin for shift+click. */
	anchor: Ref<T | null>;
	/** Number of currently selected items. */
	count: ComputedRef<number>;
	/** Whether the given id is selected. */
	isSelected: (id: T) => boolean;
	/** Replace selection with just `id` and update anchor. */
	select: (id: T) => void;
	/** Toggle `id` in/out of the selection; sets anchor when adding. */
	toggle: (id: T) => void;
	/**
	 * Select the contiguous range between anchor and target (inclusive) based
	 * on `getAllIds()` order. Falls back to selecting just `target` when the
	 * anchor is null or not present in the current scope.
	 */
	selectRange: (anchorId: T | null, targetId: T) => void;
	/** Add every id from `getAllIds()` to the selection. */
	selectAll: () => void;
	/** Empty selection and clear anchor. */
	clear: () => void;
	/** Manually set the anchor (e.g. when restoring focus after a remote change). */
	setAnchor: (id: T) => void;
}

export function useGridSelection<T>(opts: UseGridSelectionOptions<T>): UseGridSelectionReturn<T> {
	const selected = ref(new Set<T>()) as Ref<Set<T>>;
	const anchor = ref<T | null>(null) as Ref<T | null>;

	const count = computed(() => selected.value.size);

	const isSelected = (id: T): boolean => selected.value.has(id);

	const select = (id: T): void => {
		selected.value = new Set<T>([id]);
		anchor.value = id;
	};

	const toggle = (id: T): void => {
		const next = new Set(selected.value);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
			anchor.value = id;
		}
		selected.value = next;
	};

	const selectRange = (anchorId: T | null, targetId: T): void => {
		const ids = opts.getAllIds();
		if (anchorId === null || anchorId === undefined) {
			selected.value = new Set<T>([targetId]);
			anchor.value = targetId;
			return;
		}

		const anchorIdx = ids.indexOf(anchorId);
		const targetIdx = ids.indexOf(targetId);

		if (anchorIdx === -1 || targetIdx === -1) {
			// Anchor or target not in scope — fall back to single select.
			selected.value = new Set<T>([targetId]);
			anchor.value = targetId;
			return;
		}

		const [from, to] = anchorIdx <= targetIdx ? [anchorIdx, targetIdx] : [targetIdx, anchorIdx];
		const next = new Set<T>();
		for (let i = from; i <= to; i++) next.add(ids[i]);
		selected.value = next;
		// Anchor persists — shift+click extends from the original anchor.
	};

	const selectAll = (): void => {
		const next = new Set<T>();
		for (const id of opts.getAllIds()) next.add(id);
		selected.value = next;
	};

	const clear = (): void => {
		selected.value = new Set<T>();
		anchor.value = null;
	};

	const setAnchor = (id: T): void => {
		anchor.value = id;
	};

	return {
		selected,
		anchor,
		count,
		isSelected,
		select,
		toggle,
		selectRange,
		selectAll,
		clear,
		setAnchor,
	};
}
