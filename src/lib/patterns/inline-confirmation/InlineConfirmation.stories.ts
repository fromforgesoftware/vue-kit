import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent, within } from 'storybook/test';
import InlineConfirmation from './InlineConfirmation.vue';

type Args = InstanceType<typeof InlineConfirmation>['$props'];

const meta = {
	title: 'Chat/InlineConfirmation',
	component: InlineConfirmation,
	tags: ['!autodocs'],
	argTypes: {
		toolName: { control: 'text' },
		summary: { control: 'text' },
		args: { control: 'text' },
		decision: { control: 'select', options: [null, 'approve', 'reject'] },
		busy: { control: 'boolean' },
	},
	args: {
		toolName: 'update_employee',
		summary: "Will change Alice King's role to Manager.",
		args: '{"id":"abc","role":"manager"}',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Inline Approve/Reject card for write-tool confirmation flows in AI chats. ' +
					'Drop in the chat stream when an `ai.confirmation.request` broadcast arrives.',
			},
		},
	},
	render: (args) => ({
		components: { InlineConfirmation },
		setup: () => ({ args, onDecide: (d: string) => console.log('decide', d) }),
		template: `<div class="w-full max-w-md"><InlineConfirmation v-bind="args" @decide="onDecide" /></div>`,
	}),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Pending: Story = {};

export const Approved: Story = { args: { decision: 'approve' } };

export const Rejected: Story = { args: { decision: 'reject' } };

export const Busy: Story = { args: { busy: true } };

// ─── Interactive (play) test ─────────────────────────────────────────────

export const InteractiveApprove: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { InlineConfirmation },
		setup: () => {
			const decision = ref<'approve' | 'reject' | null>(null);
			return {
				decision,
				onDecide: (d: 'approve' | 'reject') => {
					decision.value = d;
				},
			};
		},
		template: `
      <div data-test-root class="w-full max-w-md p-2">
        <InlineConfirmation
          tool-name="update_employee"
          :decision="decision"
          @decide="onDecide"
        />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		// Pending: actions visible.
		expect(canvasElement.querySelector('[data-slot="inline-confirmation-actions"]')).not.toBeNull();
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));
		// Resolved: actions hidden, approved badge shown.
		expect(canvasElement.querySelector('[data-slot="inline-confirmation-actions"]')).toBeNull();
		const resolved = canvasElement.querySelector('[data-slot="inline-confirmation-resolved"]');
		expect(resolved).not.toBeNull();
		expect(resolved!.getAttribute('data-decision')).toBe('approve');
	},
};
