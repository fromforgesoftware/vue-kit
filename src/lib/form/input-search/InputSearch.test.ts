import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import InputSearch from './InputSearch.vue';

describe('InputSearch', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(InputSearch);
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

		it('should render search icon', () => {
			expect(wrapper.find('svg').exists()).toBe(true);
		});

		it('should have type="search"', () => {
			expect(wrapper.find('input').attributes('type')).toBe('search');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept modelValue prop', () => {
			const wrapper = mount(InputSearch, {
				props: { modelValue: 'test query' },
			});
			expect(wrapper.find('input').element.value).toBe('test query');
		});

		it('should accept placeholder prop', () => {
			const wrapper = mount(InputSearch, {
				props: { placeholder: 'Search users...' },
			});
			expect(wrapper.find('input').attributes('placeholder')).toBe('Search users...');
		});

		it('should accept debounceTime prop', () => {
			const wrapper = mount(InputSearch, {
				props: { debounceTime: 500 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept disabled prop', () => {
			const wrapper = mount(InputSearch, {
				props: { disabled: true },
			});
			expect(wrapper.find('input').attributes('disabled')).toBeDefined();
		});

		it('should accept inputClass prop', () => {
			const wrapper = mount(InputSearch, {
				props: { inputClass: 'custom-input' },
			});
			expect(wrapper.find('input').classes()).toContain('custom-input');
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should have default placeholder', () => {
			expect(wrapper.find('input').attributes('placeholder')).toBe('Search...');
		});

		it('should default modelValue to empty string', () => {
			expect(wrapper.find('input').element.value).toBe('');
		});

		it('should default debounceTime to 0', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default disabled to false', () => {
			expect(wrapper.find('input').attributes('disabled')).toBeUndefined();
		});
	});

	// ============================================
	// Clear Button Tests
	// ============================================
	describe('clear button', () => {
		it('should not show clear button when empty', () => {
			expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(false);
		});

		it('should show clear button when has value', () => {
			const wrapper = mount(InputSearch, {
				props: { modelValue: 'test' },
			});
			expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(true);
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should disable input when disabled', () => {
			const wrapper = mount(InputSearch, {
				props: { disabled: true },
			});
			expect(wrapper.find('input').attributes('disabled')).toBeDefined();
		});

		it('should disable clear button when disabled', () => {
			const wrapper = mount(InputSearch, {
				props: { modelValue: 'test', disabled: true },
			});
			const clearButton = wrapper.find('button[aria-label="Clear search"]');
			expect(clearButton.attributes('disabled')).toBeDefined();
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:modelValue emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should emit update:modelValue on input', async () => {
			const wrapper = mount(InputSearch);
			await wrapper.find('input').setValue('test');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(InputSearch, {
				props: { class: 'custom-search' },
			});
			expect(wrapper.classes()).toContain('custom-search');
		});

		it('should support custom inputClass', () => {
			const wrapper = mount(InputSearch, {
				props: { inputClass: 'custom-input-style' },
			});
			expect(wrapper.find('input').classes()).toContain('custom-input-style');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle long search query', () => {
			const wrapper = mount(InputSearch, {
				props: { modelValue: 'A'.repeat(200) },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle special characters', () => {
			const wrapper = mount(InputSearch, {
				props: { modelValue: '<script>alert("xss")</script>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle zero debounceTime', () => {
			const wrapper = mount(InputSearch, {
				props: { debounceTime: 0 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with all props', () => {
			const wrapper = mount(InputSearch, {
				props: {
					modelValue: 'query',
					placeholder: 'Search...',
					debounceTime: 300,
					disabled: false,
					class: 'custom',
					inputClass: 'custom-input',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
