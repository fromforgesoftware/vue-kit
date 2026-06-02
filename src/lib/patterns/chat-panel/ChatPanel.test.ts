import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ChatPanel from './ChatPanel.vue';
import type { ChatPanelMessage } from './chat-panel';

const baseMessages: ChatPanelMessage[] = [
	{ id: 1, role: 'incoming', content: 'Hi' },
	{ id: 2, role: 'outgoing', content: 'Hello!' },
];

describe('ChatPanel', () => {
	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('renders root with data-slot', () => {
			const wrapper = mount(ChatPanel, { props: { messages: [] } });
			expect(wrapper.find('[data-slot="chat-panel"]').exists()).toBe(true);
		});

		it('renders header by default', () => {
			const wrapper = mount(ChatPanel, { props: { messages: [], title: 'Chat' } });
			expect(wrapper.find('[data-slot="chat-panel-header"]').exists()).toBe(true);
			expect(wrapper.find('[data-slot="chat-panel-title"]').text()).toBe('Chat');
		});

		it('renders composer by default', () => {
			const wrapper = mount(ChatPanel, { props: { messages: [] } });
			expect(wrapper.find('[data-slot="chat-panel-composer"]').exists()).toBe(true);
		});

		it('renders one bubble per message', () => {
			const wrapper = mount(ChatPanel, { props: { messages: baseMessages } });
			expect(wrapper.findAll('[data-slot="chat-bubble"]').length).toBe(2);
		});
	});

	// ============================================
	// Empty State
	// ============================================
	describe('empty state', () => {
		it('renders empty placeholder when no messages and no footer slot', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], emptyTitle: 'Nothing here' },
			});
			expect(wrapper.find('[data-slot="chat-panel-empty"]').exists()).toBe(true);
			expect(wrapper.text()).toContain('Nothing here');
		});

		it('does not render empty state when messages-footer slot is used', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [] },
				slots: { 'messages-footer': '<div data-testid="footer">x</div>' },
			});
			expect(wrapper.find('[data-slot="chat-panel-empty"]').exists()).toBe(false);
			expect(wrapper.find('[data-testid="footer"]').exists()).toBe(true);
		});
	});

	// ============================================
	// Visibility Toggles
	// ============================================
	describe('section toggles', () => {
		it('hides header when hideHeader=true', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], hideHeader: true, title: 'Chat' },
			});
			expect(wrapper.find('[data-slot="chat-panel-header"]').exists()).toBe(false);
		});

		it('hides composer when hideComposer=true', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], hideComposer: true },
			});
			expect(wrapper.find('[data-slot="chat-panel-composer"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Slots
	// ============================================
	describe('slots', () => {
		it('renders header-actions slot', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [] },
				slots: { 'header-actions': '<button data-testid="x">x</button>' },
			});
			expect(wrapper.find('[data-testid="x"]').exists()).toBe(true);
		});

		it('renders message slot with item + index scope', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: baseMessages },
				slots: {
					message: `<template #message="{ message, index }">
              <div data-testid="custom">{{ index }}-{{ message.content }}</div>
            </template>`,
				},
			});
			const custom = wrapper.findAll('[data-testid="custom"]');
			expect(custom.length).toBe(2);
			expect(custom[0].text()).toBe('0-Hi');
			expect(custom[1].text()).toBe('1-Hello!');
			// Default bubble rendering is bypassed when the slot is provided.
			expect(wrapper.find('[data-slot="chat-bubble"]').exists()).toBe(false);
		});

		it('renders composer-leading slot with scope', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [] },
				slots: { 'composer-leading': '<span data-testid="lead">L</span>' },
			});
			expect(wrapper.find('[data-testid="lead"]').exists()).toBe(true);
		});

		it('replaces the default send button via the send-button slot', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [] },
				slots: {
					'send-button': `<template #send-button="{ submit, canSubmit }">
              <button data-testid="custom-send" :disabled="!canSubmit" @click="submit">Go</button>
            </template>`,
				},
			});
			expect(wrapper.find('[data-testid="custom-send"]').exists()).toBe(true);
			expect(wrapper.find('[data-slot="chat-panel-send"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Composer Behaviour
	// ============================================
	describe('composer', () => {
		it('emits submit on send click with trimmed text', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: '  hello  ' },
			});
			await wrapper.find('[data-slot="chat-panel-send"]').trigger('click');
			const emitted = wrapper.emitted('submit');
			expect(emitted).toBeTruthy();
			expect(emitted![0]).toEqual(['hello']);
		});

		it('clears the draft after submit', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: 'hi' },
			});
			await wrapper.find('[data-slot="chat-panel-send"]').trigger('click');
			const updates = wrapper.emitted('update:modelValue');
			expect(updates).toBeTruthy();
			// Last emission should be the cleared value.
			expect(updates![updates!.length - 1]).toEqual(['']);
		});

		it('does not submit when draft is whitespace only', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: '   ' },
			});
			await wrapper.find('[data-slot="chat-panel-send"]').trigger('click');
			expect(wrapper.emitted('submit')).toBeUndefined();
		});

		it('disables send button when draft is empty', async () => {
			const wrapper = mount(ChatPanel, { props: { messages: [] } });
			const btn = wrapper.find('[data-slot="chat-panel-send"]');
			expect(btn.attributes('disabled')).toBeDefined();
		});

		it('submits on Enter when submitOnEnter is true (default)', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: 'hi' },
			});
			await wrapper.find('textarea').trigger('keydown', { key: 'Enter' });
			expect(wrapper.emitted('submit')).toBeTruthy();
		});

		it('does not submit on Shift+Enter', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: 'hi' },
			});
			await wrapper.find('textarea').trigger('keydown', { key: 'Enter', shiftKey: true });
			expect(wrapper.emitted('submit')).toBeUndefined();
		});

		it('respects submitOnEnter=false', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: 'hi', submitOnEnter: false },
			});
			await wrapper.find('textarea').trigger('keydown', { key: 'Enter' });
			expect(wrapper.emitted('submit')).toBeUndefined();
		});

		it('blocks submit when disabled', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], modelValue: 'hi', disabled: true },
			});
			await wrapper.find('[data-slot="chat-panel-send"]').trigger('click');
			expect(wrapper.emitted('submit')).toBeUndefined();
		});
	});

	// ============================================
	// Auto-scroll
	// ============================================
	describe('auto-scroll', () => {
		it('exposes scrollToBottom and focus via defineExpose', async () => {
			const wrapper = mount(ChatPanel, { props: { messages: [] } });
			const vm = wrapper.vm as unknown as {
				scrollToBottom: () => Promise<void>;
				focus: () => void;
			};
			expect(typeof vm.scrollToBottom).toBe('function');
			expect(typeof vm.focus).toBe('function');
			// Should not throw even before the body has measurable height.
			await vm.scrollToBottom();
		});
	});

	// ============================================
	// Variants
	// ============================================
	describe('variants', () => {
		it('applies bordered variant', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], bordered: true },
			});
			const root = wrapper.find('[data-slot="chat-panel"]');
			expect(root.classes().join(' ')).toContain('rounded-xl');
		});

		it('propagates size to the default bubble renderer', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: baseMessages, size: 'sm' },
			});
			// Bubble's `sm` variant uses px-2.5 + text-xs.
			const bubble = wrapper.find('[data-slot="chat-bubble-content"]');
			expect(bubble.classes().join(' ')).toContain('text-xs');
		});

		it('merges custom class prop on the root', () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [], class: 'custom-panel' },
			});
			expect(wrapper.find('[data-slot="chat-panel"]').classes()).toContain('custom-panel');
		});
	});

	// ============================================
	// Reactivity
	// ============================================
	describe('reactivity', () => {
		it('renders newly appended messages', async () => {
			const wrapper = mount(ChatPanel, {
				props: { messages: [...baseMessages] },
			});
			expect(wrapper.findAll('[data-slot="chat-bubble"]').length).toBe(2);
			await wrapper.setProps({
				messages: [...baseMessages, { id: 3, role: 'incoming', content: 'Welcome' }],
			});
			await nextTick();
			expect(wrapper.findAll('[data-slot="chat-bubble"]').length).toBe(3);
			expect(wrapper.text()).toContain('Welcome');
		});

		it('renders loading bubble (typing indicator) without content', async () => {
			const wrapper = mount(ChatPanel, {
				props: {
					messages: [{ id: 1, role: 'incoming', loading: true }],
				},
			});
			const bubble = wrapper.find('[data-slot="chat-bubble-content"]');
			expect(bubble.attributes('role')).toBe('status');
		});
	});
});
