import { computed, shallowRef, type Component, type ComputedRef } from 'vue';

export interface ModalEntry<T = unknown> {
	id: string;
	component: Component;
	props: Record<string, unknown>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
}

const stack = shallowRef<ModalEntry[]>([]);
let counter = 0;

function nextId(): string {
	counter += 1;
	return `modal-${counter}`;
}

export interface OpenModalOptions {
	/** Custom id; auto-assigned when omitted. */
	id?: string;
	/** Dismiss this id first before pushing the new one. */
	replace?: string;
}

function push<T>(
	component: Component,
	props: Record<string, unknown>,
	opts: OpenModalOptions,
): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const id = opts.id ?? nextId();
		if (opts.replace) {
			stack.value = stack.value.filter((e) => e.id !== opts.replace);
		}
		stack.value = [
			...stack.value,
			{ id, component, props, resolve: resolve as (v: unknown) => void, reject },
		];
	});
}

function entryById(id: string): ModalEntry | undefined {
	return stack.value.find((e) => e.id === id);
}

export interface UseModalReturn {
	stack: ComputedRef<ModalEntry[]>;
	current: ComputedRef<ModalEntry | null>;
	isOpen: ComputedRef<boolean>;

	/**
	 * Push a modal onto the stack. Resolves the returned promise when the
	 * modal calls `resolve(id, value)` or rejects when `dismiss(id)` runs.
	 */
	open<T = unknown>(
		component: Component,
		props?: Record<string, unknown>,
		opts?: OpenModalOptions,
	): Promise<T>;

	/** Resolve the named modal (or the top of the stack when no id supplied). */
	resolve<T>(value: T, id?: string): void;

	/** Reject the named modal (or the top of the stack). Promise rejects. */
	dismiss(id?: string, reason?: unknown): void;

	/** Pop the modal off the stack without resolving — used by the host on close-without-action. */
	close(id?: string): void;
}

export function useModal(): UseModalReturn {
	function open<T>(
		component: Component,
		props: Record<string, unknown> = {},
		opts: OpenModalOptions = {},
	): Promise<T> {
		return push<T>(component, props, opts);
	}

	function topId(): string | undefined {
		return stack.value[stack.value.length - 1]?.id;
	}

	function remove(id: string): void {
		stack.value = stack.value.filter((e) => e.id !== id);
	}

	function resolve<T>(value: T, id?: string): void {
		const targetId = id ?? topId();
		if (!targetId) return;
		const entry = entryById(targetId);
		if (!entry) return;
		entry.resolve(value);
		remove(targetId);
	}

	function dismiss(id?: string, reason?: unknown): void {
		const targetId = id ?? topId();
		if (!targetId) return;
		const entry = entryById(targetId);
		if (!entry) return;
		entry.reject(reason);
		remove(targetId);
	}

	function close(id?: string): void {
		const targetId = id ?? topId();
		if (!targetId) return;
		remove(targetId);
	}

	return {
		stack: computed(() => stack.value),
		current: computed(() => stack.value[stack.value.length - 1] ?? null),
		isOpen: computed(() => stack.value.length > 0),
		open,
		resolve,
		dismiss,
		close,
	};
}

export function __resetModalStackForTests(): void {
	stack.value = [];
	counter = 0;
}
