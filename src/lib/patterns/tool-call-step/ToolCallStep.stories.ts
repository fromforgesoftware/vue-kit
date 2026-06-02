import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import ToolCallStep from './ToolCallStep.vue';
import type { ToolCallStepStatus } from './tool-call-step';

const ALL_STATUS: ToolCallStepStatus[] = [
	'running',
	'done',
	'failed',
	'awaiting-confirmation',
	'awaiting-clarification',
];

type ToolCallStepArgs = InstanceType<typeof ToolCallStep>['$props'];

const meta = {
	title: 'Chat/ToolCallStep',
	component: ToolCallStep,
	tags: ['!autodocs'],
	argTypes: {
		toolName: { control: 'text' },
		status: { control: 'select', options: ALL_STATUS },
		args: { control: 'text' },
		result: { control: 'text' },
		error: { control: 'text' },
		defaultOpen: { control: 'boolean' },
	},
	args: {
		toolName: 'list_employees',
		status: 'running',
		args: '{"group":"Support","limit":10}',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Inline tool-call card for AI conversation surfaces. Renders the tool name, ' +
					'a status badge, and a collapsible body with args / result / error. Mirrors the ' +
					'"thinking trace" pattern from Claude / Vercel AI Elements.',
			},
		},
	},
	render: (args) => ({
		components: { ToolCallStep },
		setup: () => ({ args }),
		template: `<div class="w-full max-w-md"><ToolCallStep v-bind="args" /></div>`,
	}),
} satisfies Meta<ToolCallStepArgs>;

export default meta;
type Story = StoryObj<ToolCallStepArgs>;

export const Running: Story = {};

export const Done: Story = {
	args: {
		status: 'done',
		args: '{"group":"Support","limit":10}',
		result: '[{"id":"abc","name":"Alice"},{"id":"def","name":"Bob"}]',
	},
};

export const Failed: Story = {
	args: {
		status: 'failed',
		args: '{"id":"unknown"}',
		error: 'employee not found: unknown',
	},
};

export const AwaitingConfirmation: Story = {
	args: {
		toolName: 'update_employee',
		status: 'awaiting-confirmation',
		args: '{"id":"abc","role":"manager"}',
	},
};

export const AwaitingClarification: Story = {
	args: {
		toolName: 'list_schedules',
		status: 'awaiting-clarification',
		args: '{"tenant":"<unresolved>"}',
	},
};

export const AllStatuses: Story = {
	parameters: {
		docs: { description: { story: 'All five visual states stacked.' } },
	},
	render: () => ({
		components: { ToolCallStep },
		template: `
      <div class="flex flex-col gap-3 w-full max-w-md">
        <ToolCallStep tool-name="list_employees" status="running" />
        <ToolCallStep
          tool-name="list_schedules"
          status="done"
          args='{"date":"2026-05-15"}'
          result='[{"id":"x","start":"08:00"}]'
        />
        <ToolCallStep tool-name="get_employee" status="failed" error="not found" />
        <ToolCallStep tool-name="update_employee" status="awaiting-confirmation" />
        <ToolCallStep tool-name="list_schedules" status="awaiting-clarification" />
      </div>
    `,
	}),
};

// ─── Interactive (play) test ─────────────────────────────────────────────

export const InteractiveExpand: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		status: 'done',
		args: '{"group":"Support"}',
		result: '[{"id":"abc"}]',
	},
	render: (args) => ({
		components: { ToolCallStep },
		setup: () => ({ args }),
		template: `<div data-test-root class="w-full max-w-md p-2"><ToolCallStep v-bind="args" /></div>`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		// Closed-by-default for `done` status.
		expect(canvasElement.querySelector('[data-slot="tool-call-step-body"]')).toBeNull();
		const trigger = canvas.getByRole('button');
		await userEvent.click(trigger);
		expect(canvasElement.querySelector('[data-slot="tool-call-step-body"]')).not.toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	},
};
