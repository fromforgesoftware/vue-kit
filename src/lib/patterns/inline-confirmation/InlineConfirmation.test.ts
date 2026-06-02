import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InlineConfirmation from './InlineConfirmation.vue';

describe('InlineConfirmation', () => {
	describe('rendering', () => {
		it('renders root with data-slot and data-decision attribute', () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 'update_employee' },
			});
			const root = wrapper.find('[data-slot="inline-confirmation"]');
			expect(root.exists()).toBe(true);
			expect(root.attributes('data-decision')).toBe('pending');
		});

		it('shows the default title with the tool name when no slot is provided', () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 'delete_schedule' },
			});
			expect(wrapper.find('[data-slot="inline-confirmation-title"]').text()).toContain(
				'delete_schedule',
			);
		});

		it('renders summary when provided', () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 't', summary: 'Will delete the 16:00 shift.' },
			});
			expect(wrapper.find('[data-slot="inline-confirmation-summary"]').text()).toContain(
				'Will delete the 16:00 shift.',
			);
		});

		it('hides summary section when not provided', () => {
			const wrapper = mount(InlineConfirmation, { props: { toolName: 't' } });
			expect(wrapper.find('[data-slot="inline-confirmation-summary"]').exists()).toBe(false);
		});

		it('renders args inside a collapsible when provided', async () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 't', args: '{"id":"abc"}' },
			});
			// Args body lives inside a closed-by-default Collapsible — expand it.
			await wrapper
				.find('[data-slot="inline-confirmation-details"] [data-slot="collapsible-trigger"]')
				.trigger('click');
			const pre = wrapper.find('[data-slot="inline-confirmation-args"]');
			expect(pre.exists()).toBe(true);
			expect(pre.text()).toContain('"id": "abc"');
		});
	});

	// ============================================
	// Approve / Reject buttons
	// ============================================
	describe('actions', () => {
		it('renders both Approve and Reject buttons by default', () => {
			const wrapper = mount(InlineConfirmation, { props: { toolName: 't' } });
			expect(wrapper.find('[data-slot="inline-confirmation-approve"]').exists()).toBe(true);
			expect(wrapper.find('[data-slot="inline-confirmation-reject"]').exists()).toBe(true);
		});

		it('emits decide=approve when Approve clicked', async () => {
			const wrapper = mount(InlineConfirmation, { props: { toolName: 't' } });
			await wrapper.find('[data-slot="inline-confirmation-approve"]').trigger('click');
			const emitted = wrapper.emitted('decide');
			expect(emitted).toBeTruthy();
			expect(emitted![0]).toEqual(['approve']);
		});

		it('emits decide=reject when Reject clicked', async () => {
			const wrapper = mount(InlineConfirmation, { props: { toolName: 't' } });
			await wrapper.find('[data-slot="inline-confirmation-reject"]').trigger('click');
			const emitted = wrapper.emitted('decide');
			expect(emitted).toBeTruthy();
			expect(emitted![0]).toEqual(['reject']);
		});

		it('does not emit when busy', async () => {
			const wrapper = mount(InlineConfirmation, { props: { toolName: 't', busy: true } });
			await wrapper.find('[data-slot="inline-confirmation-approve"]').trigger('click');
			expect(wrapper.emitted('decide')).toBeUndefined();
		});

		it('disables both buttons while busy', () => {
			const wrapper = mount(InlineConfirmation, { props: { toolName: 't', busy: true } });
			expect(
				wrapper.find('[data-slot="inline-confirmation-approve"]').attributes('disabled'),
			).toBeDefined();
			expect(
				wrapper.find('[data-slot="inline-confirmation-reject"]').attributes('disabled'),
			).toBeDefined();
		});
	});

	// ============================================
	// Resolved state
	// ============================================
	describe('resolved state', () => {
		it('hides actions and shows Approved badge when decision=approve', () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 't', decision: 'approve' },
			});
			expect(wrapper.find('[data-slot="inline-confirmation-actions"]').exists()).toBe(false);
			const resolved = wrapper.find('[data-slot="inline-confirmation-resolved"]');
			expect(resolved.exists()).toBe(true);
			expect(resolved.attributes('data-decision')).toBe('approve');
			expect(resolved.text()).toContain('Approved');
		});

		it('shows Rejected badge when decision=reject', () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 't', decision: 'reject' },
			});
			const resolved = wrapper.find('[data-slot="inline-confirmation-resolved"]');
			expect(resolved.attributes('data-decision')).toBe('reject');
			expect(resolved.text()).toContain('Rejected');
		});

		it('does not emit further events when already decided', async () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 't', decision: 'approve' },
			});
			// The Approve button shouldn't even be in the DOM, but
			// calling onClick programmatically shouldn't emit either.
			expect(wrapper.find('[data-slot="inline-confirmation-approve"]').exists()).toBe(false);
			expect(wrapper.emitted('decide')).toBeUndefined();
		});
	});

	// ============================================
	// Slots
	// ============================================
	describe('slots', () => {
		it('renders a custom title slot in place of the default', () => {
			const wrapper = mount(InlineConfirmation, {
				props: { toolName: 't' },
				slots: { title: '<span data-testid="custom-title">Hold up</span>' },
			});
			expect(wrapper.find('[data-testid="custom-title"]').text()).toBe('Hold up');
			expect(wrapper.find('[data-slot="inline-confirmation-title"]').text()).toContain('Hold up');
		});
	});
});
