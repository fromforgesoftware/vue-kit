import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent, within } from 'storybook/test';
import InlineClarification from './InlineClarification.vue';

type Args = InstanceType<typeof InlineClarification>['$props'];

const tenantOptions = [
	{ value: '019e2a4f-603a-tenant', label: 'Acme Madrid', description: 'Europe/Madrid' },
	{ value: '019e2a50-714b-tenant', label: 'Acme London', description: 'Europe/London' },
	{ value: '019e2a51-825c-tenant', label: 'Acme New York', description: 'America/New_York' },
];

const meta = {
	title: 'Chat/InlineClarification',
	component: InlineClarification,
	tags: ['!autodocs'],
	argTypes: {
		prompt: { control: 'text' },
		toolName: { control: 'text' },
		selected: { control: 'text' },
		busy: { control: 'boolean' },
	},
	args: {
		prompt: 'Which tenant should I check?',
		options: tenantOptions,
		toolName: 'list_schedules',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Inline option picker shown in the chat stream when the AI needs the user ' +
					'to disambiguate before continuing — today: tenant resolution; future kinds: ' +
					'employee, group, schedule.',
			},
		},
	},
	render: (args) => ({
		components: { InlineClarification },
		setup: () => ({ args, onSubmit: (v: string) => console.log('submit', v) }),
		template: `<div class="w-full max-w-md"><InlineClarification v-bind="args" @submit="onSubmit" /></div>`,
	}),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Resolved: Story = {
	args: { selected: '019e2a4f-603a-tenant' },
};

export const Busy: Story = { args: { busy: true } };

export const SingleOption: Story = {
	args: { options: [{ value: 't1', label: 'Only choice' }] },
};

// ─── Interactive (play) test ─────────────────────────────────────────────

export const InteractivePick: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { InlineClarification },
		setup: () => {
			const selected = ref<string | null>(null);
			return {
				tenantOptions,
				selected,
				onSubmit: (v: string) => {
					selected.value = v;
				},
			};
		},
		template: `
      <div data-test-root class="w-full max-w-md p-2">
        <InlineClarification
          prompt="Which tenant?"
          :options="tenantOptions"
          :selected="selected"
          @submit="onSubmit"
        />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const submit = canvas.getByRole('button', { name: 'Continue' });
		// Submit disabled until pick.
		expect((submit as HTMLButtonElement).disabled).toBe(true);
		// Pick the second tenant. RadioGroupItem renders a button with role="radio".
		const radio = canvasElement.querySelector(
			'[role="radio"][value="019e2a50-714b-tenant"]',
		) as HTMLButtonElement;
		await userEvent.click(radio);
		expect((submit as HTMLButtonElement).disabled).toBe(false);
		await userEvent.click(submit);
		// Resolved state visible.
		const resolved = canvasElement.querySelector('[data-slot="inline-clarification-resolved"]');
		expect(resolved).not.toBeNull();
		expect(resolved!.textContent).toContain('Acme London');
	},
};
