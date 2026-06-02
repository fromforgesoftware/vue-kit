import { describe, it, expect, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import UnsavedChangesOutlet from './UnsavedChangesOutlet.vue';
import {
	createUnsavedChangesRegistry,
	UnsavedChangesRegistryKey,
	type UnsavedChangesRegistry,
} from './unsavedChangesRegistry.js';

function mountOutlet(registry: UnsavedChangesRegistry | null) {
	const Host = defineComponent({
		components: { UnsavedChangesOutlet },
		template: '<UnsavedChangesOutlet />',
	});
	return mount(Host, {
		attachTo: document.body,
		global: {
			stubs: { teleport: false, Teleport: false },
			provide: registry ? { [UnsavedChangesRegistryKey as symbol]: registry } : {},
		},
	});
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('UnsavedChangesOutlet', () => {
	it('renders nothing when no registry is provided', async () => {
		mountOutlet(null);
		await flushPromises();
		expect(document.querySelector('[data-slot="unsaved-changes-confirm"]')).toBeNull();
	});

	it('renders nothing when no guard is active', async () => {
		const registry = createUnsavedChangesRegistry();
		mountOutlet(registry);
		await flushPromises();
		expect(document.querySelector('[data-slot="unsaved-changes-confirm"]')).toBeNull();
	});

	it('renders the dialog when a registered guard opens', async () => {
		const registry = createUnsavedChangesRegistry();
		const isOpen = ref(false);
		registry.register({ isOpen, confirm: () => {}, cancel: () => {} });

		mountOutlet(registry);
		await flushPromises();
		expect(document.querySelector('[data-slot="unsaved-changes-confirm"]')).toBeNull();

		isOpen.value = true;
		await flushPromises();
		expect(document.querySelector('[data-slot="unsaved-changes-confirm"]')).not.toBeNull();
	});

	it('forwards confirm + cancel clicks to the active guard', async () => {
		const registry = createUnsavedChangesRegistry();
		const isOpen = ref(true);
		let confirmed = 0;
		let cancelled = 0;
		registry.register({
			isOpen,
			confirm: () => {
				confirmed += 1;
			},
			cancel: () => {
				cancelled += 1;
			},
		});

		mountOutlet(registry);
		await flushPromises();
		(document.querySelector('[data-slot="unsaved-changes-confirm"]') as HTMLElement).click();
		expect(confirmed).toBe(1);
		expect(cancelled).toBe(0);

		// Re-open to test cancel path.
		isOpen.value = true;
		await flushPromises();
		(document.querySelector('[data-slot="unsaved-changes-cancel"]') as HTMLElement).click();
		expect(cancelled).toBe(1);
		expect(confirmed).toBe(1);
	});

	it('honours custom dialog labels from the registration', async () => {
		const registry = createUnsavedChangesRegistry();
		const isOpen = ref(true);
		registry.register({
			isOpen,
			confirm: () => {},
			cancel: () => {},
			title: 'Leaving the wizard?',
			confirmText: 'Abandon',
			cancelText: 'Resume',
		});

		mountOutlet(registry);
		await flushPromises();
		expect(document.body.textContent).toContain('Leaving the wizard?');
		expect(document.body.textContent).toContain('Abandon');
		expect(document.body.textContent).toContain('Resume');
	});

	it('switches the rendered dialog when the active guard changes', async () => {
		const registry = createUnsavedChangesRegistry();
		const outerOpen = ref(true);
		const innerOpen = ref(false);
		registry.register({
			isOpen: outerOpen,
			confirm: () => {},
			cancel: () => {},
			title: 'Outer dialog',
		});
		registry.register({
			isOpen: innerOpen,
			confirm: () => {},
			cancel: () => {},
			title: 'Inner dialog',
		});

		mountOutlet(registry);
		await flushPromises();
		expect(document.body.textContent).toContain('Outer dialog');

		innerOpen.value = true;
		await flushPromises();
		expect(document.body.textContent).toContain('Inner dialog');
	});
});
