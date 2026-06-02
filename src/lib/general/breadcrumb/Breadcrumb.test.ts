import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Breadcrumb from './Breadcrumb.vue';

describe('Breadcrumb', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Breadcrumb);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as nav element', () => {
			expect(wrapper.element.tagName).toBe('NAV');
		});

		it('should have aria-label="breadcrumb"', () => {
			expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
		});
	});

	// ============================================
	// Slot Tests
	// ============================================
	describe('slots', () => {
		it('should render slot content', () => {
			const wrapper = mount(Breadcrumb, {
				slots: {
					default: '<ol class="breadcrumb-list"><li>Home</li></ol>',
				},
			});
			expect(wrapper.find('.breadcrumb-list').exists()).toBe(true);
		});

		it('should render multiple items', () => {
			const wrapper = mount(Breadcrumb, {
				slots: {
					default: `
            <ol>
              <li class="item">Home</li>
              <li class="item">Products</li>
              <li class="item">Category</li>
            </ol>
          `,
				},
			});
			expect(wrapper.findAll('.item')).toHaveLength(3);
		});
	});

	// ============================================
	// Accessibility Tests
	// ============================================
	describe('accessibility', () => {
		it('should have aria-label for navigation', () => {
			expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Breadcrumb, {
				props: { class: 'custom-breadcrumb' },
			});
			expect(wrapper.html()).toContain('custom-breadcrumb');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render empty breadcrumb', () => {
			const wrapper = mount(Breadcrumb);
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle complex breadcrumb structure', () => {
			const wrapper = mount(Breadcrumb, {
				slots: {
					default: `
            <ol>
              <li><a href="/">Home</a></li>
              <li><span>/</span></li>
              <li><a href="/products">Products</a></li>
              <li><span>/</span></li>
              <li aria-current="page">Current Page</li>
            </ol>
          `,
				},
			});
			expect(wrapper.findAll('a')).toHaveLength(2);
			expect(wrapper.find('[aria-current="page"]').exists()).toBe(true);
		});
	});
});
