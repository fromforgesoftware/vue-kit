import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import {
	createUnsavedChangesRegistry,
	provideUnsavedChangesRegistry,
	useUnsavedChangesRegistry,
} from './unsavedChangesRegistry';

describe('unsavedChangesRegistry', () => {
	it('starts with no active registration', () => {
		const registry = createUnsavedChangesRegistry();
		expect(registry.active.value).toBeNull();
	});

	it('exposes a registration as active only while its isOpen is true', () => {
		const registry = createUnsavedChangesRegistry();
		const isOpen = ref(false);
		registry.register({ isOpen, confirm: () => {}, cancel: () => {} });

		expect(registry.active.value).toBeNull();
		isOpen.value = true;
		expect(registry.active.value).not.toBeNull();
		isOpen.value = false;
		expect(registry.active.value).toBeNull();
	});

	it('unregister removes the registration', () => {
		const registry = createUnsavedChangesRegistry();
		const isOpen = ref(true);
		const unregister = registry.register({ isOpen, confirm: () => {}, cancel: () => {} });

		expect(registry.active.value).not.toBeNull();
		unregister();
		expect(registry.active.value).toBeNull();
	});

	it('returns the most recently registered guard when several are open (inner-most wins)', () => {
		const registry = createUnsavedChangesRegistry();
		const outerOpen = ref(true);
		const innerOpen = ref(true);
		const outer = { isOpen: outerOpen, confirm: () => {}, cancel: () => {}, title: 'outer' };
		const inner = { isOpen: innerOpen, confirm: () => {}, cancel: () => {}, title: 'inner' };

		registry.register(outer);
		registry.register(inner);

		expect(registry.active.value?.title).toBe('inner');
		innerOpen.value = false;
		expect(registry.active.value?.title).toBe('outer');
	});

	it('forwards optional dialog labels through the registration', () => {
		const registry = createUnsavedChangesRegistry();
		const isOpen = ref(true);
		registry.register({
			isOpen,
			confirm: () => {},
			cancel: () => {},
			title: 'Custom title',
			description: 'Custom description',
			confirmText: 'Leave',
			cancelText: 'Stay',
		});

		const active = registry.active.value!;
		expect(active.title).toBe('Custom title');
		expect(active.description).toBe('Custom description');
		expect(active.confirmText).toBe('Leave');
		expect(active.cancelText).toBe('Stay');
	});

	describe('provide/inject', () => {
		it('useUnsavedChangesRegistry returns null without a provider', async () => {
			let observed: ReturnType<typeof useUnsavedChangesRegistry> | undefined;
			const Child = defineComponent({
				setup() {
					observed = useUnsavedChangesRegistry();
					return () => h('div');
				},
			});
			mount(Child);
			await flushPromises();
			expect(observed).toBeNull();
		});

		it('useUnsavedChangesRegistry returns the provided instance', async () => {
			let observed: ReturnType<typeof useUnsavedChangesRegistry> | undefined;
			const Child = defineComponent({
				setup() {
					observed = useUnsavedChangesRegistry();
					return () => h('div');
				},
			});
			const Parent = defineComponent({
				components: { Child },
				setup() {
					const registry = provideUnsavedChangesRegistry();
					return { registry };
				},
				template: '<Child />',
			});
			const wrapper = mount(Parent);
			await flushPromises();
			expect(observed).toBe((wrapper.vm as { registry: unknown }).registry);
		});
	});
});
