import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent, within } from 'storybook/test';
import ChatPanel from './ChatPanel.vue';
import ChatBubble from '../../general/chat-bubble/ChatBubble.vue';
import Avatar from '../../general/avatar/Avatar.vue';
import Button from '../../general/button/Button.vue';
import Badge from '../../general/badge/Badge.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';
import type { ChatPanelMessage } from './chat-panel.js';

type ChatPanelArgs = InstanceType<typeof ChatPanel>['$props'];

const meta = {
	title: 'Chat/ChatPanel',
	component: ChatPanel,
	tags: ['!autodocs'],
	argTypes: {
		size: { control: 'select', options: ['sm', 'default'] },
		bordered: { control: 'boolean' },
		disabled: { control: 'boolean' },
		submitOnEnter: { control: 'boolean' },
		hideHeader: { control: 'boolean' },
		hideComposer: { control: 'boolean' },
		title: { control: 'text' },
		placeholder: { control: 'text' },
		emptyTitle: { control: 'text' },
		emptyDescription: { control: 'text' },
	},
	args: {
		title: 'Chat',
		placeholder: 'Type a message…',
		size: 'default',
		bordered: true,
		submitOnEnter: true,
		autoScroll: true,
		hideHeader: false,
		hideComposer: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Chrome-less chat surface: header + scrollable message list + composer. ' +
					'Layout-agnostic — drop it inside a `Dialog`, `Drawer`, full-screen page, ' +
					'inline card, or a fixed floating panel. Reusable across AI chat, ' +
					'user-to-user DM, support chat, etc — composition through slots, ' +
					'not variant props.',
			},
		},
	},
} satisfies Meta<ChatPanelArgs>;

export default meta;
type Story = StoryObj<ChatPanelArgs>;

// ─── Helpers ────────────────────────────────────────────────────────────────

const aiMessages: ChatPanelMessage[] = [
	{ id: 1, role: 'outgoing', content: 'Who is working tomorrow?' },
	{
		id: 2,
		role: 'incoming',
		content:
			'Three people are scheduled: Alice (08:00–16:00), Bob (12:00–20:00), and Carol (16:00–00:00).',
		author: 'Trading Bot AI',
	},
];

const dmMessages: ChatPanelMessage[] = [
	{
		id: 1,
		role: 'incoming',
		content: 'Can you cover my shift on Friday?',
		author: 'Kelly King',
		avatarUrl: '',
		time: new Date('2026-05-14T09:12:00'),
	},
	{
		id: 2,
		role: 'outgoing',
		content: 'Sure — which one?',
		author: 'You',
		time: new Date('2026-05-14T09:14:00'),
	},
	{
		id: 3,
		role: 'incoming',
		content: 'The late one, 16:00–00:00.',
		author: 'Kelly King',
		time: new Date('2026-05-14T09:15:00'),
	},
];

// ─── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {
	render: (args) => ({
		components: { ChatPanel },
		setup: () => {
			const messages = ref<ChatPanelMessage[]>([...aiMessages]);
			const draft = ref('');
			function onSubmit(text: string) {
				messages.value.push({ id: Date.now(), role: 'outgoing', content: text });
				setTimeout(() => {
					messages.value.push({
						id: Date.now(),
						role: 'incoming',
						content: 'Got it — this is a mock reply.',
					});
				}, 400);
			}
			return { args, messages, draft, onSubmit };
		},
		template: `
      <div class="h-[500px] w-[420px]">
        <ChatPanel
          v-bind="args"
          v-model="draft"
          :messages="messages"
          @submit="onSubmit"
        />
      </div>
    `,
	}),
};

export const EmptyState: Story = {
	parameters: {
		docs: { description: { story: 'Empty state with default title/description.' } },
	},
	args: {
		title: 'New chat',
		emptyTitle: 'Welcome to Trading Bot AI',
		emptyDescription: 'Ask anything about your workforce.',
	},
	render: (args) => ({
		components: { ChatPanel },
		setup: () => ({ args, messages: ref<ChatPanelMessage[]>([]), draft: ref('') }),
		template: `
      <div class="h-[500px] w-[420px]">
        <ChatPanel v-bind="args" v-model="draft" :messages="messages" />
      </div>
    `,
	}),
};

export const AIWithBadgeAndActions: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'AI-assistant style — BETA badge + header actions + tool dropdown in the composer. ' +
					'Slot composition only, no variant prop required.',
			},
		},
	},
	render: (args) => ({
		components: { ChatPanel, Badge, Button },
		setup: () => {
			const messages = ref<ChatPanelMessage[]>([...aiMessages]);
			const draft = ref('');
			return { args, messages, draft };
		},
		template: `
      <div class="h-[520px] w-[440px]">
        <ChatPanel v-bind="args" v-model="draft" :messages="messages">
          <template #header-start>
            <Badge variant="outline" class="text-[10px] font-semibold tracking-wide">BETA</Badge>
          </template>
          <template #header-title>
            <h2 class="truncate text-sm font-semibold">New chat</h2>
          </template>
          <template #header-actions>
            <Button variant="ghost" size="icon-sm" aria-label="Close">✕</Button>
          </template>
          <template #composer-leading>
            <Button variant="ghost" size="xs" class="text-muted-foreground">
              <span>Tools ▾</span>
            </Button>
          </template>
        </ChatPanel>
      </div>
    `,
	}),
};

