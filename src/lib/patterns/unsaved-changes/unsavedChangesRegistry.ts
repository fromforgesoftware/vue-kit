import {
	inject,
	provide,
	shallowRef,
	computed,
	type InjectionKey,
	type Ref,
	type ComputedRef,
	type MaybeRefOrGetter,
} from 'vue';

/**
 * A single guard registration. The registry tracks one of these per
 * active `useFormGuard` / `useUnsavedChanges` call so the global
 * `<UnsavedChangesOutlet>` can render the dialog wired to whichever
 * guard is currently asking for a decision.
 *
 * Label fields accept `MaybeRefOrGetter<string>` so pages can pass a
 * computed (e.g. a description that includes a live dirty-count) and the
 * outlet stays reactive.
 */
export interface UnsavedChangesRegistration {
	isOpen: Ref<boolean>;
	confirm: () => void;
	cancel: () => void;
	title?: MaybeRefOrGetter<string>;
	description?: MaybeRefOrGetter<string>;
	confirmText?: MaybeRefOrGetter<string>;
	cancelText?: MaybeRefOrGetter<string>;
}

export interface UnsavedChangesRegistry {
	/** Register a guard. Returns an unregister fn (call on unmount). */
	register: (r: UnsavedChangesRegistration) => () => void;
	/** The guard currently requesting a decision, or null. */
	active: ComputedRef<UnsavedChangesRegistration | null>;
}

export const UnsavedChangesRegistryKey: InjectionKey<UnsavedChangesRegistry> =
	Symbol('UnsavedChangesRegistry');

export function createUnsavedChangesRegistry(): UnsavedChangesRegistry {
	// `shallowRef` keeps the inner `isOpen` refs intact. A normal `ref` would
	// auto-unwrap them when stored in a reactive proxy, so `r.isOpen.value`
	// would read as undefined.
	const guards = shallowRef<UnsavedChangesRegistration[]>([]);

	function register(r: UnsavedChangesRegistration) {
		guards.value = [...guards.value, r];
		return () => {
			guards.value = guards.value.filter((g) => g !== r);
		};
	}

	// Only one guard can be visually open at a time (a single navigation
	// attempt blocks the user). If multiple are open due to nested forms,
	// the most recently registered wins — that's the inner-most form.
	const active = computed(() => {
		for (let i = guards.value.length - 1; i >= 0; i--) {
			if (guards.value[i].isOpen.value) return guards.value[i];
		}
		return null;
	});

	return { register, active };
}

/** Install the registry. Call this once at the app root before mounting `<UnsavedChangesOutlet>`. */
export function provideUnsavedChangesRegistry(): UnsavedChangesRegistry {
	const registry = createUnsavedChangesRegistry();
	provide(UnsavedChangesRegistryKey, registry);
	return registry;
}

/** Inject the registry. Returns null when no provider is installed (page renders its own dialog). */
export function useUnsavedChangesRegistry(): UnsavedChangesRegistry | null {
	return inject(UnsavedChangesRegistryKey, null);
}
