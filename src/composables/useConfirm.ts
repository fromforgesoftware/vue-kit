/**
 * Programmatic confirm dialog returning a Promise<boolean>.
 *
 * @returns Confirm function and dialog state
 *
 * @example
 * ```ts
 * const { confirm, isOpen, currentOptions, resolve } = useConfirm()
 *
 * // In your component
 * async function handleDelete() {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     confirmLabel: 'Delete',
 *     cancelLabel: 'Cancel'
 *   })
 *
 *   if (confirmed) {
 *     await deleteItem()
 *   }
 * }
 *
 * // In your ConfirmDialog component
 * // <ConfirmDialog
 * //   v-if="isOpen"
 * //   :title="currentOptions?.title"
 * //   :message="currentOptions?.message"
 * //   @confirm="resolve(true)"
 * //   @cancel="resolve(false)"
 * // />
 * ```
 */
import { readonly, computed, type Ref, type DeepReadonly, type ComputedRef } from 'vue';
import { defineStore } from 'pinia';

export interface ConfirmOptions {
	/** Dialog title */
	title: string;
	/** Dialog message/body */
	message: string;
	/** Confirm button label (default: 'Confirm') */
	confirmLabel?: string;
	/** Cancel button label (default: 'Cancel') */
	cancelLabel?: string;
	/** Confirm button variant for styling (default: 'default') */
	confirmVariant?: 'default' | 'destructive';
}

export interface UseConfirmReturn {
	/** Open a confirm dialog and wait for user response */
	confirm: (options: ConfirmOptions) => Promise<boolean>;
	/** Whether dialog is currently open */
	isOpen: ComputedRef<boolean>;
	/** Current dialog options (null when closed) */
	currentOptions: DeepReadonly<Ref<ConfirmOptions | null>>;
	/** Resolve the current dialog (call from your dialog component) */
	resolve: (value: boolean) => void;
}

interface ConfirmState {
	options: ConfirmOptions | null;
	resolver: ((value: boolean) => void) | null;
}

// Pinia store for global confirm state
export const useConfirmStore = defineStore('hive-confirm', {
	state: (): ConfirmState => ({
		options: null,
		resolver: null,
	}),

	getters: {
		isOpen: (state) => state.options !== null,
	},

	actions: {
		open(options: ConfirmOptions): Promise<boolean> {
			return new Promise<boolean>((resolve) => {
				// Close any existing dialog first
				if (this.resolver) {
					this.resolver(false);
				}

				this.options = {
					confirmLabel: 'Confirm',
					cancelLabel: 'Cancel',
					confirmVariant: 'default',
					...options,
				};
				this.resolver = resolve;
			});
		},

		resolve(value: boolean): void {
			if (this.resolver) {
				this.resolver(value);
				this.resolver = null;
			}
			this.options = null;
		},

		close(): void {
			this.resolve(false);
		},
	},
});

export function useConfirm(): UseConfirmReturn {
	const store = useConfirmStore();

	const confirm = (options: ConfirmOptions): Promise<boolean> => {
		return store.open(options);
	};

	const resolve = (value: boolean): void => {
		store.resolve(value);
	};

	const isOpen = computed(() => store.isOpen);
	const currentOptions = computed(() => store.options);

	return {
		confirm,
		isOpen,
		currentOptions: readonly(currentOptions),
		resolve,
	};
}
