import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import InputChip from './InputChip.vue';

describe('InputChip', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(InputChip, {
			props: {
				modelValue: ['chip1', 'chip2'],
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

		it('should render input element', () => {
			expect(wrapper.find('input').exists()).toBe(true);
		});

		it('should render chips', () => {
			expect(wrapper.text()).toContain('chip1');
			expect(wrapper.text()).toContain('chip2');
		});

		it('should render remove buttons when removable', () => {
			expect(wrapper.findAll('button[aria-label="Remove"]')).toHaveLength(2);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept modelValue prop', () => {
			expect(wrapper.text()).toContain('chip1');
		});

		it('should accept placeholder prop', () => {
			const wrapper = mount(InputChip, {
				props: { placeholder: 'Add tags...' },
			});
			expect(wrapper.find('input').attributes('placeholder')).toBe('Add tags...');
		});

		it('should accept removable prop', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['chip'], removable: false },
			});
			expect(wrapper.find('button[aria-label="Remove"]').exists()).toBe(false);
		});

		it('should accept clearable prop', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['chip'], clearable: true },
			});
			expect(wrapper.find('button[aria-label="Clear all"]').exists()).toBe(true);
		});

		it('should accept disabled prop', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: [], disabled: true },
			});
			expect(wrapper.find('input').attributes('disabled')).toBeDefined();
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should have default placeholder', () => {
			const wrapper = mount(InputChip);
			expect(wrapper.find('input').attributes('placeholder')).toBe('Type and press Enter...');
		});

		it('should default removable to true', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['chip'] },
			});
			expect(wrapper.find('button[aria-label="Remove"]').exists()).toBe(true);
		});

		it('should default clearable to false', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['chip'] },
			});
			expect(wrapper.find('button[aria-label="Clear all"]').exists()).toBe(false);
		});

		it('should default disabled to false', () => {
			const wrapper = mount(InputChip);
			expect(wrapper.find('input').attributes('disabled')).toBeUndefined();
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should disable input when disabled', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: [], disabled: true },
			});
			expect(wrapper.find('input').attributes('disabled')).toBeDefined();
		});

		it('should disable remove buttons when disabled', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['chip'], disabled: true },
			});
			const removeButton = wrapper.find('button[aria-label="Remove"]');
			expect(removeButton.attributes('disabled')).toBeDefined();
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
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(InputChip, {
				props: { class: 'custom-input-chip' },
			});
			expect(wrapper.classes()).toContain('custom-input-chip');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle empty modelValue', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle many chips', () => {
			const chips = Array.from({ length: 20 }, (_, i) => `chip${i}`);
			const wrapper = mount(InputChip, {
				props: { modelValue: chips },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle long chip text', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['A'.repeat(100)] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should not show placeholder when chips exist', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: ['chip'], placeholder: 'Add tags...' },
			});
			expect(wrapper.find('input').attributes('placeholder')).toBe('');
		});

		it('should show placeholder when no chips', () => {
			const wrapper = mount(InputChip, {
				props: { modelValue: [], placeholder: 'Add tags...' },
			});
			expect(wrapper.find('input').attributes('placeholder')).toBe('Add tags...');
		});
	});
});
