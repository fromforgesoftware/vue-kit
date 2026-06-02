import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { useFormGuard, type UseFormGuardReturn } from './useFormGuard';
import {
	createUnsavedChangesRegistry,
	UnsavedChangesRegistryKey,
	type UnsavedChangesRegistry,
} from './unsavedChangesRegistry';

interface FormState {
	name: string;
	age: number;
	nested?: { tag: string };
}

// Mounts the composable inside a fully wired router-view so
// onBeforeRouteLeave gets registered. Route components are resolved
// async by router-view — we await router.isReady() and the next ticks
// to ensure Page (and therefore useFormGuard) has actually run.
async function mountWithGuard(
	source: Ref<FormState>,
	options: Parameters<typeof useFormGuard<FormState>>[1] = {},
) {
	const apiRef = { current: undefined as UseFormGuardReturn<FormState> | undefined };

	const Page = defineComponent({
		setup() {
			apiRef.current = useFormGuard(source, options);
			return () => h('div', 'page');
		},
	});
	const Other = defineComponent({ setup: () => () => h('div', 'other') });

	const router = createRouter({
		history: createMemoryHistory('/'),
		routes: [
			{ path: '/', component: Page },
			{ path: '/other', component: Other },
		],
	});

	const App = defineComponent({
		components: { Page, Other },
		template: '<router-view />',
	});

	const registry = createUnsavedChangesRegistry();
	const wrapper = mount(App, {
		global: {
			plugins: [router],
			stubs: { teleport: false },
			provide: { [UnsavedChangesRegistryKey as symbol]: registry },
		},
		attachTo: document.body,
	});

	await router.isReady();
	await flushPromises();
	await nextTick();

	if (!apiRef.current) {
		throw new Error('useFormGuard did not run — Page component never mounted');
	}

	return {
		api: apiRef.current,
		router,
		wrapper,
		registry,
	} as {
		api: UseFormGuardReturn<FormState>;
		router: ReturnType<typeof createRouter>;
		wrapper: ReturnType<typeof mount>;
		registry: UnsavedChangesRegistry;
	};
}

