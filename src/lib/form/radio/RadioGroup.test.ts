import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import RadioGroup from './RadioGroup.vue';

describe('RadioGroup', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(RadioGroup);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as radio group role', () => {
			expect(wrapper.attributes('role')).toBe('radiogroup');
		});

		it('should expose data-slot="radio-group"', () => {
			expect(wrapper.attributes('data-slot')).toBe('radio-group');
		});

		it('should render slot content', () => {
			const wrapper = mount(RadioGroup, {
				slots: {
					default: '<div class="test-content">Radio items</div>',
				},
			});
			expect(wrapper.find('.test-content').exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept modelValue prop', () => {
			const wrapper = mount(RadioGroup, {
				props: { modelValue: 'option1' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultValue prop', () => {
			const wrapper = mount(RadioGroup, {
				props: { defaultValue: 'option2' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept name prop', () => {
			const wrapper = mount(RadioGroup, {
				props: { name: 'radio-group-1' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should default orientation to vertical', () => {
			expect(wrapper.classes()).toContain('flex-col');
		});

		it('should support horizontal orientation', () => {
			const wrapper = mount(RadioGroup, {
				props: { orientation: 'horizontal' },
			});
			expect(wrapper.classes()).toContain('flex-row');
		});

		it('should set aria-invalid when error prop is true', () => {
			const wrapper = mount(RadioGroup, {
				props: { error: true },
			});
			expect(wrapper.attributes('aria-invalid')).toBe('true');
		});

		it('should set aria-describedby from describedBy prop', () => {
			const wrapper = mount(RadioGroup, {
				props: { describedBy: 'rg-hint' },
			});
			expect(wrapper.attributes('aria-describedby')).toBe('rg-hint');
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should have data-disabled when disabled', () => {
			const wrapper = mount(RadioGroup, {
				props: { disabled: true },
			});
			expect(wrapper.attributes('data-disabled')).toBeDefined();
		});
	});

	// ============================================
	// ARIA Accessibility Tests
	// ============================================
	describe('ARIA accessibility', () => {
		it('should have radiogroup role', () => {
			expect(wrapper.attributes('role')).toBe('radiogroup');
		});

		it('should support aria-orientation', () => {
			expect(wrapper.attributes('aria-orientation')).toBeDefined();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should have flex display', () => {
			expect(wrapper.classes()).toContain('flex');
		});

		it('should have gap for spacing', () => {
			const klass = wrapper.classes().join(' ');
			expect(klass).toMatch(/gap-/);
		});

		it('should support custom class', () => {
			const wrapper = mount(RadioGroup, {
				props: { class: 'custom-radio-group' },
			});
			expect(wrapper.classes()).toContain('custom-radio-group');
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:modelValue emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(RadioGroup, {
				props: {
					modelValue: 'option1',
					name: 'test-group',
					orientation: 'horizontal',
					disabled: false,
					required: true,
					loop: true,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
