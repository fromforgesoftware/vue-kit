import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ToolCallStep from './ToolCallStep.vue';

describe('ToolCallStep', () => {
	describe('rendering', () => {
		it('renders with root data-slot and status data attribute', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 'list_employees', status: 'running' },
			});
			const root = wrapper.find('[data-slot="tool-call-step"]');
			expect(root.exists()).toBe(true);
			expect(root.attributes('data-status')).toBe('running');
		});

		it('renders the tool name in the trigger', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 'list_employees', status: 'done' },
			});
			expect(wrapper.find('[data-slot="tool-call-step-trigger"]').text()).toContain(
				'list_employees',
			);
		});
	});

	// ============================================
	// Status labels + icons
	// ============================================
	describe('status', () => {
		it('shows "Calling…" + spinner when running', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'running' },
			});
			const badge = wrapper.find('[data-slot="tool-call-step-status"]');
			expect(badge.text()).toContain('Calling');
			// Spinner has a role=status from the chat bubble convention, or its own
			// data-slot. Easier: just check the badge has a child svg or spinner-ish element.
			expect(badge.element.children.length).toBeGreaterThan(0);
		});

		it('shows "Done" when done', () => {
			const wrapper = mount(ToolCallStep, { props: { toolName: 't', status: 'done' } });
			expect(wrapper.find('[data-slot="tool-call-step-status"]').text()).toContain('Done');
		});

		it('shows "Failed" when failed', () => {
			const wrapper = mount(ToolCallStep, { props: { toolName: 't', status: 'failed' } });
			expect(wrapper.find('[data-slot="tool-call-step-status"]').text()).toContain('Failed');
		});

		it('shows "Awaiting approval" when awaiting-confirmation', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'awaiting-confirmation' },
			});
			expect(wrapper.find('[data-slot="tool-call-step-status"]').text()).toContain(
				'Awaiting approval',
			);
		});

		it('shows "Needs clarification" when awaiting-clarification', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'awaiting-clarification' },
			});
			expect(wrapper.find('[data-slot="tool-call-step-status"]').text()).toContain(
				'Needs clarification',
			);
		});
	});

	// ============================================
	// Open/close behaviour
	// ============================================
	describe('expansion', () => {
		// Backed by Reka's Collapsible, which keeps the body element mounted and
		// toggles `aria-expanded` on the trigger / `data-state` on the root.
		const isOpen = (wrapper: ReturnType<typeof mount>) =>
			wrapper.find('[data-slot="tool-call-step-trigger"]').attributes('aria-expanded') === 'true';

		it('opens by default while running', () => {
			const wrapper = mount(ToolCallStep, { props: { toolName: 't', status: 'running' } });
			expect(isOpen(wrapper)).toBe(true);
		});

		it('opens by default when awaiting-confirmation', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'awaiting-confirmation' },
			});
			expect(isOpen(wrapper)).toBe(true);
		});

		it('closes by default when done', () => {
			const wrapper = mount(ToolCallStep, { props: { toolName: 't', status: 'done' } });
			expect(isOpen(wrapper)).toBe(false);
		});

		it('toggles on trigger click', async () => {
			const wrapper = mount(ToolCallStep, { props: { toolName: 't', status: 'done' } });
			expect(isOpen(wrapper)).toBe(false);
			await wrapper.find('[data-slot="tool-call-step-trigger"]').trigger('click');
			expect(isOpen(wrapper)).toBe(true);
		});

		it('respects defaultOpen=false override', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'running', defaultOpen: false },
			});
			expect(isOpen(wrapper)).toBe(false);
		});

		it('exposes aria-expanded matching open state', async () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'done' },
			});
			const trigger = wrapper.find('[data-slot="tool-call-step-trigger"]');
			expect(trigger.attributes('aria-expanded')).toBe('false');
			await trigger.trigger('click');
			expect(trigger.attributes('aria-expanded')).toBe('true');
		});
	});

	// ============================================
	// Body: args / result / error
	// ============================================
	describe('body content', () => {
		it('pretty-prints JSON-string args', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'done',
					args: '{"name":"alice","limit":10}',
					defaultOpen: true,
				},
			});
			const pre = wrapper.find('[data-slot="tool-call-step-args"]');
			expect(pre.text()).toContain('"name": "alice"');
			expect(pre.text()).toContain('"limit": 10');
		});

		it('renders object args as JSON', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'done',
					args: { foo: 'bar' },
					defaultOpen: true,
				},
			});
			expect(wrapper.find('[data-slot="tool-call-step-args"]').text()).toContain('"foo": "bar"');
		});

		it('renders non-JSON string args as raw text', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'done',
					args: 'employee-id=42',
					defaultOpen: true,
				},
			});
			expect(wrapper.find('[data-slot="tool-call-step-args"]').text()).toContain('employee-id=42');
		});

		it('renders result when status is done', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'done', result: 'ok', defaultOpen: true },
			});
			expect(wrapper.find('[data-slot="tool-call-step-result"]').text()).toContain('ok');
		});

		it('renders error in place of result when error is set', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'failed',
					result: 'ok',
					error: 'timeout',
					defaultOpen: true,
				},
			});
			expect(wrapper.find('[data-slot="tool-call-step-error"]').text()).toContain('timeout');
			expect(wrapper.find('[data-slot="tool-call-step-result"]').exists()).toBe(false);
		});

		it('hides args/result sections when neither is provided', () => {
			const wrapper = mount(ToolCallStep, {
				props: { toolName: 't', status: 'running', defaultOpen: true },
			});
			expect(wrapper.find('[data-slot="tool-call-step-args"]').exists()).toBe(false);
			expect(wrapper.find('[data-slot="tool-call-step-result"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Slots
	// ============================================
	describe('slots', () => {
		it('renders body slot with scoped args/result/error', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'done',
					args: '{"x":1}',
					result: 'ok',
					error: 'boom',
					defaultOpen: true,
				},
				slots: {
					body: `<template #body="{ args, result, error }">
            <div data-testid="custom-body">{{ args }}|{{ result }}|{{ error }}</div>
          </template>`,
				},
			});
			const node = wrapper.find('[data-testid="custom-body"]');
			expect(node.exists()).toBe(true);
			// Default body sections should be replaced by the slot.
			expect(wrapper.find('[data-slot="tool-call-step-args"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Edge cases
	// ============================================
	describe('edge cases', () => {
		it('handles invalid JSON args by emitting the raw string', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'done',
					args: '{ not really json',
					defaultOpen: true,
				},
			});
			expect(wrapper.find('[data-slot="tool-call-step-args"]').text()).toContain('not really json');
		});

		it('handles empty args/result gracefully', () => {
			const wrapper = mount(ToolCallStep, {
				props: {
					toolName: 't',
					status: 'done',
					args: '',
					result: '',
					defaultOpen: true,
				},
			});
			expect(wrapper.find('[data-slot="tool-call-step-args"]').exists()).toBe(false);
			expect(wrapper.find('[data-slot="tool-call-step-result"]').exists()).toBe(false);
		});
	});
});
