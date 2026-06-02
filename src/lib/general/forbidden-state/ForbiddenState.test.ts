import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ForbiddenState from './ForbiddenState.vue';

describe('ForbiddenState', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as section element (via EmptyState)', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.element.tagName).toBe('SECTION');
		});

		it('should have forbidden-state data-slot', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.attributes('data-slot')).toBe('forbidden-state');
		});

		it('should display default title', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.text()).toContain('Access Denied');
		});

		it('should display default description', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.text()).toContain('You do not have permission to view this page');
		});
	});

	describe('custom content', () => {
		it('should support custom title', () => {
			const wrapper = mount(ForbiddenState, {
				props: { title: 'No Permissions' },
			});
			expect(wrapper.text()).toContain('No Permissions');
		});

		it('should support custom description', () => {
			const wrapper = mount(ForbiddenState, {
				props: { description: 'Contact support for help.' },
			});
			expect(wrapper.text()).toContain('Contact support for help.');
		});
	});

	describe('slots', () => {
		it('should render default slot (actions)', () => {
			const wrapper = mount(ForbiddenState, {
				slots: { default: '<button>Go back</button>' },
			});
			expect(wrapper.find('button').text()).toBe('Go back');
		});
	});

	describe('styling', () => {
		it('should apply lg size classes', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.classes()).toContain('py-16');
		});

		it('should support custom classes', () => {
			const wrapper = mount(ForbiddenState, {
				props: { class: 'min-h-screen' },
			});
			expect(wrapper.classes()).toContain('min-h-screen');
		});
	});

	describe('accessibility', () => {
		it('should have aria-label from title', () => {
			const wrapper = mount(ForbiddenState);
			expect(wrapper.attributes('aria-label')).toBe('Access Denied');
		});

		it('should have aria-label from custom title', () => {
			const wrapper = mount(ForbiddenState, {
				props: { title: 'No Permissions' },
			});
			expect(wrapper.attributes('aria-label')).toBe('No Permissions');
		});
	});
});
