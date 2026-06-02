import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ScrollArea from './ScrollArea.vue';

describe('ScrollArea', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(ScrollArea);
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot attribute', () => {
			const wrapper = mount(ScrollArea);
			expect(wrapper.attributes('data-slot')).toBe('scroll-area');
		});

		it('should render slot content', () => {
			const wrapper = mount(ScrollArea, {
				slots: { default: '<p>Scrollable content</p>' },
			});
			expect(wrapper.text()).toContain('Scrollable content');
		});
	});

	describe('styling', () => {
		it('should have base classes', () => {
			const wrapper = mount(ScrollArea);
			expect(wrapper.classes()).toContain('relative');
			expect(wrapper.classes()).toContain('overflow-hidden');
		});

		it('should support custom classes', () => {
			const wrapper = mount(ScrollArea, {
				props: { class: 'h-72 w-48' },
			});
			expect(wrapper.classes()).toContain('h-72');
			expect(wrapper.classes()).toContain('w-48');
		});
	});

	describe('props', () => {
		it('should accept showScrollbar prop', () => {
			const wrapper = mount(ScrollArea, {
				props: { showScrollbar: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept showScrollbar false prop', () => {
			const wrapper = mount(ScrollArea, {
				props: { showScrollbar: false },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept orientation prop', () => {
			const wrapper = mount(ScrollArea, {
				props: { orientation: 'horizontal' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept both orientation', () => {
			const wrapper = mount(ScrollArea, {
				props: { orientation: 'both' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept viewportClass prop', () => {
			const wrapper = mount(ScrollArea, {
				props: { viewportClass: 'p-4' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
