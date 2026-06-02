import {
	ref,
	watch,
	onMounted,
	onBeforeUnmount,
	type Ref,
	type ComputedRef,
	type MaybeRefOrGetter,
} from 'vue';
import type { Router } from 'vue-router';
import { useUnsavedChangesRegistry } from './unsavedChangesRegistry';

export type UnsavedChangesMode = 'dialog' | 'banner';

export interface UseUnsavedChangesOptions {
	/** Reactive flag — true when the form/page has pending changes. */
	hasUnsavedChanges: Ref<boolean> | ComputedRef<boolean>;
	/** Vue Router instance. If omitted, the navigation guard is not registered. */
	router?: Router;
	/** Which UI to show on navigation attempt. Default: 'dialog'. */
	mode?: UnsavedChangesMode;
	/** Enable the browser's native beforeunload prompt. Default: true. */
	enableBeforeUnload?: boolean;
	/**
	 * Skip auto-registration with the global `<UnsavedChangesOutlet>` and
	 * render the dialog inline. Default: false.
	 */
	standalone?: boolean;
	/** Dialog title override forwarded to the outlet. */
	dialogTitle?: MaybeRefOrGetter<string>;
	/** Dialog description override forwarded to the outlet. */
	dialogDescription?: MaybeRefOrGetter<string>;
	/** Confirm-button label forwarded to the outlet. */
	dialogConfirmText?: MaybeRefOrGetter<string>;
	/** Cancel-button label forwarded to the outlet. */
	dialogCancelText?: MaybeRefOrGetter<string>;
	/**
	 * Hook invoked when the user confirms navigation (clicks the destructive
	 * action). Runs *before* the navigation promise resolves, so this is
	 * where destructive side-effects belong (clearing drafts, localStorage).
	 */
	onConfirm?: () => void;
	/** Hook invoked when the user cancels navigation (clicks "Continue"). */
	onCancel?: () => void;
}

export interface UseUnsavedChangesReturn {
	/** Whether the confirmation dialog should be open. Bind to UnsavedChangesDialog :open. */
	isDialogOpen: Ref<boolean>;
	/** Whether the banner should play the jiggle animation. Bind to UnsavedChangesBanner :jiggling. */
	isJiggling: Ref<boolean>;
	/** Call when the user confirms navigation (clicked "Leave"). */
	confirmNavigation: () => void;
	/** Call when the user cancels navigation (clicked "Stay"). */
	cancelNavigation: () => void;
	/** Trigger the jiggle animation programmatically. */
	triggerJiggle: () => void;
	/**
	 * Imperative check for non-router contexts (closing a drawer, switching tabs).
	 * In dialog mode: opens the dialog and returns a Promise that resolves when the user decides.
	 * In banner mode: jiggles and returns false immediately.
	 * When there are no unsaved changes: returns true immediately.
	 */
	canDeactivate: () => Promise<boolean>;
}

const JIGGLE_DURATION_MS = 400;

/**
 * Composable that protects against accidental navigation when there are unsaved changes.
 *
 * It integrates with Vue Router via an async `beforeEach` guard (return-value pattern,
 * no stored `next` callback) and optionally registers a `beforeunload` listener for
 * browser tab close / refresh.
 */
