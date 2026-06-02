import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import ChatBubble from './ChatBubble.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

type ChatBubblePropsAndCustomArgs = InstanceType<typeof ChatBubble>['$props'] & {
	message?: string;
};

const ALL_DIRECTIONS = ['incoming', 'outgoing', 'system'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Chat/ChatBubble',
	component: ChatBubble,
	tags: ['!autodocs'],
	argTypes: {
		direction: {
			control: 'select',
			options: ALL_DIRECTIONS,
			description: 'Author of the message — controls colour, alignment, and tail.',
		},
		size: { control: 'select', options: ALL_SIZES, description: 'Density of the bubble.' },
		tail: { control: 'boolean' },
		time: { control: 'date' },
		loading: {
			control: 'boolean',
			description: 'Replaces the slot with a spinner inside the bubble.',
		},
		authorLabel: {
			control: 'text',
			description: 'Accessible name for the author. Used in aria-label.',
		},
		message: { control: 'text', table: { disable: false } },
	},
	args: {
		direction: 'outgoing',
		size: 'default',
		tail: true,
		time: new Date('2024-01-01T10:30:00'),
		message: 'Hey! How are you?',
		authorLabel: 'Kelly King',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Speech bubble used in chat / messaging surfaces. Three directions cover incoming, outgoing, and system messages.',
			},
		},
	},
	render: (args) => ({
		components: { ChatBubble },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-96">
        <ChatBubble
          :direction="args.direction"
          :size="args.size"
          :tail="args.tail"
          :time="args.time"
          :loading="args.loading"
          :author-label="args.authorLabel"
        >
          <span>{{ args.message }}</span>
        </ChatBubble>
      </div>
    `,
	}),
} satisfies Meta<ChatBubblePropsAndCustomArgs>;

export default meta;
type Story = StoryObj<ChatBubblePropsAndCustomArgs>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Conversation: Story = {
	parameters: {
		docs: {
			description: { story: "Three directions stacked the way they'd appear in a conversation." },
		},
	},
	render: () => ({
		components: { ChatBubble },
		template: `
      <div class="flex flex-col gap-3 w-full max-w-96">
        <ChatBubble direction="incoming" :time="new Date('2024-01-01T10:28:00')" author-label="Kelly King">
          <span>Hey, do you have a minute?</span>
        </ChatBubble>
        <ChatBubble direction="outgoing" :time="new Date('2024-01-01T10:29:00')">
          <span>Sure, what's up?</span>
        </ChatBubble>
        <ChatBubble direction="system" :tail="false">
          <span class="text-xs">Kelly added Sam Olsen to the conversation.</span>
        </ChatBubble>
        <ChatBubble direction="incoming" :time="new Date('2024-01-01T10:30:00')" author-label="Kelly King">
          <span>Quick question about the schedule for next week.</span>
        </ChatBubble>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three densities. `sm` for compact lists; `default` for general use; `lg` for dedicated chat surfaces.',
			},
		},
	},
	render: () => ({
		components: { ChatBubble },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-3 w-full max-w-96">
        <ChatBubble v-for="s in ALL_SIZES" :key="s" :size="s" direction="incoming">
          <span>Size: {{ s }}</span>
        </ChatBubble>
      </div>
    `,
	}),
};

export const NoTail: Story = {
	args: { tail: false },
	parameters: {
		docs: {
			description: { story: 'Set `tail` to false for grouped messages or system notifications.' },
		},
	},
};

export const Loading: Story = {
	args: { loading: true },
	parameters: {
		docs: {
			description: {
				story:
					'When awaiting an upstream message, set `loading` — the bubble renders a spinner with a polite live region.',
			},
		},
	},
	render: (args) => ({
		components: { ChatBubble },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-96">
        <ChatBubble direction="incoming" :tail="args.tail" :loading="true" />
      </div>
    `,
	}),
};

export const SystemMessage: Story = {
	args: {
		direction: 'system',
		tail: false,
		time: undefined,
		message: 'Sam Olsen joined the conversation.',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Use `direction="system"` for centred, low-emphasis messages (joined / left, status changes).',
			},
		},
	},
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="chat-bubble"]')).toBeInTheDocument();
		await expect(
			canvasElement.querySelector('[data-slot="chat-bubble-content"]'),
		).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="chat-bubble-tail"]')).toBeInTheDocument();
	},
};

export const InteractiveAuthorLabel: Story = {
	tags: ['!autodocs', 'test'],
	args: { direction: 'incoming', authorLabel: 'Kelly King' },
	play: async ({ canvasElement }) => {
		const content = canvasElement.querySelector('[data-slot="chat-bubble-content"]') as HTMLElement;
		await expect(content).toHaveAttribute('aria-label', 'Message from Kelly King');
	},
};

export const InteractiveLoadingState: Story = {
	tags: ['!autodocs', 'test'],
	args: { loading: true },
	play: async ({ canvasElement }) => {
		const content = canvasElement.querySelector('[data-slot="chat-bubble-content"]') as HTMLElement;
		await expect(content).toHaveAttribute('role', 'status');
	},
};

export const InteractiveSystemHasNoTail: Story = {
	tags: ['!autodocs', 'test'],
	args: { direction: 'system', tail: true },
	play: async ({ canvasElement }) => {
		const tail = canvasElement.querySelector('[data-slot="chat-bubble-tail"]');
		await expect(tail).toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ChatBubble },
		template: `
      <div data-test-root class="flex flex-col gap-3 p-2 w-full">
        <ChatBubble direction="incoming"><span>The quick brown fox jumps over the lazy dog.</span></ChatBubble>
        <ChatBubble direction="outgoing"><span>The quick brown fox jumps over the lazy dog. The quick brown fox.</span></ChatBubble>
        <ChatBubble direction="system" :tail="false"><span class="text-xs">System note.</span></ChatBubble>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const bubbles = root.querySelectorAll('[data-slot="chat-bubble"]');
			await expect(bubbles.length).toBe(3);
		});
	},
};
