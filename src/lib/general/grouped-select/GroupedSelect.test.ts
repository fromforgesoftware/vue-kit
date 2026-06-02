import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GroupedSelectPanel from './GroupedSelectPanel.vue';
import type { GroupedItem, GroupedCategory } from './grouped-select';

const categories: GroupedCategory[] = [
	{ id: 'account', label: 'Account', section: 'General' },
	{ id: 'data', label: 'Data', section: 'WFM' },
];

const items: GroupedItem[] = [
	{
		id: 'view-profile',
		label: 'View Profile',
		description: 'View user profile',
		category: 'account',
	},
	{
		id: 'edit-profile',
		label: 'Edit Profile',
		description: 'Edit user profile',
		category: 'account',
	},
	{ id: 'view-data', label: 'View Data', description: 'View WFM data', category: 'data' },
];

describe('GroupedSelectPanel', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render categories', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			expect(wrapper.text()).toContain('Account');
			expect(wrapper.text()).toContain('Data');
		});

		it('should render section headers', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			expect(wrapper.text()).toContain('General');
			expect(wrapper.text()).toContain('WFM');
		});

		it('should render items for selected category', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			// First category auto-selected
			expect(wrapper.text()).toContain('View Profile');
			expect(wrapper.text()).toContain('Edit Profile');
		});

		it('should render item descriptions', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			expect(wrapper.text()).toContain('View user profile');
		});
	});

	describe('props', () => {
		it('should show search when showSearch is true', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [], showSearch: true },
			});
			expect(wrapper.find('input').exists()).toBe(true);
		});

		it('should hide search when showSearch is false', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [], showSearch: false },
			});
			expect(wrapper.find('input').exists()).toBe(false);
		});

		it('should show footer when showFooter is true', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			expect(wrapper.text()).toContain('0 selected');
		});

		it('should display correct selected count', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: ['view-profile', 'view-data'] },
			});
			expect(wrapper.text()).toContain('2 selected');
		});
	});

	describe('category badges', () => {
		it('should show count badges', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: ['view-profile'] },
			});
			expect(wrapper.text()).toContain('1/2');
		});

		it('should show 0 count when nothing selected', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [] },
			});
			expect(wrapper.text()).toContain('0/2');
			expect(wrapper.text()).toContain('0/1');
		});
	});

	describe('edge cases', () => {
		it('should handle empty items', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items: [], categories, modelValue: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle empty categories', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories: [], modelValue: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should support custom class', () => {
			const wrapper = mount(GroupedSelectPanel, {
				props: { items, categories, modelValue: [], class: 'custom-panel' },
			});
			expect(wrapper.html()).toContain('custom-panel');
		});
	});
});
