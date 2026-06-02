import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Textarea from './Textarea.vue';

describe('Textarea', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Textarea);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as a textarea element', () => {
			expect(wrapper.element.tagName).toBe('TEXTAREA');
		});

		it('should render with base classes', () => {
			expect(wrapper.classes()).toContain('flex');
			expect(wrapper.classes()).toContain('w-full');
			expect(wrapper.classes()).toContain('rounded-md');
		});

		it('should have minimum height', () => {
			expect(wrapper.classes()).toContain('min-h-20');
		});
	});

	// ============================================
	// v-model Tests
	// ============================================
	describe('v-model', () => {
		it('should display modelValue', () => {
			const wrapper = mount(Textarea, {
				props: { modelValue: 'Hello World' },
			});
			expect((wrapper.element as HTMLTextAreaElement).value).toBe('Hello World');
		});

		it('should emit update:modelValue on input', async () => {
			await wrapper.setValue('test input');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
			expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test input']);
		});

		it('should handle empty value', () => {
			const wrapper = mount(Textarea, {
				props: { modelValue: '' },
			});
			expect((wrapper.element as HTMLTextAreaElement).value).toBe('');
		});

		it('should handle multiline content', () => {
			const multilineText = 'Line 1\nLine 2\nLine 3';
			const wrapper = mount(Textarea, {
				props: { modelValue: multilineText },
			});
			expect((wrapper.element as HTMLTextAreaElement).value).toBe(multilineText);
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should have disabled attribute when disabled', () => {
			const wrapper = mount(Textarea, {
				props: { disabled: true },
			});
			expect((wrapper.element as HTMLTextAreaElement).disabled).toBe(true);
		});

		it('should apply disabled styling', () => {
			expect(wrapper.classes()).toContain('disabled:opacity-50');
			expect(wrapper.classes()).toContain('disabled:cursor-not-allowed');
		});
	});

	// ============================================
	// Error State Tests
	// ============================================
	describe('error state', () => {
		it('should apply error border when error prop is true', () => {
			const wrapper = mount(Textarea, {
				props: { error: true },
			});
			expect(wrapper.classes()).toContain('border-destructive');
		});

		it('should have focus ring for error state', () => {
			const wrapper = mount(Textarea, {
				props: { error: true },
			});
			expect(wrapper.classes()).toContain('ring-destructive/20');
		});

		it('should have default border when no error', () => {
			expect(wrapper.classes()).toContain('border-input');
		});
	});

	// ============================================
	// Placeholder Tests
	// ============================================
	describe('placeholder', () => {
		it('should display placeholder', () => {
			const wrapper = mount(Textarea, {
				attrs: { placeholder: 'Enter your message' },
			});
			expect(wrapper.attributes('placeholder')).toBe('Enter your message');
		});

		it('should have placeholder styling', () => {
			expect(wrapper.classes()).toContain('placeholder:text-muted-foreground');
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should emit input event', async () => {
			await wrapper.trigger('input');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		});

		it('should emit focus event', async () => {
			await wrapper.trigger('focus');
			expect(wrapper.emitted('focus')).toBeTruthy();
		});

		it('should emit blur event', async () => {
			await wrapper.trigger('blur');
			expect(wrapper.emitted('blur')).toBeTruthy();
		});
	});

	// ============================================
	// Attributes Pass-through Tests
	// ============================================
	describe('attributes pass-through', () => {
		it('should pass through id attribute', () => {
			const wrapper = mount(Textarea, {
				attrs: { id: 'message-input' },
			});
			expect(wrapper.attributes('id')).toBe('message-input');
		});

		it('should pass through rows attribute', () => {
			const wrapper = mount(Textarea, {
				attrs: { rows: 5 },
			});
			expect(wrapper.attributes('rows')).toBe('5');
		});

		it('should pass through cols attribute', () => {
			const wrapper = mount(Textarea, {
				attrs: { cols: 50 },
			});
			expect(wrapper.attributes('cols')).toBe('50');
		});

		it('should pass through maxlength attribute', () => {
			const wrapper = mount(Textarea, {
				attrs: { maxlength: 500 },
			});
			expect(wrapper.attributes('maxlength')).toBe('500');
		});

		it('should pass through name attribute', () => {
			const wrapper = mount(Textarea, {
				attrs: { name: 'message' },
			});
			expect(wrapper.attributes('name')).toBe('message');
		});
	});

	// ============================================
	// Focus Styling Tests
	// ============================================
	describe('focus styling', () => {
		it('should have focus visible ring', () => {
			expect(wrapper.classes()).toContain('focus-visible:border-primary');
			expect(wrapper.classes()).toContain('focus-visible:ring-2');
		});

		it('should have outline none', () => {
			expect(wrapper.classes()).toContain('outline-none');
		});
	});

	// ============================================
	// Custom Class Tests
	// ============================================
	describe('custom classes', () => {
		it('should merge custom classes', () => {
			const wrapper = mount(Textarea, {
				props: { class: 'custom-textarea' },
			});
			expect(wrapper.classes()).toContain('custom-textarea');
			expect(wrapper.classes()).toContain('flex'); // Still has base classes
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle very long input', () => {
			const longText = 'a'.repeat(10000);
			const wrapper = mount(Textarea, {
				props: { modelValue: longText },
			});
			expect((wrapper.element as HTMLTextAreaElement).value).toBe(longText);
		});

		it('should handle special characters', () => {
			const specialChars = '<script>alert("xss")</script>';
			const wrapper = mount(Textarea, {
				props: { modelValue: specialChars },
			});
			expect((wrapper.element as HTMLTextAreaElement).value).toBe(specialChars);
		});

		it('should handle unicode characters', () => {
			const unicode = '🎉 Hello 世界';
			const wrapper = mount(Textarea, {
				props: { modelValue: unicode },
			});
			expect((wrapper.element as HTMLTextAreaElement).value).toBe(unicode);
		});
	});

	// ============================================
	// ARIA Accessibility Tests
	// ============================================
	describe('ARIA accessibility', () => {
		it('should support aria-label', () => {
			const wrapper = mount(Textarea, {
				attrs: { 'aria-label': 'Message input' },
			});
			expect(wrapper.attributes('aria-label')).toBe('Message input');
		});

		it('should support aria-describedby', () => {
			const wrapper = mount(Textarea, {
				attrs: { 'aria-describedby': 'message-help' },
			});
			expect(wrapper.attributes('aria-describedby')).toBe('message-help');
		});

		it('should support aria-invalid', () => {
			const wrapper = mount(Textarea, {
				attrs: { 'aria-invalid': 'true' },
			});
			expect(wrapper.attributes('aria-invalid')).toBe('true');
		});
	});
});
