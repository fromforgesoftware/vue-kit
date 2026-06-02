import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import { useUnsavedChanges, type UseUnsavedChangesReturn } from './useUnsavedChanges';

interface Setup {
	api: UseUnsavedChangesReturn;
	hasUnsavedChanges: Ref<boolean>;
	router: Router;
	unmount: () => void;
}

async function mountComposable(
	opts: { withRouter?: boolean; enableBeforeUnload?: boolean } = {},
): Promise<Setup> {
	const { withRouter = true, enableBeforeUnload = true } = opts;
	const hasUnsavedChanges = ref(false);
	const apiRef = { current: undefined as UseUnsavedChangesReturn | undefined };

	const router = createRouter({
		history: createMemoryHistory('/'),
		routes: [
			{ path: '/', component: { template: '<div>home</div>' } },
			{ path: '/other', component: { template: '<div>other</div>' } },
		],
	});

	const Host = defineComponent({
		setup() {
			apiRef.current = useUnsavedChanges({
				hasUnsavedChanges,
				router: withRouter ? router : undefined,
				enableBeforeUnload,
			});
			return () => h('div', 'host');
		},
	});

	let wrapper;
	if (withRouter) {
		router.addRoute({ path: '/host', component: Host });
		await router.push('/host');
		await router.isReady();
		const App = defineComponent({ template: '<router-view />' });
		wrapper = mount(App, {
			global: { plugins: [router], stubs: { teleport: false } },
			attachTo: document.body,
		});
	} else {
		wrapper = mount(Host, { attachTo: document.body });
	}

	await flushPromises();
	await nextTick();

	if (!apiRef.current) {
		throw new Error('useUnsavedChanges did not run — Host component never mounted');
	}

	return {
		api: apiRef.current,
		hasUnsavedChanges,
		router,
		unmount: () => wrapper.unmount(),
	};
}

