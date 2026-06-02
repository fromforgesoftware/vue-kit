import {
	ref,
	computed,
	watch,
	toValue,
	onBeforeUnmount,
	type Ref,
	type ComputedRef,
	type MaybeRefOrGetter,
} from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useUnsavedChangesRegistry } from './unsavedChangesRegistry';

export type FormGuardMode = 'dialog' | 'banner';

export interface UseFormGuardOptions<T = unknown> {
	/** Which UI to show on navigation attempt. Default: 'dialog'. */
	mode?: FormGuardMode;
	/** Enable the browser's native beforeunload prompt. Default: true. */
	enableBeforeUnload?: boolean;
	/**
	 * Custom deep-clone strategy for the working copy. Default is JSON
	 * round-trip, which is fine for plain data but strips class instances
	 * (e.g. `ForgeDate`, `Date`, `Map`, `Set`). Forms that hold class
	 * instances should pass a clone fn that preserves them.
	 */
	clone?: (value: T) => T;
	/**
	 * Custom serializer used by the `isModified` comparison. Default is
	 * `JSON.stringify`. If your `clone` preserves class instances, supply
	 * a serializer that yields a stable representation of those instances
	 * (e.g. by calling `.toISO()` on `ForgeDate`).
	 */
	serialize?: (value: T) => string;
	/**
	 * Skip auto-registration with the global `<UnsavedChangesOutlet>` and
	 * make the page render its own `<UnsavedChangesDialog>` via the
	 * returned `isDialogOpen` / `confirm` / `cancel`. Default: false.
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
	 * Hook invoked when the user confirms navigation. Runs before the
	 * navigation promise resolves — destructive side-effects belong here.
	 */
	onConfirm?: () => void;
	/** Hook invoked when the user cancels navigation. */
	onCancel?: () => void;
}

export interface UseFormGuardReturn<T> {
	/** Editable working copy. Bind inputs with `v-model="form.field"`. */
	form: Ref<T>;
	/** True when the working copy diverges from the baseline. */
	isModified: ComputedRef<boolean>;
	/** Re-baseline to the current source. Call after a successful save. */
	sync: () => void;
	/**
	 * Update `source` to a new value AND re-baseline in one call —
	 * shorthand for `source.value = next; sync()`. Use this on save success.
	 */
	commit: (next: T) => void;
	/** Bind to UnsavedChangesDialog `:open`. */
	isDialogOpen: Ref<boolean>;
	/** Bind to UnsavedChangesBanner `:jiggling`. */
	isJiggling: Ref<boolean>;
	/** Pass as the dialog's `@confirm` handler. */
	confirm: () => void;
	/** Pass as the dialog's `@cancel` handler. */
	cancel: () => void;
	/** Trigger the banner jiggle animation programmatically. */
	triggerJiggle: () => void;
	/** Imperative check for non-router contexts (drawers, tab switches). */
	canDeactivate: () => Promise<boolean>;
	/**
	 * Ask the user (via dialog if dirty) whether they want to leave, then
	 * invoke `onLeave` only if confirmed. Replaces the per-page
	 * `if (await canDeactivate()) emit('cancel')` boilerplate.
	 */
	requestCancel: (onLeave: () => void) => Promise<void>;
}

const JIGGLE_DURATION_MS = 400;

function defaultClone<T>(value: T): T {
	// JSON round-trip: form data is always JSON-safe, and this transparently
	// strips Vue reactive proxies — `structuredClone` chokes on them.
	return JSON.parse(JSON.stringify(value));
}

function defaultSerialize<T>(value: T): string {
	return JSON.stringify(value);
}

function isRefLike<T>(v: MaybeRefOrGetter<T>): v is Ref<T> {
	return typeof v === 'object' && v !== null && 'value' in v;
}

/**
 * Form-aware unsaved-changes guard.
 *
 * Tracks `isModified` from a baseline snapshot of the source — no manual
 * `watch` or stringify glue per page. Uses `onBeforeRouteLeave` (component
 * scoped) so cleanup is automatic; also wires the browser `beforeunload`
 * prompt and an imperative `canDeactivate()` for non-router contexts.
 */
