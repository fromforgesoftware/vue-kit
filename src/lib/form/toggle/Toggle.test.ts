import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Toggle from './Toggle.vue';

describe('Toggle', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(Toggle);
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot attribute', () => {
			const wrapper = mount(Toggle);
			expect(wrapper.attributes('data-slot')).toBe('toggle');
		});

		it('should render as a button element', () => {
			const wrapper = mount(Toggle);
			expect(wrapper.element.tagName).toBe('BUTTON');
		});

		it('should render slot content', () => {
			const wrapper = mount(Toggle, {
				slots: { default: 'Toggle me' },
			});
			expect(wrapper.text()).toBe('Toggle me');
		});
	});

	describe('variants', () => {
		it('should apply default variant classes', () => {
			const wrapper = mount(Toggle);
			expect(wrapper.classes()).toContain('bg-transparent');
		});

		it('should apply outline variant classes', () => {
			const wrapper = mount(Toggle, {
				props: { variant: 'outline' },
			});
			expect(wrapper.classes()).toContain('border');
			expect(wrapper.classes()).toContain('border-input');
		});
	});

	describe('sizes', () => {
		it('should apply default size classes', () => {
			const wrapper = mount(Toggle);
			// Default: 32 px to match Input default.
			expect(wrapper.classes()).toContain('h-8');
			expect(wrapper.classes()).toContain('px-3');
		});

		it('should apply sm size classes', () => {
			const wrapper = mount(Toggle, {
				props: { size: 'sm' },
			});
			// Small: 28 px to match Input sm.
			expect(wrapper.classes()).toContain('h-7');
			expect(wrapper.classes()).toContain('px-2');
		});

		it('should apply lg size classes', () => {
			const wrapper = mount(Toggle, {
				props: { size: 'lg' },
			});
			expect(wrapper.classes()).toContain('h-10');
			expect(wrapper.classes()).toContain('px-4');
		});
	});

	describe('states', () => {
		it('should have data-state attribute', () => {
			const wrapper = mount(Toggle);
			expect(wrapper.attributes('data-state')).toBeDefined();
		});

		it('should accept defaultValue prop', () => {
			const wrapper = mount(Toggle, {
				props: { defaultValue: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should support disabled state', () => {
			const wrapper = mount(Toggle, {
				props: { disabled: true },
			});
			expect(wrapper.attributes('disabled')).toBeDefined();
		});

		it('should respond to click events', async () => {
			const wrapper = mount(Toggle);
			await wrapper.trigger('click');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		});
	});

	describe('styling', () => {
		it('should have base classes', () => {
			const wrapper = mount(Toggle);
			expect(wrapper.classes()).toContain('inline-flex');
			expect(wrapper.classes()).toContain('items-center');
			expect(wrapper.classes()).toContain('justify-center');
			expect(wrapper.classes()).toContain('rounded-md');
		});

		it('should support custom classes', () => {
			const wrapper = mount(Toggle, {
				props: { class: 'custom-toggle' },
			});
			expect(wrapper.classes()).toContain('custom-toggle');
		});
	});

	describe('events', () => {
		it('should emit update:modelValue on click', async () => {
			const wrapper = mount(Toggle);
			await wrapper.trigger('click');
			expect(wrapper.emitted('update:modelValue')).toBeTruthy();
			expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
		});
	});
});
