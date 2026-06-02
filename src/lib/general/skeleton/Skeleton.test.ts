import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Skeleton from './Skeleton.vue';

describe('Skeleton', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(Skeleton);
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot attribute', () => {
			const wrapper = mount(Skeleton);
			expect(wrapper.attributes('data-slot')).toBe('skeleton');
		});

		it('should render as a div element', () => {
			const wrapper = mount(Skeleton);
			expect(wrapper.element.tagName).toBe('DIV');
		});
	});

	describe('variants', () => {
		it('should apply default variant classes', () => {
			const wrapper = mount(Skeleton);
			expect(wrapper.classes()).toContain('rounded-md');
		});

		it('should apply circle variant classes', () => {
			const wrapper = mount(Skeleton, {
				props: { variant: 'circle' },
			});
			expect(wrapper.classes()).toContain('rounded-full');
		});

		it('should apply text variant classes', () => {
			const wrapper = mount(Skeleton, {
				props: { variant: 'text' },
			});
			expect(wrapper.classes()).toContain('rounded');
			expect(wrapper.classes()).toContain('h-4');
		});
	});

	describe('animation', () => {
		it('should apply pulse animation by default', () => {
			const wrapper = mount(Skeleton);
			expect(wrapper.classes()).toContain('animate-pulse');
			expect(wrapper.classes()).toContain('bg-primary/10');
		});

		it('should apply shimmer animation', () => {
			const wrapper = mount(Skeleton, {
				props: { animate: 'shimmer' },
			});
			expect(wrapper.classes()).toContain('skeleton-shimmer');
		});

		it('should apply solid style (no animation)', () => {
			const wrapper = mount(Skeleton, {
				props: { animate: 'solid' },
			});
			expect(wrapper.classes()).toContain('bg-primary/10');
			expect(wrapper.classes()).not.toContain('animate-pulse');
			expect(wrapper.classes()).not.toContain('skeleton-shimmer');
		});
	});

	describe('styling', () => {
		it('should support custom classes', () => {
			const wrapper = mount(Skeleton, {
				props: { class: 'h-10 w-full' },
			});
			expect(wrapper.classes()).toContain('h-10');
			expect(wrapper.classes()).toContain('w-full');
		});
	});
});