export function useFormGuard<T extends object>(
	source: MaybeRefOrGetter<T>,
	options: UseFormGuardOptions<T> = {},
): UseFormGuardReturn<T> {
	const {
		mode = 'dialog',
		enableBeforeUnload = true,
		clone = defaultClone,
		serialize = defaultSerialize,
		standalone = false,
		dialogTitle,
		dialogDescription,
		dialogConfirmText,
		dialogCancelText,
		onConfirm,
		onCancel,
	} = options;

	const form = ref(clone(toValue(source))) as Ref<T>;

	watch(
		() => toValue(source),
		(next) => {
			form.value = clone(next);
		},
		{ deep: true },
	);

	const isModified = computed(() => serialize(form.value) !== serialize(toValue(source)));

	function sync() {
		form.value = clone(toValue(source));
	}

	function commit(next: T) {
		const target = toValue(source);
		// `source` may be a getter (read-only from our side); only re-assign
		// when it's a Ref the caller passed in.
		if (isRefLike(source)) {
			(source as Ref<T>).value = next;
		} else {
			// Plain getter source: mutate in place so deep watchers fire.
			Object.assign(target as object, next);
		}
		sync();
	}

	const isDialogOpen = ref(false);
	const isJiggling = ref(false);
	let pendingResolve: ((allowed: boolean) => void) | null = null;
	let jiggleTimer: ReturnType<typeof setTimeout> | undefined;
	// Set when `canDeactivate()` resolves true so the imminent route nav
	// (triggered by the consumer right after) doesn't re-prompt the user.
	// One-shot: cleared by the route guard, or on the next edit if no nav
	// happened, so a stale bypass can't silently let later navigations through.
	let bypassNextRouteGuard = false;

	function triggerJiggle() {
		isJiggling.value = true;
		clearTimeout(jiggleTimer);
		jiggleTimer = setTimeout(() => {
			isJiggling.value = false;
		}, JIGGLE_DURATION_MS);
	}

	function confirm() {
		onConfirm?.();
		// "Discard changes" semantics — revert the working copy to baseline so
		// `isModified` becomes false. Without this, a subsequent close attempt
		// (e.g. reka-ui Drawer interpreting the dialog-overlay click as a
		// click-outside event) would re-trigger the guard and double-prompt.
		sync();
		pendingResolve?.(true);
		pendingResolve = null;
		isDialogOpen.value = false;
	}

	function cancel() {
		onCancel?.();
		pendingResolve?.(false);
		pendingResolve = null;
		isDialogOpen.value = false;
	}

	function open(): Promise<boolean> {
		if (pendingResolve) {
			pendingResolve(false);
			pendingResolve = null;
		}
		isDialogOpen.value = true;
		return new Promise<boolean>((resolve) => {
			pendingResolve = resolve;
		});
	}

	onBeforeRouteLeave(async () => {
		if (bypassNextRouteGuard) {
			bypassNextRouteGuard = false;
			return true;
		}
		if (!isModified.value) return true;
		if (mode === 'banner') {
			triggerJiggle();
			return false;
		}
		return open();
	});

	function onBeforeUnload(e: BeforeUnloadEvent) {
		if (isModified.value) {
			e.preventDefault();
			e.returnValue = '';
		}
	}

	if (enableBeforeUnload && typeof window !== 'undefined') {
		window.addEventListener('beforeunload', onBeforeUnload);
	}

	async function canDeactivate(): Promise<boolean> {
		if (!isModified.value) return true;
		if (mode === 'banner') {
			triggerJiggle();
			return false;
		}
		const allowed = await open();
		if (allowed) bypassNextRouteGuard = true;
		return allowed;
	}

	async function requestCancel(onLeave: () => void): Promise<void> {
		if (await canDeactivate()) onLeave();
	}

	// Auto-register with the global outlet so the page doesn't need to render
	// its own `<UnsavedChangesDialog>`. Falls back to the per-page render
	// when no outlet is installed or the caller opts out via `standalone`.
	const registry = standalone ? null : useUnsavedChangesRegistry();
	if (registry) {
		const unregister = registry.register({
			isOpen: isDialogOpen,
			confirm,
			cancel,
			title: dialogTitle,
			description: dialogDescription,
			confirmText: dialogConfirmText,
			cancelText: dialogCancelText,
		});
		onBeforeUnmount(unregister);
	}

	watch(isModified, (dirty) => {
		if (!dirty && isDialogOpen.value) confirm();
		// Any new edit invalidates a stale bypass so we don't silently let the
		// next nav slip past the guard after the form's been re-dirtied.
		if (dirty) bypassNextRouteGuard = false;
	});

	onBeforeUnmount(() => {
		clearTimeout(jiggleTimer);
		if (enableBeforeUnload && typeof window !== 'undefined') {
			window.removeEventListener('beforeunload', onBeforeUnload);
		}
		if (pendingResolve) {
			pendingResolve(false);
			pendingResolve = null;
		}
	});

	return {
		form,
		isModified,
		sync,
		commit,
		isDialogOpen,
		isJiggling,
		confirm,
		cancel,
		triggerJiggle,
		canDeactivate,
		requestCancel,
	};
}
