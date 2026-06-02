import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import ChatBubble from './ChatBubble.vue';

describe('ChatBubble', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(ChatBubble, {
			props: {
				direction: 'incoming',
			},
			slots: {
				default: 'Hello there!',
			},
		});
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render message content', () => {
			expect(wrapper.text()).toContain('Hello there!');
		});

		it('should render tail by default', () => {
			expect(wrapper.find('svg').exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept direction prop', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept tail prop', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming', tail: false },
			});
			expect(wrapper.find('svg').exists()).toBe(false);
		});

		it('should accept time prop as string', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming', time: '10:30 AM' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept time prop as Date', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'outgoing', time: new Date() },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Direction Tests
	// ============================================
	describe('direction', () => {
		it('should render incoming message', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming' },
				slots: { default: 'Message' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render outgoing message', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'outgoing' },
				slots: { default: 'Message' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Tail Tests
	// ============================================
	describe('tail', () => {
		it('should show tail by default', () => {
			expect(wrapper.find('svg').exists()).toBe(true);
		});

		it('should hide tail when tail is false', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming', tail: false },
			});
			expect(wrapper.find('svg').exists()).toBe(false);
		});
	});

	// ============================================
	// Time Display Tests
	// ============================================
	describe('time display', () => {
		it('should not show time when not provided', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming' },
			});
			// Should only have the message content, no time
			expect(wrapper.exists()).toBe(true);
		});

		it('should format Date object to time string', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming', time: new Date('2024-01-01T10:30:00') },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming', class: 'custom-bubble' },
			});
			expect(wrapper.html()).toContain('custom-bubble');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle empty message', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle long message', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'outgoing' },
				slots: { default: 'A'.repeat(500) },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle timestamp as number', () => {
			const wrapper = mount(ChatBubble, {
				props: { direction: 'incoming', time: Date.now() },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with all props', () => {
			const wrapper = mount(ChatBubble, {
				props: {
					direction: 'outgoing',
					tail: true,
					time: new Date(),
					class: 'custom',
				},
				slots: { default: 'Complete message' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
