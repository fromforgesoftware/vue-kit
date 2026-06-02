import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InlineClarification from './InlineClarification.vue';

const baseOptions = [
	{ value: 't1', label: 'Acme Co.', description: 'Europe/Madrid' },
	{ value: 't2', label: 'Skyloop', description: 'Europe/London' },
];

describe('InlineClarification', () => {
	// ============================================
	// Rendering
	// ============================================
	describe('rendering', () => {
		it('renders root with data-slot and data-resolved', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'Which tenant?', options: baseOptions },
			});
			const root = wrapper.find('[data-slot="inline-clarification"]');
			expect(root.exists()).toBe(true);
			expect(root.attributes('data-resolved')).toBe('false');
		});

		it('renders the prompt', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'Which tenant?', options: baseOptions },
			});
			expect(wrapper.find('[data-slot="inline-clarification-prompt"]').text()).toBe(
				'Which tenant?',
			);
		});

		it('renders one radio option per item', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions },
			});
			const opts = wrapper.findAll('[data-slot="inline-clarification-option"]');
			expect(opts.length).toBe(2);
			expect(opts[0].attributes('data-value')).toBe('t1');
			expect(opts[1].attributes('data-value')).toBe('t2');
			expect(opts[0].text()).toContain('Acme Co.');
			expect(opts[0].text()).toContain('Europe/Madrid');
		});

		it('omits description when not provided', () => {
			const wrapper = mount(InlineClarification, {
				props: {
					prompt: 'p',
					options: [{ value: 'a', label: 'Just label' }],
				},
			});
			expect(wrapper.find('[data-slot="inline-clarification-option"]').text()).not.toContain(
				'undefined',
			);
		});
	});

	// ============================================
	// Selection + submit
	// ============================================
	describe('selection', () => {
		// Reka's RadioGroupItem renders a <button role="radio"> with `value` and
		// `data-state="checked|unchecked"` rather than a native <input>.
		const pickRadio = async (wrapper: ReturnType<typeof mount>, value: string) =>
			wrapper.find(`[role="radio"][value="${value}"]`).trigger('click');

		it('disables Submit until an option is picked', async () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions },
			});
			const submit = wrapper.find('[data-slot="inline-clarification-submit"]');
			expect(submit.attributes('disabled')).toBeDefined();
			await pickRadio(wrapper, 't1');
			expect(submit.attributes('disabled')).toBeUndefined();
		});

		it('emits submit with the chosen value', async () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions },
			});
			await pickRadio(wrapper, 't2');
			await wrapper.find('[data-slot="inline-clarification-submit"]').trigger('click');
			const emitted = wrapper.emitted('submit');
			expect(emitted).toBeTruthy();
			expect(emitted![0]).toEqual(['t2']);
		});

		it('does not emit when busy', async () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions, busy: true },
			});
			await pickRadio(wrapper, 't1');
			await wrapper.find('[data-slot="inline-clarification-submit"]').trigger('click');
			expect(wrapper.emitted('submit')).toBeUndefined();
		});

		it('disables radio items while busy', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions, busy: true },
			});
			// Reka propagates the group's disabled state via aria-disabled / data-disabled
			// on each item — the parent's `disabled` attribute is on the root group.
			const items = wrapper.findAll('[role="radio"]');
			expect(items.length).toBeGreaterThan(0);
			for (const item of items) {
				expect(item.attributes('disabled')).toBeDefined();
			}
		});
	});

	// ============================================
	// Resolved state
	// ============================================
	describe('resolved state', () => {
		it('hides the picker and shows the resolved label when selected is set', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions, selected: 't1' },
			});
			expect(wrapper.find('[data-slot="inline-clarification-options"]').exists()).toBe(false);
			expect(wrapper.find('[data-slot="inline-clarification-actions"]').exists()).toBe(false);
			const resolved = wrapper.find('[data-slot="inline-clarification-resolved"]');
			expect(resolved.exists()).toBe(true);
			expect(resolved.text()).toContain('Acme Co.');
		});

		it('falls back to the value if no matching option label', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions, selected: 'unknown-id' },
			});
			expect(wrapper.find('[data-slot="inline-clarification-resolved"]').text()).toContain(
				'unknown-id',
			);
		});

		it('sets data-resolved=true on root', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions, selected: 't1' },
			});
			expect(wrapper.find('[data-slot="inline-clarification"]').attributes('data-resolved')).toBe(
				'true',
			);
		});
	});

	// ============================================
	// Accessibility
	// ============================================
	describe('a11y', () => {
		it('sets aria-label from toolName when provided', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions, toolName: 'list_schedules' },
			});
			expect(wrapper.find('[data-slot="inline-clarification"]').attributes('aria-label')).toBe(
				'Clarification for list_schedules',
			);
		});

		it('falls back to a generic aria-label when no toolName', () => {
			const wrapper = mount(InlineClarification, {
				props: { prompt: 'p', options: baseOptions },
			});
			expect(wrapper.find('[data-slot="inline-clarification"]').attributes('aria-label')).toBe(
				'Clarification required',
			);
		});
	});
});
