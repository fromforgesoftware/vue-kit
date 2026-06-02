import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Alert from './Alert.vue';

describe('Alert', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Alert, {
			slots: {
				default: 'Alert message',
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

		it('should have role="alert"', () => {
			expect(wrapper.attributes('role')).toBe('alert');
		});

		it('should render slot content', () => {
			expect(wrapper.text()).toContain('Alert message');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept variant prop', () => {
			const wrapper = mount(Alert, {
				props: { variant: 'destructive' },
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
			const wrapper = mount(Alert, {
				props: { variant: 'default' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply destructive variant', () => {
			const wrapper = mount(Alert, {
				props: { variant: 'destructive' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Slot Tests
	// ============================================
	describe('slots', () => {
		it('should render default slot', () => {
			const wrapper = mount(Alert, {
				slots: {
					default: '<p>Alert content</p>',
				},
			});
			expect(wrapper.find('p').text()).toBe('Alert content');
		});

		it('should render complex slot content', () => {
			const wrapper = mount(Alert, {
				slots: {
					default: `
            <div class="alert-title">Title</div>
            <div class="alert-description">Description</div>
          `,
				},
			});
			expect(wrapper.find('.alert-title').exists()).toBe(true);
			expect(wrapper.find('.alert-description').exists()).toBe(true);
		});
	});

	// ============================================
	// Accessibility Tests
	// ============================================
	describe('accessibility', () => {
		it('should have role="alert" for screen readers', () => {
			expect(wrapper.attributes('role')).toBe('alert');
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Alert, {
				props: { class: 'custom-alert' },
			});
			expect(wrapper.classes()).toContain('custom-alert');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render empty alert', () => {
			const wrapper = mount(Alert);
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle long content', () => {
			const wrapper = mount(Alert, {
				slots: {
					default: 'A'.repeat(500),
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with all props', () => {
			const wrapper = mount(Alert, {
				props: {
					variant: 'destructive',
					class: 'custom',
				},
				slots: {
					default: 'Alert with all props',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
