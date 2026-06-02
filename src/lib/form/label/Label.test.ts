import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Label from './Label.vue';

describe('Label', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Label, {
			slots: {
				default: 'Label text',
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

		it('should render as label element', () => {
			expect(wrapper.element.tagName).toBe('LABEL');
		});

		it('should render slot content', () => {
			expect(wrapper.text()).toContain('Label text');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept for prop', () => {
			const wrapper = mount(Label, {
				props: { for: 'input-id' },
			});
			expect(wrapper.attributes('for')).toBe('input-id');
		});

		it('should accept required prop', () => {
			const wrapper = mount(Label, {
				props: { required: true },
				slots: { default: 'Required Field' },
			});
			expect(wrapper.text()).toContain('*');
		});
	});

	// ============================================
	// Required Indicator Tests
	// ============================================
	describe('required indicator', () => {
		it('should show asterisk when required', () => {
			const wrapper = mount(Label, {
				props: { required: true },
				slots: { default: 'Field' },
			});
			expect(wrapper.find('.text-destructive').exists()).toBe(true);
			expect(wrapper.text()).toContain('*');
		});

		it('should not show asterisk when not required', () => {
			const wrapper = mount(Label, {
				slots: { default: 'Field' },
			});
			expect(wrapper.find('.text-destructive').exists()).toBe(false);
		});
	});

	// ============================================
	// For Attribute Tests
	// ============================================
	describe('for attribute', () => {
		it('should link to input via for attribute', () => {
			const wrapper = mount(Label, {
				props: { for: 'email-input' },
			});
			expect(wrapper.attributes('for')).toBe('email-input');
		});

		it('should not have for attribute when not provided', () => {
			expect(wrapper.attributes('for')).toBeUndefined();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Label, {
				props: { class: 'custom-label' },
			});
			expect(wrapper.classes()).toContain('custom-label');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render empty label', () => {
			const wrapper = mount(Label);
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle long text', () => {
			const wrapper = mount(Label, {
				slots: { default: 'A'.repeat(200) },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with all props', () => {
			const wrapper = mount(Label, {
				props: {
					for: 'field-id',
					required: true,
					class: 'custom',
				},
				slots: { default: 'Complete label' },
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.attributes('for')).toBe('field-id');
			expect(wrapper.text()).toContain('*');
		});

		it('should handle complex slot content', () => {
			const wrapper = mount(Label, {
				slots: {
					default: '<span class="highlight">Important</span> Field',
				},
			});
			expect(wrapper.find('.highlight').exists()).toBe(true);
		});
	});
});
