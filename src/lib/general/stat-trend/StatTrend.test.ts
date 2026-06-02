import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatTrend from './StatTrend.vue';

describe('StatTrend', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot attribute', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up' },
			});
			expect(wrapper.attributes('data-slot')).toBe('stat-trend');
		});

		it('should render as a span element', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up' },
			});
			expect(wrapper.element.tagName).toBe('SPAN');
		});
	});

	describe('value formatting', () => {
		it('should format value as percentage by default', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 15.1, direction: 'up' },
			});
			expect(wrapper.text()).toContain('15.1%');
		});

		it('should format value as absolute when format is absolute', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 39, direction: 'up', format: 'absolute' },
			});
			expect(wrapper.text()).toContain('39');
			expect(wrapper.text()).not.toContain('%');
		});

		it('should use absolute value for negative numbers', () => {
			const wrapper = mount(StatTrend, {
				props: { value: -5.2, direction: 'down' },
			});
			expect(wrapper.text()).toContain('5.2%');
		});

		it('should show 0% for zero value', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 0, direction: 'flat' },
			});
			expect(wrapper.text()).toContain('0%');
		});
	});

	describe('direction variants', () => {
		it('should render up direction', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render down direction', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 2, direction: 'down' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render flat direction', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 0, direction: 'flat' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('sizes', () => {
		it('should apply default size', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply sm size', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up', size: 'sm' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('accessibility', () => {
		it('should have role status', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 15.1, direction: 'up' },
			});
			expect(wrapper.attributes('role')).toBe('status');
		});

		it('should have aria-label for up direction', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 15.1, direction: 'up' },
			});
			expect(wrapper.attributes('aria-label')).toBe('increased by 15.1%');
		});

		it('should have aria-label for down direction', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 2, direction: 'down' },
			});
			expect(wrapper.attributes('aria-label')).toBe('decreased by 2%');
		});

		it('should have aria-label for flat direction', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 0, direction: 'flat' },
			});
			expect(wrapper.attributes('aria-label')).toBe('unchanged by 0%');
		});

		it('should have aria-hidden on icon', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up' },
			});
			const icon = wrapper.find('svg');
			expect(icon.attributes('aria-hidden')).toBe('true');
		});
	});

	describe('styling', () => {
		it('should support custom classes', () => {
			const wrapper = mount(StatTrend, {
				props: { value: 5, direction: 'up', class: 'custom-trend' },
			});
			expect(wrapper.classes()).toContain('custom-trend');
		});
	});
});
