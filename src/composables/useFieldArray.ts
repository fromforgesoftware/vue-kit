/**
 * Dynamic form field array with append, remove, move operations.
 *
 * @param options - Configuration options
 * @param options.initialValue - Initial array of field values
 * @returns Field array state and manipulation methods
 *
 * @example
 * ```ts
 * interface Task {
 *   title: string
 *   completed: boolean
 * }
 *
 * const { fields, append, remove, move, swap, replace, clear } = useFieldArray<Task>({
 *   initialValue: [{ title: 'Task 1', completed: false }]
 * })
 *
 * // Add new field
 * append({ title: 'New Task', completed: false })
 *
 * // Remove field at index
 * remove(0)
 *
 * // Reorder fields
 * move(0, 2) // Move item from index 0 to index 2
 * swap(0, 1) // Swap items at index 0 and 1
 *
 * // Replace field at index
 * replace(0, { title: 'Updated', completed: true })
 *
 * // Clear all fields
 * clear()
 * ```
 */
import { ref, type Ref } from 'vue';

export interface UseFieldArrayOptions<T> {
	/** Initial array of field values (default: []) */
	initialValue?: T[];
}

export interface UseFieldArrayReturn<T> {
	/** Reactive array of fields */
	fields: Ref<T[]>;
	/** Add item to the end */
	append: (item: T) => void;
	/** Add item to the beginning */
	prepend: (item: T) => void;
	/** Remove item at index */
	remove: (index: number) => void;
	/** Move item from one index to another */
	move: (from: number, to: number) => void;
	/** Swap items at two indexes */
	swap: (indexA: number, indexB: number) => void;
	/** Replace item at index */
	replace: (index: number, item: T) => void;
	/** Insert item at specific index */
	insert: (index: number, item: T) => void;
	/** Clear all items */
	clear: () => void;
	/** Reset to initial value */
	reset: () => void;
}

function deepClone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value));
}

export function useFieldArray<T>(options: UseFieldArrayOptions<T> = {}): UseFieldArrayReturn<T> {
	const { initialValue = [] } = options;

	// Deep clone initial value to prevent mutation
	const fields = ref<T[]>(deepClone(initialValue)) as Ref<T[]>;

	const append = (item: T): void => {
		fields.value = [...fields.value, item];
	};

	const prepend = (item: T): void => {
		fields.value = [item, ...fields.value];
	};

	const remove = (index: number): void => {
		if (index < 0 || index >= fields.value.length) return;
		fields.value = fields.value.filter((_, i) => i !== index);
	};

	const move = (from: number, to: number): void => {
		const arr = [...fields.value];
		if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return;
		if (from === to) return;

		const [item] = arr.splice(from, 1);
		arr.splice(to, 0, item);
		fields.value = arr;
	};

	const swap = (indexA: number, indexB: number): void => {
		const arr = [...fields.value];
		if (
			indexA < 0 ||
			indexA >= arr.length ||
			indexB < 0 ||
			indexB >= arr.length ||
			indexA === indexB
		) {
			return;
		}

		const temp = arr[indexA];
		arr[indexA] = arr[indexB];
		arr[indexB] = temp;
		fields.value = arr;
	};

	const replace = (index: number, item: T): void => {
		if (index < 0 || index >= fields.value.length) return;
		const arr = [...fields.value];
		arr[index] = item;
		fields.value = arr;
	};

	const insert = (index: number, item: T): void => {
		const arr = [...fields.value];
		const clampedIndex = Math.max(0, Math.min(index, arr.length));
		arr.splice(clampedIndex, 0, item);
		fields.value = arr;
	};

	const clear = (): void => {
		fields.value = [];
	};

	const reset = (): void => {
		fields.value = deepClone(initialValue);
	};

	return {
		fields,
		append,
		prepend,
		remove,
		move,
		swap,
		replace,
		insert,
		clear,
		reset,
	};
}