export const UserToUserWithAvatars: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'User-to-user DM style — same component, just a custom `message` render-prop ' +
					'that adds avatars and author names.',
			},
		},
	},
	render: (args) => ({
		components: { ChatPanel, ChatBubble, Avatar },
		setup: () => {
			const messages = ref<ChatPanelMessage[]>([...dmMessages]);
			const draft = ref('');
			return { args, messages, draft };
		},
		template: `
      <div class="h-[520px] w-[440px]">
        <ChatPanel v-bind="args" title="Kelly King" v-model="draft" :messages="messages">
          <template #message="{ message }">
            <div
              :class="[
                'flex items-end gap-2',
                message.role === 'outgoing' ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <Avatar
                v-if="message.role === 'incoming'"
                :name="message.author || 'User'"
                size="sm"
                class="shrink-0"
              />
              <ChatBubble :direction="message.role" :time="message.time" :author-label="message.author">
                <span class="whitespace-pre-wrap">{{ message.content }}</span>
              </ChatBubble>
            </div>
          </template>
        </ChatPanel>
      </div>
    `,
	}),
};

export const ReadOnlyHistory: Story = {
	parameters: {
		docs: { description: { story: 'Composer hidden — useful for archived conversations.' } },
	},
	args: { hideComposer: true, title: 'Archived conversation' },
	render: (args) => ({
		components: { ChatPanel },
		setup: () => ({ args, messages: ref<ChatPanelMessage[]>([...dmMessages]) }),
		template: `
      <div class="h-[420px] w-[420px]">
        <ChatPanel v-bind="args" :messages="messages" />
      </div>
    `,
	}),
};

export const Loading: Story = {
	parameters: {
		docs: { description: { story: 'Loading bubble at the tail acts as a typing indicator.' } },
	},
	render: (args) => ({
		components: { ChatPanel },
		setup: () => {
			const messages = ref<ChatPanelMessage[]>([
				{ id: 1, role: 'outgoing', content: "What's the weather?" },
				{ id: 2, role: 'incoming', loading: true },
			]);
			const draft = ref('');
			return { args, messages, draft };
		},
		template: `
      <div class="h-[420px] w-[420px]">
        <ChatPanel v-bind="args" title="Trading Bot AI" v-model="draft" :messages="messages" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: '`size` controls bubble density.' } },
	},
	render: () => ({
		components: { ChatPanel },
		setup: () => ({
			messages: ref<ChatPanelMessage[]>([...aiMessages]),
			draft: ref(''),
		}),
		template: `
      <div class="flex gap-4">
        <div class="h-[400px] w-[360px]">
          <ChatPanel size="sm" bordered title="sm" v-model="draft" :messages="messages" />
        </div>
        <div class="h-[400px] w-[360px]">
          <ChatPanel size="default" bordered title="default" v-model="draft" :messages="messages" />
        </div>
      </div>
    `,
	}),
};

// ─── Interactive (play) tests ───────────────────────────────────────────────

export const InteractiveSubmit: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ChatPanel },
		setup: () => {
			const messages = ref<ChatPanelMessage[]>([]);
			const draft = ref('');
			function onSubmit(text: string) {
				messages.value.push({ id: Date.now(), role: 'outgoing', content: text });
			}
			return { messages, draft, onSubmit };
		},
		template: `
      <div data-test-root class="h-[420px] w-[420px]">
        <ChatPanel
          title="Test"
          bordered
          v-model="draft"
          :messages="messages"
          @submit="onSubmit"
        />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		const textarea = canvas.getByPlaceholderText('Type a message…') as HTMLTextAreaElement;
		const sendBtn = canvasElement.querySelector(
			'[data-slot="chat-panel-send"]',
		) as HTMLButtonElement;

		// Empty draft → send disabled.
		expect(sendBtn.disabled).toBe(true);

		// Type a message and click send.
		await userEvent.type(textarea, 'Hello world');
		expect(sendBtn.disabled).toBe(false);
		await userEvent.click(sendBtn);

		// Bubble should appear; draft cleared; send disabled again.
		const bubbles = root.querySelectorAll('[data-slot="chat-bubble"]');
		expect(bubbles.length).toBe(1);
		expect(textarea.value).toBe('');
		expect(sendBtn.disabled).toBe(true);

		// Enter submits.
		await userEvent.type(textarea, 'second');
		await userEvent.keyboard('{Enter}');
		expect(root.querySelectorAll('[data-slot="chat-bubble"]').length).toBe(2);
		expect(textarea.value).toBe('');

		// Shift+Enter inserts newline, does not submit.
		await userEvent.type(textarea, 'multi');
		await userEvent.keyboard('{Shift>}{Enter}{/Shift}line');
		expect(textarea.value).toBe('multi\nline');
		expect(root.querySelectorAll('[data-slot="chat-bubble"]').length).toBe(2);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ChatPanel },
		setup: () => ({
			messages: ref<ChatPanelMessage[]>([
				...aiMessages,
				{
					id: 99,
					role: 'incoming',
					content:
						'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.',
				},
			]),
			draft: ref(''),
		}),
		template: `
      <div data-test-root class="h-screen w-full p-2">
        <ChatPanel title="Responsive" bordered v-model="draft" :messages="messages" />
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
