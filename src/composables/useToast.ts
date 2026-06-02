/**
 * Global toast notification system backed by Pinia.
 *
 * @returns Toast state and control methods
 *
 * @example
 * ```ts
 * const { toasts, add, remove, info, success, warning, error } = useToast()
 *
 * // Quick methods
 * success('User saved successfully')
 * error('Failed to save user', 5000) // Custom duration
 * info('Processing...')
 * warning('Session expiring soon')
 *
 * // Full control
 * const toastId = add({
 *   message: 'Custom toast',
 *   severity: 'info',
 *   duration: 3000
 * })
 *
 * // Remove manually
 * remove(toastId)
 *
 * // Display in template
 * // <div v-for="toast in toasts" :key="toast.id" :class="toast.severity">
 * //   {{ toast.message }}
 * // </div>
 * ```
 */
import { readonly, computed, type Ref, type DeepReadonly, type ComputedRef } from 'vue';
import { defineStore } from 'pinia';

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
	/** Unique identifier */
	id: string;
	/** Toast message */
	message: string;
	/** Severity level */
	severity: ToastSeverity;
	/** Auto-dismiss duration in ms (0 = no auto-dismiss) */
	duration: number;
	/** Timestamp when created */
	createdAt: number;
}

export interface UseToastReturn {
	/** Current toasts list */
	toasts: DeepReadonly<Ref<Toast[]>>;
	/** Total count of toasts */
	count: ComputedRef<number>;
	/** Add a toast and return its ID */
	add: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
	/** Remove a toast by ID */
	remove: (id: string) => void;
	/** Clear all toasts */
	clear: () => void;
	/** Add info toast */
	info: (message: string, duration?: number) => string;
	/** Add success toast */
	success: (message: string, duration?: number) => string;
	/** Add warning toast */
	warning: (message: string, duration?: number) => string;
	/** Add error toast */
	error: (message: string, duration?: number) => string;
}

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

let idCounter = 0;
function generateId(): string {
	return `toast-${++idCounter}-${Date.now()}`;
}

// Pinia store for global toast state
export const useToastStore = defineStore('hive-toasts', {
	state: () => ({
		toasts: [] as Toast[],
		timers: new Map<string, ReturnType<typeof setTimeout>>(),
	}),

	actions: {
		add(toast: Omit<Toast, 'id' | 'createdAt'>): string {
			const id = generateId();
			const newToast: Toast = {
				...toast,
				id,
				createdAt: Date.now(),
			};

			// Add to front (newest first)
			this.toasts = [newToast, ...this.toasts];

			// Limit max toasts
			if (this.toasts.length > MAX_TOASTS) {
				const removed = this.toasts.pop();
				if (removed) {
					this.clearTimer(removed.id);
				}
			}

			// Set auto-dismiss timer
			if (toast.duration > 0) {
				const timer = setTimeout(() => {
					this.remove(id);
				}, toast.duration);
				this.timers.set(id, timer);
			}

			return id;
		},

		remove(id: string): void {
			this.clearTimer(id);
			this.toasts = this.toasts.filter((t) => t.id !== id);
		},

		clear(): void {
			// Clear all timers
			this.timers.forEach((timer) => clearTimeout(timer));
			this.timers.clear();
			this.toasts = [];
		},

		clearTimer(id: string): void {
			const timer = this.timers.get(id);
			if (timer) {
				clearTimeout(timer);
				this.timers.delete(id);
			}
		},
	},
});

export function useToast(): UseToastReturn {
	const store = useToastStore();

	const count = computed(() => store.toasts.length);

	const add = (toast: Omit<Toast, 'id' | 'createdAt'>): string => {
		return store.add(toast);
	};

	const remove = (id: string): void => {
		store.remove(id);
	};

	const clear = (): void => {
		store.clear();
	};

	const createToast = (severity: ToastSeverity) => {
		return (message: string, duration: number = DEFAULT_DURATION): string => {
			return add({ message, severity, duration });
		};
	};

	return {
		toasts: readonly(computed(() => store.toasts)),
		count,
		add,
		remove,
		clear,
		info: createToast('info'),
		success: createToast('success'),
		warning: createToast('warning'),
		error: createToast('error'),
	};
}
