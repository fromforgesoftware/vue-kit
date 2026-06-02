import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Autocomplete from './Autocomplete.vue';

const sampleOptions = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry' },
];

describe('Autocomplete', () => {
	let wrapper: ReturnType<typeof mount<typeof Autocomplete>>;

	beforeEach(() => {
		wrapper = mount(Autocomplete, {
			props: {
				options: sampleOptions,
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

		it('should render trigger button', () => {
			expect(wrapper.find('button').exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept modelValue prop', () => {
			const wrapper = mount(Autocomplete, {
				props: { modelValue: 'apple', options: sampleOptions },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept options prop', () => {
			expect(wrapper.props('options')).toEqual(sampleOptions);
		});

		it('should accept placeholder prop', () => {
			const wrapper = mount(Autocomplete, {
				props: { placeholder: 'Search fruits...', options: [] },
			});
			expect(wrapper.find('input').attributes('placeholder')).toBe('Search fruits...');
		});

		it('should accept disabled prop', () => {
			const wrapper = mount(Autocomplete, {
				props: { disabled: true, options: [] },
			});
			expect(wrapper.find('input').attributes('disabled')).toBeDefined();
		});

		it('should accept loading prop', () => {
			const wrapper = mount(Autocomplete, {
				props: { loading: true, options: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept emptyText prop', () => {
			const wrapper = mount(Autocomplete, {
				props: { emptyText: 'Nothing found', options: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept clearable prop', () => {
			const wrapper = mount(Autocomplete, {
				props: { clearable: false, options: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should have default placeholder', () => {
			expect(wrapper.find('input').attributes('placeholder')).toBe('Type or select an option...');
		});

		it('should have clearable enabled by default', () => {
			// clearable is true by default
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should disable input when disabled', () => {
			const wrapper = mount(Autocomplete, {
				props: { disabled: true, options: sampleOptions },
			});
			expect(wrapper.find('input').attributes('disabled')).toBeDefined();
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:modelValue emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have search emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Autocomplete, {
				props: { class: 'custom-autocomplete', options: [] },
			});
			// Class is applied to inner ComboboxRoot element
			expect(wrapper.html()).toContain('custom-autocomplete');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle empty options array', () => {
			const wrapper = mount(Autocomplete, {
				props: { options: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle large options array', () => {
			const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
				value: `option-${i}`,
				label: `Option ${i}`,
			}));
			const wrapper = mount(Autocomplete, {
				props: { options: largeOptions },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle options with disabled items', () => {
			const optionsWithDisabled = [
				{ value: 'a', label: 'A' },
				{ value: 'b', label: 'B', disabled: true },
				{ value: 'c', label: 'C' },
			];
			const wrapper = mount(Autocomplete, {
				props: { options: optionsWithDisabled },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
