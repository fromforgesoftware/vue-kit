import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { __resetModalStackForTests, useModal } from './useModal.js';

const DummyComponent = defineComponent({
	name: 'Dummy',
	setup: () => () => h('div'),
});

describe('useModal', () => {
	afterEach(() => __resetModalStackForTests());

	it('open() pushes onto the stack + isOpen flips true', () => {
		const m = useModal();
		expect(m.isOpen.value).toBe(false);

		m.open(DummyComponent, { x: 1 });

		expect(m.isOpen.value).toBe(true);
		expect(m.stack.value).toHaveLength(1);
		expect(m.stack.value[0].props).toEqual({ x: 1 });
		expect(m.current.value?.component).toBe(DummyComponent);
	});

	it('resolve(value) settles the open promise and removes the entry', async () => {
		const m = useModal();
		const promise = m.open<string>(DummyComponent);

		m.resolve('answer');

		await expect(promise).resolves.toBe('answer');
		expect(m.isOpen.value).toBe(false);
	});

	it('dismiss(id) rejects the promise', async () => {
		const m = useModal();
		const promise = m.open<string>(DummyComponent);

		m.dismiss(undefined, 'user-cancel');

		await expect(promise).rejects.toBe('user-cancel');
	});

	it('multiple modals stack and resolve top-down by default', async () => {
		const m = useModal();
		const first = m.open<string>(DummyComponent, { i: 1 });
		const second = m.open<string>(DummyComponent, { i: 2 });

		expect(m.stack.value).toHaveLength(2);
		expect(m.current.value?.props.i).toBe(2);

		m.resolve('second');
		await expect(second).resolves.toBe('second');

		m.resolve('first');
		await expect(first).resolves.toBe('first');
	});

	it('resolve(value, id) targets a specific modal regardless of stack position', async () => {
		const m = useModal();
		const first = m.open<string>(DummyComponent);
		const firstId = m.stack.value[0].id;
		const second = m.open<string>(DummyComponent);

		m.resolve('first-result', firstId);

		await expect(first).resolves.toBe('first-result');
		expect(m.stack.value).toHaveLength(1);
		expect(m.stack.value[0]).toBe(m.current.value);

		m.resolve('second-result');
		await expect(second).resolves.toBe('second-result');
	});

	it('close(id) drops without resolving or rejecting', async () => {
		const m = useModal();
		const promise = m.open<string>(DummyComponent);

		let settled = false;
		promise.then(
			() => {
				settled = true;
			},
			() => {
				settled = true;
			},
		);

		m.close();

		expect(m.isOpen.value).toBe(false);
		await new Promise((r) => setTimeout(r, 0));
		expect(settled).toBe(false);
	});

	it('replace dismisses a previous modal before pushing', () => {
		const m = useModal();
		m.open(DummyComponent, {}, { id: 'wizard' });
		expect(m.stack.value.map((e) => e.id)).toContain('wizard');

		m.open(DummyComponent, { step: 2 }, { id: 'wizard-2', replace: 'wizard' });

		expect(m.stack.value).toHaveLength(1);
		expect(m.stack.value[0].id).toBe('wizard-2');
	});
});
