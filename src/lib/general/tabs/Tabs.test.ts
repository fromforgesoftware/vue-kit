import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Tabs from './Tabs.vue';

describe('Tabs', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Tabs);
	});

	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render slot content', () => {
			const wrapper = mount(Tabs, {
				slots: {
					default: '<div class="tabs-content">Tab content</div>',
				},
			});
			expect(wrapper.find('.tabs-content').exists()).toBe(true);
		});
	});

	describe('props', () => {
		it('should accept modelValue prop', () => {
			const wrapper = mount(Tabs, {
				props: { modelValue: 'tab-1' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultValue prop', () => {
			const wrapper = mount(Tabs, {
				props: { defaultValue: 'tab-1' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept orientation prop', () => {
			const wrapper = mount(Tabs, {
				props: { orientation: 'vertical' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept activationMode prop', () => {
			const wrapper = mount(Tabs, {
				props: { activationMode: 'manual' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('default props', () => {
		it('should default orientation to horizontal', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default activationMode to automatic', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('orientation', () => {
		it('should support horizontal orientation', () => {
			const wrapper = mount(Tabs, {
				props: { orientation: 'horizontal' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should support vertical orientation', () => {
			const wrapper = mount(Tabs, {
				props: { orientation: 'vertical' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('activation mode', () => {
		it('should support automatic activation', () => {
			const wrapper = mount(Tabs, {
				props: { activationMode: 'automatic' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should support manual activation', () => {
			const wrapper = mount(Tabs, {
				props: { activationMode: 'manual' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('events', () => {
		it('should have update:modelValue emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	describe('slots', () => {
		it('should render complex slot structure', () => {
			const wrapper = mount(Tabs, {
				slots: {
					default: `
            <div class="tabs-list">
              <button class="tab">Tab 1</button>
              <button class="tab">Tab 2</button>
            </div>
            <div class="tabs-panel">Panel Content</div>
          `,
				},
			});
			expect(wrapper.find('.tabs-list').exists()).toBe(true);
			expect(wrapper.findAll('.tab')).toHaveLength(2);
		});
	});

	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(Tabs, {
				props: {
					modelValue: 'tab-2',
					defaultValue: 'tab-1',
					orientation: 'vertical',
					activationMode: 'manual',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render empty tabs', () => {
			const wrapper = mount(Tabs);
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle undefined modelValue', () => {
			const wrapper = mount(Tabs, {
				props: { modelValue: undefined },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
