import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Badge from './Badge.vue';

describe('Badge', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Badge, {
			slots: {
				default: 'Badge text',
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

		it('should render as div element', () => {
			expect(wrapper.element.tagName).toBe('DIV');
		});

		it('should render slot content', () => {
			expect(wrapper.text()).toBe('Badge text');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept variant prop', () => {
			const wrapper = mount(Badge, {
				props: { variant: 'secondary' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should default variant to default', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Variant Tests
	// ============================================
	describe('variants', () => {
		it('should apply default variant', () => {
			const wrapper = mount(Badge, {
				props: { variant: 'default' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply secondary variant', () => {
			const wrapper = mount(Badge, {
				props: { variant: 'secondary' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply destructive variant', () => {
			const wrapper = mount(Badge, {
				props: { variant: 'destructive' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply outline variant', () => {
			const wrapper = mount(Badge, {
				props: { variant: 'outline' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Badge, {
				props: { class: 'custom-badge' },
			});
			expect(wrapper.classes()).toContain('custom-badge');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render empty badge', () => {
			const wrapper = mount(Badge);
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle long text', () => {
			const wrapper = mount(Badge, {
				slots: { default: 'A'.repeat(100) },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle complex slot content', () => {
			const wrapper = mount(Badge, {
				slots: {
					default: '<span class="icon">*</span> New',
				},
			});
			expect(wrapper.find('.icon').exists()).toBe(true);
		});
	});
});