describe('useFormGuard', () => {
	describe('dirty tracking', () => {
		it('starts not modified and matches source', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			expect(api.isModified.value).toBe(false);
			expect(api.form.value).toEqual({ name: 'Alice', age: 30 });
			// Working copy is decoupled from source — mutating one must not leak.
			expect(api.form.value).not.toBe(source.value);
			wrapper.unmount();
		});

		it('becomes modified when the working copy diverges', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			expect(api.isModified.value).toBe(true);
			wrapper.unmount();
		});

		it('clears modified when the working copy is reverted to match source', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();
			expect(api.isModified.value).toBe(true);

			api.form.value.name = 'Alice';
			await nextTick();
			expect(api.isModified.value).toBe(false);
			wrapper.unmount();
		});

		it('re-baselines via sync()', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();
			expect(api.isModified.value).toBe(true);

			source.value = { name: 'Bob', age: 30 };
			api.sync();
			await nextTick();

			expect(api.isModified.value).toBe(false);
			wrapper.unmount();
		});

		it('re-clones form when source changes externally', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			source.value = { name: 'Carol', age: 40 };
			await nextTick();

			expect(api.form.value).toEqual({ name: 'Carol', age: 40 });
			expect(api.isModified.value).toBe(false);
			wrapper.unmount();
		});
	});

	describe('dialog flow', () => {
		it('opens dialog and resolves true on confirm', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const pending = api.canDeactivate();
			await nextTick();
			expect(api.isDialogOpen.value).toBe(true);

			api.confirm();
			await expect(pending).resolves.toBe(true);
			expect(api.isDialogOpen.value).toBe(false);
			wrapper.unmount();
		});

		it('opens dialog and resolves false on cancel', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const pending = api.canDeactivate();
			await nextTick();
			expect(api.isDialogOpen.value).toBe(true);

			api.cancel();
			await expect(pending).resolves.toBe(false);
			expect(api.isDialogOpen.value).toBe(false);
			wrapper.unmount();
		});

		it('canDeactivate resolves true without opening the dialog when clean', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			await expect(api.canDeactivate()).resolves.toBe(true);
			expect(api.isDialogOpen.value).toBe(false);
			wrapper.unmount();
		});

		it('auto-dismisses an open dialog when isModified flips false (e.g. external reset)', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const pending = api.canDeactivate();
			await nextTick();
			expect(api.isDialogOpen.value).toBe(true);

			// Save happens out-of-band: source moves to match form, dialog should auto-confirm.
			source.value = { name: 'Bob', age: 30 };
			await nextTick();

			await expect(pending).resolves.toBe(true);
			expect(api.isDialogOpen.value).toBe(false);
			wrapper.unmount();
		});
	});

	describe('router guard', () => {
		it('allows navigation when form is clean', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { router, wrapper } = await mountWithGuard(source);

			await router.push('/other');
			expect(router.currentRoute.value.path).toBe('/other');
			wrapper.unmount();
		});

		it('blocks navigation and resolves via dialog confirm', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, router, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const nav = router.push('/other');
			// Let the guard run and open the dialog.
			await nextTick();
			await nextTick();
			expect(api.isDialogOpen.value).toBe(true);
			expect(router.currentRoute.value.path).toBe('/');

			api.confirm();
			await nav;
			expect(router.currentRoute.value.path).toBe('/other');
			wrapper.unmount();
		});

		it('keeps the user on the page when dialog is cancelled', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, router, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const nav = router.push('/other').catch(() => 'aborted');
			await nextTick();
			await nextTick();
			expect(api.isDialogOpen.value).toBe(true);

			api.cancel();
			await nav;
			expect(router.currentRoute.value.path).toBe('/');
			wrapper.unmount();
		});

		it('skips re-prompt after canDeactivate resolves true (one-shot bypass)', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, router, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const decision = api.canDeactivate();
			await nextTick();
			api.confirm();
			await expect(decision).resolves.toBe(true);

			// Imminent navigation must pass through without re-opening the dialog.
			await router.push('/other');
			expect(router.currentRoute.value.path).toBe('/other');
			expect(api.isDialogOpen.value).toBe(false);
			wrapper.unmount();
		});
	});

	describe('beforeunload', () => {
		it('registers and removes the beforeunload listener', async () => {
			const addSpy = vi.spyOn(window, 'addEventListener');
			const removeSpy = vi.spyOn(window, 'removeEventListener');

			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { wrapper } = await mountWithGuard(source);

			const added = addSpy.mock.calls.find(([type]) => type === 'beforeunload');
			expect(added).toBeTruthy();

			wrapper.unmount();
			const removed = removeSpy.mock.calls.find(([type]) => type === 'beforeunload');
			expect(removed).toBeTruthy();
			// Same handler reference for add + remove
			expect(removed?.[1]).toBe(added?.[1]);

			addSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it('does not register when enableBeforeUnload is false', async () => {
			const addSpy = vi.spyOn(window, 'addEventListener');

			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { wrapper } = await mountWithGuard(source, { enableBeforeUnload: false });

			expect(addSpy.mock.calls.find(([type]) => type === 'beforeunload')).toBeUndefined();

			wrapper.unmount();
			addSpy.mockRestore();
		});

		it('prevents the unload event when modified', async () => {
			const handlers: Array<(e: BeforeUnloadEvent) => void> = [];
			const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
				if (type === 'beforeunload') handlers.push(handler as (e: BeforeUnloadEvent) => void);
			});

			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			const event = { preventDefault: vi.fn(), returnValue: '' } as unknown as BeforeUnloadEvent;
			handlers.forEach((h) => h(event));
			expect(event.preventDefault).toHaveBeenCalled();

			wrapper.unmount();
			addSpy.mockRestore();
		});
	});

	describe('jiggle', () => {
		it('toggles isJiggling for the jiggle duration', async () => {
			vi.useFakeTimers();
			try {
				const source = ref<FormState>({ name: 'Alice', age: 30 });
				const { api, wrapper } = await mountWithGuard(source);

				api.triggerJiggle();
				expect(api.isJiggling.value).toBe(true);

				vi.advanceTimersByTime(400);
				expect(api.isJiggling.value).toBe(false);
				wrapper.unmount();
			} finally {
				vi.useRealTimers();
			}
		});
	});

	describe('custom serialize', () => {
		it('honours a custom serializer for diffing', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30, nested: { tag: 'a' } });
			// Treat only `name` as significant for dirty checks.
			const { api, wrapper } = await mountWithGuard(source, {
				serialize: (v) => v.name,
			});

			api.form.value.age = 99;
			await nextTick();
			expect(api.isModified.value).toBe(false);

			api.form.value.name = 'Bob';
			await nextTick();
			expect(api.isModified.value).toBe(true);
			wrapper.unmount();
		});
	});

	describe('cleanup on unmount', () => {
		it('resolves pending dialog with false on unmount', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const guard = await mountWithGuard(source);

			guard.api.form.value.name = 'Bob';
			await nextTick();

			const pending = guard.api.canDeactivate();
			await nextTick();
			expect(guard.api.isDialogOpen.value).toBe(true);

			guard.wrapper.unmount();
			await expect(pending).resolves.toBe(false);
		});
	});

	describe('commit', () => {
		it('replaces source and re-baselines in one call', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();
			expect(api.isModified.value).toBe(true);

			api.commit({ name: 'Bob', age: 30 });
			await nextTick();

			expect(source.value).toEqual({ name: 'Bob', age: 30 });
			expect(api.isModified.value).toBe(false);
			wrapper.unmount();
		});
	});

	describe('requestCancel', () => {
		it('invokes onLeave immediately when form is clean', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			let leftCount = 0;
			await api.requestCancel(() => {
				leftCount += 1;
			});

			expect(leftCount).toBe(1);
			expect(api.isDialogOpen.value).toBe(false);
			wrapper.unmount();
		});

		it('prompts and invokes onLeave when the user confirms', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			let leftCount = 0;
			const pending = api.requestCancel(() => {
				leftCount += 1;
			});
			await nextTick();
			expect(api.isDialogOpen.value).toBe(true);

			api.confirm();
			await pending;
			expect(leftCount).toBe(1);
			wrapper.unmount();
		});

		it('does not invoke onLeave when the user cancels', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const { api, wrapper } = await mountWithGuard(source);

			api.form.value.name = 'Bob';
			await nextTick();

			let leftCount = 0;
			const pending = api.requestCancel(() => {
				leftCount += 1;
			});
			await nextTick();
			api.cancel();
			await pending;

			expect(leftCount).toBe(0);
			wrapper.unmount();
		});
	});

	describe('registry auto-registration', () => {
		it('registers with a provided registry on mount and unregisters on unmount', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const guard = await mountWithGuard(source);

			expect(guard.registry.active.value).toBeNull();

			guard.api.form.value.name = 'Bob';
			await nextTick();
			// Open the dialog imperatively so the registry exposes the guard as active.
			void guard.api.canDeactivate();
			await nextTick();

			expect(guard.registry.active.value).not.toBeNull();
			expect(guard.registry.active.value?.isOpen.value).toBe(true);

			guard.wrapper.unmount();
			expect(guard.registry.active.value).toBeNull();
		});

		it('skips registration when standalone is true', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const guard = await mountWithGuard(source, { standalone: true });

			guard.api.form.value.name = 'Bob';
			await nextTick();
			void guard.api.canDeactivate();
			await nextTick();

			// Even though the dialog is open, the registry was bypassed.
			expect(guard.api.isDialogOpen.value).toBe(true);
			expect(guard.registry.active.value).toBeNull();
			guard.wrapper.unmount();
		});

		it('forwards dialogTitle / description / labels through the registration', async () => {
			const source = ref<FormState>({ name: 'Alice', age: 30 });
			const guard = await mountWithGuard(source, {
				dialogTitle: 'Custom title',
				dialogDescription: 'Custom description',
				dialogConfirmText: 'Leave',
				dialogCancelText: 'Stay',
			});

			guard.api.form.value.name = 'Bob';
			await nextTick();
			void guard.api.canDeactivate();
			await nextTick();

			const active = guard.registry.active.value;
			expect(active?.title).toBe('Custom title');
			expect(active?.description).toBe('Custom description');
			expect(active?.confirmText).toBe('Leave');
			expect(active?.cancelText).toBe('Stay');
			guard.wrapper.unmount();
		});
	});
});