export function useUnsavedChanges(options: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
	const {
		hasUnsavedChanges,
		router,
		mode = 'dialog',
		enableBeforeUnload = true,
		standalone = false,
		dialogTitle,
		dialogDescription,
		dialogConfirmText,
		dialogCancelText,
		onConfirm,
		onCancel,
	} = options;

	const isDialogOpen = ref(false);
	const isJiggling = ref(false);

	// Promise resolve function for the currently pending navigation decision.
	let pendingResolve: ((allowed: boolean) => void) | null = null;

	// ---------------------------------------------------------------------------
	// Jiggle
	// ---------------------------------------------------------------------------

	let jiggleTimer: ReturnType<typeof setTimeout> | undefined;

	function triggerJiggle() {
		isJiggling.value = true;
		clearTimeout(jiggleTimer);
		jiggleTimer = setTimeout(() => {
			isJiggling.value = false;
		}, JIGGLE_DURATION_MS);
	}

	// ---------------------------------------------------------------------------
	// Navigation resolution
	// ---------------------------------------------------------------------------

	function confirmNavigation() {
		onConfirm?.();
		if (pendingResolve) {
			pendingResolve(true);
			pendingResolve = null;
		}
	}

	function cancelNavigation() {
		onCancel?.();
		if (pendingResolve) {
			pendingResolve(false);
			pendingResolve = null;
		}
	}

	// ---------------------------------------------------------------------------
	// Vue Router guard
	// ---------------------------------------------------------------------------

	let removeGuard: (() => void) | undefined;

	if (router) {
		removeGuard = router.beforeEach(async () => {
			if (!hasUnsavedChanges.value) return true;

			if (mode === 'banner') {
				triggerJiggle();
				return false;
			}

			// Dialog mode — open the dialog and wait for the user's decision.
			// If a previous dialog is still pending (e.g. rapid navigation clicks),
			// reject the previous one first.
			if (pendingResolve) {
				pendingResolve(false);
				pendingResolve = null;
			}

			isDialogOpen.value = true;
			const allowed = await new Promise<boolean>((resolve) => {
				pendingResolve = resolve;
			});
			isDialogOpen.value = false;
			return allowed;
		});
	}

	// ---------------------------------------------------------------------------
	// beforeunload (browser tab close / refresh)
	// ---------------------------------------------------------------------------

	function onBeforeUnload(e: BeforeUnloadEvent) {
		if (hasUnsavedChanges.value) {
			e.preventDefault();
			// Setting returnValue is still required for cross-browser compatibility.
			e.returnValue = '';
		}
	}

	if (enableBeforeUnload) {
		onMounted(() => {
			window.addEventListener('beforeunload', onBeforeUnload);
		});
	}

	// ---------------------------------------------------------------------------
	// canDeactivate (imperative, for non-router contexts)
	// ---------------------------------------------------------------------------

	function canDeactivate(): Promise<boolean> {
		if (!hasUnsavedChanges.value) return Promise.resolve(true);

		if (mode === 'banner') {
			triggerJiggle();
			return Promise.resolve(false);
		}

		// Dialog mode — open dialog and return a promise.
		if (pendingResolve) {
			pendingResolve(false);
			pendingResolve = null;
		}

		isDialogOpen.value = true;
		return new Promise<boolean>((resolve) => {
			pendingResolve = resolve;
		});
	}

	// ---------------------------------------------------------------------------
	// Cleanup: close dialog when unsaved changes are cleared externally
	// ---------------------------------------------------------------------------

	watch(hasUnsavedChanges, (dirty) => {
		if (!dirty && isDialogOpen.value) {
			// Changes were saved/reset while the dialog was open — dismiss it.
			isDialogOpen.value = false;
			if (pendingResolve) {
				pendingResolve(true);
				pendingResolve = null;
			}
		}
	});

	// ---------------------------------------------------------------------------
	// Auto-register with the global outlet
	// ---------------------------------------------------------------------------

	const registry = standalone ? null : useUnsavedChangesRegistry();
	if (registry) {
		const unregister = registry.register({
			isOpen: isDialogOpen,
			confirm: confirmNavigation,
			cancel: cancelNavigation,
			title: dialogTitle,
			description: dialogDescription,
			confirmText: dialogConfirmText,
			cancelText: dialogCancelText,
		});
		onBeforeUnmount(unregister);
	}

	// ---------------------------------------------------------------------------
	// Cleanup on unmount
	// ---------------------------------------------------------------------------

	onBeforeUnmount(() => {
		removeGuard?.();
		clearTimeout(jiggleTimer);
		if (enableBeforeUnload) {
			window.removeEventListener('beforeunload', onBeforeUnload);
		}
		// Reject any pending navigation so the guard doesn't hang.
		if (pendingResolve) {
			pendingResolve(false);
			pendingResolve = null;
		}
	});

	return {
		isDialogOpen,
		isJiggling,
		confirmNavigation,
		cancelNavigation,
		triggerJiggle,
		canDeactivate,
	};
}
