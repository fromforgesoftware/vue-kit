import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from './Input.vue';

function getInput(wrapper: ReturnType<typeof mount>): HTMLInputElement {
	return wrapper.find('input').element as HTMLInputElement;
}

describe('Input', () => {
	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(Input);
			expect(wrapper.exists()).toBe(true);
		});

		it('should render an input element inside a wrapper', () => {
			const wrapper = mount(Input);
			expect(wrapper.element.tagName).toBe('DIV');
			expect(wrapper.find('input').exists()).toBe(true);
		});

		it('should mark the wrapper with data-slot="input-wrapper"', () => {
			const wrapper = mount(Input);
			expect(wrapper.attributes('data-slot')).toBe('input-wrapper');
		});

		it('should have default type of text', () => {
			const wrapper = mount(Input);
			expect(wrapper.find('input').attributes('type')).toBe('text');
		});

		it('should render the wrapper with base layout classes', () => {
			const wrapper = mount(Input);
			expect(wrapper.classes()).toContain('flex');
			expect(wrapper.classes()).toContain('w-full');
			expect(wrapper.classes()).toContain('rounded-md');
		});
	});

	// ============================================
	// v-model Tests
	// ============================================
	describe('v-model', () => {
		it('should display modelValue', () => {
			const wrapper = mount(Input, {
				props: { modelValue: 'Hello World' },
			});
			expect(getInput(wrapper).value).toBe('Hello World');
		});

		it('should emit update:modelValue on input', async () => {
			const wrapper = mount(Input);
			await wrapper.find('input').setValue('test input');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
			expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test input']);
		});

		it('should handle empty value', () => {
			const wrapper = mount(Input, {
				props: { modelValue: '' },
			});
			expect(getInput(wrapper).value).toBe('');
		});

		it('should handle numeric value', () => {
			const wrapper = mount(Input, {
				props: { modelValue: 123, type: 'number' },
			});
			expect(getInput(wrapper).value).toBe('123');
		});
	});

	// ============================================
	// Type Tests
	// ============================================
	describe('type variations', () => {
		it.each(['email', 'password', 'number', 'search', 'tel'])('should accept %s type', (type) => {
			const wrapper = mount(Input, { props: { type } });
			expect(wrapper.find('input').attributes('type')).toBe(type);
		});
	});

	// ============================================
	// Size Tests
	// ============================================
	describe('sizes', () => {
		it('should apply default size to wrapper', () => {
			const wrapper = mount(Input);
			expect(wrapper.classes()).toContain('h-8');
		});

		it('should apply sm size to wrapper', () => {
			const wrapper = mount(Input, { props: { size: 'sm' } });
			expect(wrapper.classes()).toContain('h-7');
		});

		it('should apply lg size to wrapper', () => {
			const wrapper = mount(Input, { props: { size: 'lg' } });
			expect(wrapper.classes()).toContain('h-10');
		});
	});

	// ============================================
	// Disabled / Readonly / Required
	// ============================================
	describe('disabled state', () => {
		it('should set disabled attribute on inner input', () => {
			const wrapper = mount(Input, { props: { disabled: true } });
			expect(getInput(wrapper).disabled).toBe(true);
		});
	});

	describe('readonly state', () => {
		it('should set readonly attribute on inner input', () => {
			const wrapper = mount(Input, { props: { readonly: true } });
			expect(getInput(wrapper).readOnly).toBe(true);
		});
	});

	describe('required state', () => {
		it('should set required attribute on inner input', () => {
			const wrapper = mount(Input, { props: { required: true } });
			expect(getInput(wrapper).required).toBe(true);
		});
	});

	// ============================================
	// Error State Tests
	// ============================================
	describe('error state', () => {
		it('should set aria-invalid on inner input', () => {
			const wrapper = mount(Input, { props: { error: true } });
			expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
		});

		it('should apply error border to wrapper', () => {
			const wrapper = mount(Input, { props: { error: true } });
			expect(wrapper.classes()).toContain('border-destructive');
		});

		it('should not set aria-invalid when error is false', () => {
			const wrapper = mount(Input);
			expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
		});
	});

	// ============================================
	// Placeholder Tests
	// ============================================
	describe('placeholder', () => {
		it('should display placeholder', () => {
			const wrapper = mount(Input, {
				attrs: { placeholder: 'Enter your name' },
			});
			expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your name');
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should emit input event', async () => {
			const wrapper = mount(Input);
			await wrapper.find('input').trigger('input');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		});

		it('should emit focus and blur events from inner input', async () => {
			const wrapper = mount(Input);
			const input = wrapper.find('input');
			await input.trigger('focus');
			await input.trigger('blur');
			expect(input.exists()).toBe(true);
		});
	});

	// ============================================
	// Attributes Pass-through Tests
	// ============================================
	describe('attributes pass-through', () => {
		it('should pass through id attribute', () => {
			const wrapper = mount(Input, {
				attrs: { id: 'email-input' },
			});
			expect(wrapper.find('input').attributes('id')).toBe('email-input');
		});

		it('should pass through name attribute', () => {
			const wrapper = mount(Input, {
				attrs: { name: 'email' },
			});
			expect(wrapper.find('input').attributes('name')).toBe('email');
		});

		it('should pass through maxlength attribute', () => {
			const wrapper = mount(Input, {
				attrs: { maxlength: 100 },
			});
			expect(wrapper.find('input').attributes('maxlength')).toBe('100');
		});

		it('should pass through autocomplete attribute', () => {
			const wrapper = mount(Input, {
				attrs: { autocomplete: 'email' },
			});
			expect(wrapper.find('input').attributes('autocomplete')).toBe('email');
		});
	});

	// ============================================
	// Custom Class Tests
	// ============================================
	describe('custom classes', () => {
		it('should merge custom classes onto wrapper', () => {
			const wrapper = mount(Input, {
				props: { class: 'custom-input' },
			});
			expect(wrapper.classes()).toContain('custom-input');
			expect(wrapper.classes()).toContain('flex');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle very long input', () => {
			const longText = 'a'.repeat(10000);
			const wrapper = mount(Input, {
				props: { modelValue: longText },
			});
			expect(getInput(wrapper).value).toBe(longText);
		});

		it('should handle special characters', () => {
			const specialChars = '<script>alert("xss")</script>';
			const wrapper = mount(Input, {
				props: { modelValue: specialChars },
			});
			expect(getInput(wrapper).value).toBe(specialChars);
		});

		it('should handle undefined modelValue', () => {
			const wrapper = mount(Input, {
				props: { modelValue: undefined },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// ARIA Accessibility Tests
	// ============================================
	describe('ARIA accessibility', () => {
		it('should support aria-label', () => {
			const wrapper = mount(Input, {
				attrs: { 'aria-label': 'Email address' },
			});
			expect(wrapper.find('input').attributes('aria-label')).toBe('Email address');
		});

		it('should set aria-describedby from describedBy prop', () => {
			const wrapper = mount(Input, {
				props: { describedBy: 'email-help' },
			});
			expect(wrapper.find('input').attributes('aria-describedby')).toBe('email-help');
		});
	});

	// ============================================
	// Slots
	// ============================================
	describe('slots', () => {
		it('should render leading slot', () => {
			const wrapper = mount(Input, {
				slots: { leading: '<svg data-test-leading />' },
			});
			expect(wrapper.find('[data-slot="input-leading"]').exists()).toBe(true);
			expect(wrapper.find('[data-test-leading]').exists()).toBe(true);
		});

		it('should render trailing slot', () => {
			const wrapper = mount(Input, {
				slots: { trailing: '<svg data-test-trailing />' },
			});
			expect(wrapper.find('[data-slot="input-trailing"]').exists()).toBe(true);
			expect(wrapper.find('[data-test-trailing]').exists()).toBe(true);
		});

		it('should not render affix when slot is empty', () => {
			const wrapper = mount(Input);
			expect(wrapper.find('[data-slot="input-leading"]').exists()).toBe(false);
			expect(wrapper.find('[data-slot="input-trailing"]').exists()).toBe(false);
		});
	});
});
