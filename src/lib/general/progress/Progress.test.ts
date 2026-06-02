import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Progress from './Progress.vue';

describe('Progress', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(Progress);
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot attribute', () => {
			const wrapper = mount(Progress);
			expect(wrapper.attributes('data-slot')).toBe('progress');
		});

		it('should render indicator', () => {
			const wrapper = mount(Progress);
			const indicator = wrapper.find('[data-slot="progress-indicator"]');
			expect(indicator.exists()).toBe(true);
		});
	});

	describe('value', () => {
		it('should set indicator transform based on modelValue', () => {
			const wrapper = mount(Progress, {
				props: { modelValue: 50 },
			});
			const indicator = wrapper.find('[data-slot="progress-indicator"]');
			expect(indicator.attributes('style')).toContain('translateX(-50%)');
		});

		it('should show 0% progress when modelValue is 0', () => {
			const wrapper = mount(Progress, {
				props: { modelValue: 0 },
			});
			const indicator = wrapper.find('[data-slot="progress-indicator"]');
			expect(indicator.attributes('style')).toContain('translateX(-100%)');
		});

		it('should show 100% progress when modelValue is 100', () => {
			const wrapper = mount(Progress, {
				props: { modelValue: 100 },
			});
			const indicator = wrapper.find('[data-slot="progress-indicator"]');
			expect(indicator.attributes('style')).toContain('translateX(-0%)');
		});
	});

	describe('sizes', () => {
		it('should apply default size classes', () => {
			const wrapper = mount(Progress);
			expect(wrapper.classes()).toContain('h-2');
		});

		it('should apply sm size classes', () => {
			const wrapper = mount(Progress, {
				props: { size: 'sm' },
			});
			expect(wrapper.classes()).toContain('h-1');
		});

		it('should apply lg size classes', () => {
			const wrapper = mount(Progress, {
				props: { size: 'lg' },
			});
			expect(wrapper.classes()).toContain('h-3');
		});
	});

	describe('styling', () => {
		it('should have rounded corners', () => {
			const wrapper = mount(Progress);
			expect(wrapper.classes()).toContain('rounded-full');
		});

		it('should have overflow hidden', () => {
			const wrapper = mount(Progress);
			expect(wrapper.classes()).toContain('overflow-hidden');
		});

		it('should support custom classes', () => {
			const wrapper = mount(Progress, {
				props: { class: 'custom-progress' },
			});
			expect(wrapper.classes()).toContain('custom-progress');
		});
	});
});
