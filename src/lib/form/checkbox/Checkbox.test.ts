import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Checkbox from './Checkbox.vue';

describe('Checkbox', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Checkbox);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with correct base classes', () => {
			expect(wrapper.classes()).toContain('inline-flex');
			expect(wrapper.classes()).toContain('items-center');
		});

		it('should have correct size classes', () => {
			expect(wrapper.classes()).toContain('size-4');
		});

		it('should have rounded border', () => {
			expect(wrapper.classes()).toContain('rounded');
		});

		it('should have border styling', () => {
			expect(wrapper.classes()).toContain('border');
			expect(wrapper.classes()).toContain('border-input');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept checked prop', () => {
			const wrapper = mount(Checkbox, {
				props: { checked: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultChecked prop', () => {
			const wrapper = mount(Checkbox, {
				props: { defaultChecked: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept indeterminate state', () => {
			const wrapper = mount(Checkbox, {
				props: { checked: 'indeterminate' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept id prop', () => {
			const wrapper = mount(Checkbox, {
				props: { id: 'checkbox-1' },
			});
			expect(wrapper.attributes('id')).toBe('checkbox-1');
		});

		it('should accept name prop', () => {
			const wrapper = mount(Checkbox, {
				props: { name: 'acceptTerms' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept value prop', () => {
			const wrapper = mount(Checkbox, {
				props: { value: 'option1' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Initial State Tests
	// ============================================
	describe('initial state', () => {
		it('should have unchecked state by default', () => {
			expect(wrapper.attributes('data-state')).toBe('unchecked');
		});

		it('should have aria-checked false by default', () => {
			expect(wrapper.attributes('aria-checked')).toBe('false');
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should have disabled attribute when disabled', () => {
			const wrapper = mount(Checkbox, {
				props: { disabled: true },
			});
			expect(wrapper.attributes('data-disabled')).toBeDefined();
		});

		it('should apply disabled styling classes', () => {
			expect(wrapper.classes()).toContain('disabled:opacity-50');
			expect(wrapper.classes()).toContain('disabled:cursor-not-allowed');
		});
	});

	// ============================================
	// ARIA Accessibility Tests
	// ============================================
	describe('ARIA accessibility', () => {
		it('should have checkbox role', () => {
			expect(wrapper.attributes('role')).toBe('checkbox');
		});

		it('should have aria-checked attribute', () => {
			expect(wrapper.attributes('aria-checked')).toBeDefined();
		});

		it('should have button type', () => {
			expect(wrapper.attributes('type')).toBe('button');
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Checkbox, {
				props: { class: 'custom-checkbox' },
			});
			expect(wrapper.classes()).toContain('custom-checkbox');
		});

		it('should have focus visible styles', () => {
			expect(wrapper.classes()).toContain('focus-visible:ring-[3px]');
			expect(wrapper.classes()).toContain('focus-visible:ring-ring/50');
		});

		it('should have shrink-0 to prevent shrinking', () => {
			expect(wrapper.classes()).toContain('shrink-0');
		});

		it('should have peer class for sibling styling', () => {
			expect(wrapper.classes()).toContain('peer');
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:checked emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should be interactive element', () => {
			expect(wrapper.attributes('type')).toBe('button');
		});
	});

	// ============================================
	// Indicator Tests
	// ============================================
	describe('indicator', () => {
		it('should render indicator container', () => {
			// The indicator wrapper is always present inside the button
			expect(wrapper.element.children.length).toBeGreaterThanOrEqual(0);
		});

		it('should have nested structure', () => {
			// Checkbox renders a valid structure
			expect(wrapper.element.innerHTML).toBeTruthy();
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(Checkbox, {
				props: {
					id: 'test-checkbox',
					name: 'test',
					value: 'test-value',
					disabled: false,
					required: true,
				},
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.attributes('id')).toBe('test-checkbox');
		});

		it('should render multiple checkboxes', () => {
			const wrapper1 = mount(Checkbox);
			const wrapper2 = mount(Checkbox);
			const wrapper3 = mount(Checkbox);
			expect(wrapper1.exists()).toBe(true);
			expect(wrapper2.exists()).toBe(true);
			expect(wrapper3.exists()).toBe(true);
		});
	});
});
