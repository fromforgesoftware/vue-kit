import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Avatar from './Avatar.vue';

describe('Avatar', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Avatar, {
			props: {
				name: 'John Doe',
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

		it('should render as span element (Reka UI AvatarRoot)', () => {
			expect(wrapper.element.tagName).toBe('SPAN');
		});

		it('should display initials when no image', () => {
			expect(wrapper.text()).toBe('JD');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept name prop', () => {
			expect(wrapper.text()).toBe('JD');
		});

		it('should accept initials prop (overrides name)', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'John Doe', initials: 'AB' },
			});
			expect(wrapper.text()).toBe('AB');
		});

		it('should accept src prop', () => {
			const wrapper = mount(Avatar, {
				props: { src: 'https://example.com/avatar.jpg' },
			});
			expect(wrapper.find('img').exists()).toBe(true);
		});

		it('should accept alt prop', () => {
			const wrapper = mount(Avatar, {
				props: { src: 'https://example.com/avatar.jpg', alt: 'User avatar' },
			});
			expect(wrapper.find('img').attributes('alt')).toBe('User avatar');
		});

		it('should accept size prop', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Test', size: 'lg' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Initials Generation Tests
	// ============================================
	describe('initials generation', () => {
		it('should generate initials from two-word name', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Jane Smith' },
			});
			expect(wrapper.text()).toBe('JS');
		});

		it('should generate initials from single-word name', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Alice' },
			});
			expect(wrapper.text()).toBe('AL');
		});

		it('should handle multi-word names (first two words)', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'John Robert Smith' },
			});
			expect(wrapper.text()).toBe('JR');
		});

		it('should uppercase initials', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'john doe' },
			});
			expect(wrapper.text()).toBe('JD');
		});

		it('should return empty when no name or initials', () => {
			const wrapper = mount(Avatar);
			expect(wrapper.text()).toBe('');
		});

		it('should limit direct initials to 2 characters', () => {
			const wrapper = mount(Avatar, {
				props: { initials: 'ABC' },
			});
			expect(wrapper.text()).toBe('AB');
		});
	});

	// ============================================
	// Image Tests
	// ============================================
	describe('image', () => {
		it('should render image element when src is provided', () => {
			const wrapper = mount(Avatar, {
				props: { src: 'https://example.com/avatar.jpg' },
			});
			expect(wrapper.find('img').exists()).toBe(true);
		});

		it('should use name as default alt', () => {
			const wrapper = mount(Avatar, {
				props: { src: 'https://example.com/avatar.jpg', name: 'John Doe' },
			});
			expect(wrapper.find('img').attributes('alt')).toBe('John Doe');
		});

		it('should use "Avatar" as fallback alt', () => {
			const wrapper = mount(Avatar, {
				props: { src: 'https://example.com/avatar.jpg' },
			});
			expect(wrapper.find('img').attributes('alt')).toBe('Avatar');
		});

		it('should have correct image classes', () => {
			const wrapper = mount(Avatar, {
				props: { src: 'https://example.com/avatar.jpg' },
			});
			const img = wrapper.find('img');
			expect(img.classes()).toContain('aspect-square');
			expect(img.classes()).toContain('size-full');
		});
	});

	// ============================================
	// Size Variants Tests
	// ============================================
	describe('size variants', () => {
		it('should apply default size', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply sm size', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Test', size: 'sm' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply lg size', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Test', size: 'lg' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply xl size', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Test', size: 'xl' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Avatar, {
				props: { name: 'Test', class: 'custom-avatar' },
			});
			expect(wrapper.classes()).toContain('custom-avatar');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle empty name', () => {
			const wrapper = mount(Avatar, {
				props: { name: '' },
			});
			expect(wrapper.text()).toBe('');
		});

		it('should handle whitespace-only name', () => {
			const wrapper = mount(Avatar, {
				props: { name: '   ' },
			});
			expect(wrapper.text()).toBe('');
		});

		it('should handle name with extra spaces', () => {
			const wrapper = mount(Avatar, {
				props: { name: '  John   Doe  ' },
			});
			expect(wrapper.text()).toBe('JD');
		});
	});
});
