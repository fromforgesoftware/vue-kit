/**
 * Generic command-pattern undo/redo stack.
 *
 * Each command knows how to apply itself forward (`do`) and backward (`undo`)
 * given a state value. Pushing a new command after one or more `undo()` calls
 * truncates the redo branch — standard editor semantics.
 *
 * The state itself is owned by the caller; commands receive it and may either
 * mutate it in place (returning void) or return a new value. When a command
 * returns a new value it replaces the current state, so functional / immutable
 * patterns work as well as mutable ones.
 *
 * @example
 * ```ts
 * const stack = useUndoStack<MyDoc>({ initialState: doc.value })
 *
 * stack.push({
 *   label: 'Edit cell',
 *   do: (s) => { s.cells[0] = newValue; return s },
 *   undo: (s) => { s.cells[0] = oldValue; return s },
 * })
 *
 * if (stack.canUndo.value) stack.undo()
 * ```
 */
import { ref, computed, type ComputedRef } from 'vue';

export interface Command<S = unknown> {
	/** Apply forward — must be idempotent given `state`. May mutate or return a new value. */
	do(state: S): S | void;
	/** Inverse — restores prior state. */
	undo(state: S): S | void;
	/** Optional human-readable label for tooltips ("Undo edit cell"). */
	label?: string;
}

export interface UseUndoStackOptions<S> {
	/** Soft cap on undo-stack depth. When exceeded, oldest entries are dropped. Default 100. */
	maxDepth?: number;
	/** Optional initial state value. */
	initialState?: S;
}

export interface UseUndoStackReturn<S> {
	/** Apply a new command; clears any redo branch. */
	push: (command: Command<S>) => void;
	/** Undo the most recent command; no-op when stack is empty. */
	undo: () => void;
	/** Redo a previously-undone command; no-op when redo stack is empty. */
	redo: () => void;
	/** Empty both stacks (e.g. on save). */
	clear: () => void;
	/** Whether `undo()` would do anything. */
	canUndo: ComputedRef<boolean>;
	/** Whether `redo()` would do anything. */
	canRedo: ComputedRef<boolean>;
	/** Label of the next command that would be undone, if any. */
	undoLabel: ComputedRef<string | undefined>;
	/** Label of the next command that would be redone, if any. */
	redoLabel: ComputedRef<string | undefined>;
	/** Current undo-stack depth. */
	size: ComputedRef<number>;
}

export function useUndoStack<S>(opts: UseUndoStackOptions<S> = {}): UseUndoStackReturn<S> {
	const { maxDepth = 100, initialState } = opts;

	const undoStack = ref<Command<S>[]>([]) as { value: Command<S>[] };
	const redoStack = ref<Command<S>[]>([]) as { value: Command<S>[] };
	// We track state in a simple holder so commands can replace it by returning
	// a new value. Vue's ref is fine; we don't need reactivity on the state for
	// the stack itself, but exposing it isn't part of the contract.
	let state: S | undefined = initialState;

	const apply = (cmd: Command<S>, direction: 'do' | 'undo'): void => {
		if (state === undefined) {
			// Allow commands that don't need state by passing `undefined as S`.
			const result = cmd[direction](undefined as unknown as S);
			if (result !== undefined) state = result as S;
			return;
		}
		const result = cmd[direction](state);
		if (result !== undefined) state = result as S;
	};

	const push = (command: Command<S>): void => {
		apply(command, 'do');
		undoStack.value.push(command);
		// Soft cap — drop oldest when over depth.
		while (undoStack.value.length > maxDepth) {
			undoStack.value.shift();
		}
		// New branch — invalidate any pending redos.
		redoStack.value = [];
	};

	const undo = (): void => {
		const cmd = undoStack.value.pop();
		if (!cmd) return;
		apply(cmd, 'undo');
		redoStack.value.push(cmd);
	};

	const redo = (): void => {
		const cmd = redoStack.value.pop();
		if (!cmd) return;
		apply(cmd, 'do');
		undoStack.value.push(cmd);
	};

	const clear = (): void => {
		undoStack.value = [];
		redoStack.value = [];
	};

	const canUndo = computed(() => undoStack.value.length > 0);
	const canRedo = computed(() => redoStack.value.length > 0);
	const undoLabel = computed(() => undoStack.value[undoStack.value.length - 1]?.label);
	const redoLabel = computed(() => redoStack.value[redoStack.value.length - 1]?.label);
	const size = computed(() => undoStack.value.length);

	return {
		push,
		undo,
		redo,
		clear,
		canUndo,
		canRedo,
		undoLabel,
		redoLabel,
		size,
	};
}
