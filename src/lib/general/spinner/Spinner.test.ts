import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Spinner from './Spinner.vue';

describe('Spinner', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Spinner);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as svg element', () => {
			expect(wrapper.element.tagName).toBe('svg');
		});

		it('should have animation class', () => {
			expect(wrapper.classes()).toContain('animate-spin');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept size prop', () => {
			const wrapper = mount(Spinner, {
				props: { size: 'lg' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should default size to default', () => {
			expect(wrapper.classes()).toContain('h-5');
			expect(wrapper.classes()).toContain('w-5');
		});
	});

	// ============================================
	// Size Tests
	// ============================================
	describe('sizes', () => {
		it('should apply sm size', () => {
			const wrapper = mount(Spinner, {
				props: { size: 'sm' },
			});
			expect(wrapper.classes()).toContain('h-4');
			expect(wrapper.classes()).toContain('w-4');
		});

		it('should apply default size', () => {
			const wrapper = mount(Spinner, {
				props: { size: 'default' },
			});
			expect(wrapper.classes()).toContain('h-5');
			expect(wrapper.classes()).toContain('w-5');
		});

		it('should apply lg size', () => {
			const wrapper = mount(Spinner, {
				props: { size: 'lg' },
			});
			expect(wrapper.classes()).toContain('h-8');
			expect(wrapper.classes()).toContain('w-8');
		});
	});

	// ============================================
	// SVG Structure Tests
	// ============================================
	describe('svg structure', () => {
		it('should have circle element', () => {
			expect(wrapper.find('circle').exists()).toBe(true);
		});

		it('should have path element', () => {
			expect(wrapper.find('path').exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Spinner, {
				props: { class: 'custom-spinner' },
			});
			expect(wrapper.classes()).toContain('custom-spinner');
		});

		it('should have muted foreground color', () => {
			expect(wrapper.classes()).toContain('text-muted-foreground');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(Spinner, {
				props: {
					size: 'lg',
					class: 'text-primary custom',
				},
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.classes()).toContain('text-primary');
		});
	});
});