describe('useUnsavedChanges', () => {
	describe('canDeactivate', () => {
		it('resolves true immediately when there are no unsaved changes', async () => {
			const setup = await mountComposable({ withRouter: false });
			await nextTick();

			await expect(setup.api.canDeactivate()).resolves.toBe(true);
			expect(setup.api.isDialogOpen.value).toBe(false);
			setup.unmount();
		});

		it('opens the dialog and resolves true on confirm', async () => {
			const setup = await mountComposable({ withRouter: false });
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const pending = setup.api.canDeactivate();
			await nextTick();
			expect(setup.api.isDialogOpen.value).toBe(true);

			setup.api.confirmNavigation();
			await expect(pending).resolves.toBe(true);
			setup.unmount();
		});

		it('opens the dialog and resolves false on cancel', async () => {
			const setup = await mountComposable({ withRouter: false });
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const pending = setup.api.canDeactivate();
			await nextTick();
			expect(setup.api.isDialogOpen.value).toBe(true);

			setup.api.cancelNavigation();
			await expect(pending).resolves.toBe(false);
			setup.unmount();
		});

		it('rejects the previous decision when canDeactivate is called twice', async () => {
			const setup = await mountComposable({ withRouter: false });
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const first = setup.api.canDeactivate();
			await nextTick();
			const second = setup.api.canDeactivate();
			await nextTick();

			// First call's resolver gets booted with false.
			await expect(first).resolves.toBe(false);

			setup.api.confirmNavigation();
			await expect(second).resolves.toBe(true);
			setup.unmount();
		});
	});

	describe('router guard', () => {
		it('allows navigation when clean', async () => {
			const setup = await mountComposable();
			await setup.router.isReady();
			await nextTick();

			await setup.router.push('/other');
			expect(setup.router.currentRoute.value.path).toBe('/other');
			setup.unmount();
		});

		it('blocks and opens dialog when dirty, then allows on confirm', async () => {
			const setup = await mountComposable();
			await setup.router.isReady();
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const nav = setup.router.push('/other');
			await flushPromises();
			expect(setup.api.isDialogOpen.value).toBe(true);

			setup.api.confirmNavigation();
			await nav;
			expect(setup.router.currentRoute.value.path).toBe('/other');
			expect(setup.api.isDialogOpen.value).toBe(false);
			setup.unmount();
		});

		it('keeps the route when dialog is cancelled', async () => {
			const setup = await mountComposable();
			await setup.router.isReady();
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const startPath = setup.router.currentRoute.value.path;
			const nav = setup.router.push('/other').catch(() => 'aborted');
			await flushPromises();
			expect(setup.api.isDialogOpen.value).toBe(true);

			setup.api.cancelNavigation();
			await nav;
			expect(setup.router.currentRoute.value.path).toBe(startPath);
			setup.unmount();
		});

		it('does nothing when no router is supplied', async () => {
			const setup = await mountComposable({ withRouter: false });
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			// No throw; no dialog opens without explicit canDeactivate call.
			expect(setup.api.isDialogOpen.value).toBe(false);
			setup.unmount();
		});
	});

	describe('auto-dismiss when changes clear externally', () => {
		it('closes an open dialog and resolves true when hasUnsavedChanges flips false', async () => {
			const setup = await mountComposable({ withRouter: false });
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const pending = setup.api.canDeactivate();
			await nextTick();
			expect(setup.api.isDialogOpen.value).toBe(true);

			setup.hasUnsavedChanges.value = false;
			await nextTick();

			await expect(pending).resolves.toBe(true);
			expect(setup.api.isDialogOpen.value).toBe(false);
			setup.unmount();
		});
	});

	describe('beforeunload', () => {
		it('registers and removes the beforeunload listener', async () => {
			const addSpy = vi.spyOn(window, 'addEventListener');
			const removeSpy = vi.spyOn(window, 'removeEventListener');

			const setup = await mountComposable({ withRouter: false });
			await nextTick();

			const added = addSpy.mock.calls.find(([type]) => type === 'beforeunload');
			expect(added).toBeTruthy();

			setup.unmount();
			const removed = removeSpy.mock.calls.find(([type]) => type === 'beforeunload');
			expect(removed).toBeTruthy();
			expect(removed?.[1]).toBe(added?.[1]);

			addSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it('does not register when enableBeforeUnload is false', async () => {
			const addSpy = vi.spyOn(window, 'addEventListener');

			const setup = await mountComposable({ withRouter: false, enableBeforeUnload: false });
			await nextTick();

			expect(addSpy.mock.calls.find(([type]) => type === 'beforeunload')).toBeUndefined();

			setup.unmount();
			addSpy.mockRestore();
		});

		it('prevents the unload when dirty', async () => {
			const handlers: Array<(e: BeforeUnloadEvent) => void> = [];
			const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
				if (type === 'beforeunload') handlers.push(handler as (e: BeforeUnloadEvent) => void);
			});

			const setup = await mountComposable({ withRouter: false });
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const event = { preventDefault: vi.fn(), returnValue: '' } as unknown as BeforeUnloadEvent;
			handlers.forEach((h) => h(event));
			expect(event.preventDefault).toHaveBeenCalled();

			setup.unmount();
			addSpy.mockRestore();
		});

		it('does not prevent the unload when clean', async () => {
			const handlers: Array<(e: BeforeUnloadEvent) => void> = [];
			const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
				if (type === 'beforeunload') handlers.push(handler as (e: BeforeUnloadEvent) => void);
			});

			const setup = await mountComposable({ withRouter: false });
			await nextTick();

			const event = { preventDefault: vi.fn(), returnValue: '' } as unknown as BeforeUnloadEvent;
			handlers.forEach((h) => h(event));
			expect(event.preventDefault).not.toHaveBeenCalled();

			setup.unmount();
			addSpy.mockRestore();
		});
	});

	describe('jiggle', () => {
		it('toggles isJiggling for the jiggle duration', async () => {
			vi.useFakeTimers();
			try {
				const setup = await mountComposable({ withRouter: false });

				setup.api.triggerJiggle();
				expect(setup.api.isJiggling.value).toBe(true);

				vi.advanceTimersByTime(400);
				expect(setup.api.isJiggling.value).toBe(false);
				setup.unmount();
			} finally {
				vi.useRealTimers();
			}
		});
	});

	describe('cleanup', () => {
		it('rejects pending decision and removes router guard on unmount', async () => {
			const setup = await mountComposable();
			await setup.router.isReady();
			await nextTick();
			setup.hasUnsavedChanges.value = true;

			const pending = setup.api.canDeactivate();
			await nextTick();
			expect(setup.api.isDialogOpen.value).toBe(true);

			setup.unmount();
			await expect(pending).resolves.toBe(false);

			// Guard is gone — navigating on the router now resolves without prompting.
			await setup.router.push('/other');
			expect(setup.router.currentRoute.value.path).toBe('/other');
		});
	});
});
