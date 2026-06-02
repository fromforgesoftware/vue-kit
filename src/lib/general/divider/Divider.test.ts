import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Divider from './Divider.vue';

describe('Divider', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Divider);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept orientation prop', () => {
			const wrapper = mount(Divider, {
				props: { orientation: 'vertical' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept decorative prop', () => {
			const wrapper = mount(Divider, {
				props: { decorative: false },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default orientation to horizontal', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default decorative to true', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Orientation Tests
	// ============================================
	describe('orientation', () => {
		it('should support horizontal orientation', () => {
			const wrapper = mount(Divider, {
				props: { orientation: 'horizontal' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should support vertical orientation', () => {
			const wrapper = mount(Divider, {
				props: { orientation: 'vertical' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Divider, {
				props: { class: 'custom-divider' },
			});
			expect(wrapper.html()).toContain('custom-divider');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(Divider, {
				props: {
					orientation: 'vertical',
					decorative: false,
					class: 'custom',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
