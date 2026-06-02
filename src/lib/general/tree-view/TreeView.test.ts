import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TreeView from './TreeView.vue';
import type { TreeNode } from './tree-view';

const sampleData: TreeNode[] = [
	{
		id: 'folder-1',
		name: 'Folder 1',
		children: [
			{ id: 'file-1', name: 'File 1.txt' },
			{ id: 'file-2', name: 'File 2.txt' },
		],
	},
	{
		id: 'folder-2',
		name: 'Folder 2',
		children: [{ id: 'file-3', name: 'File 3.txt' }],
	},
	{ id: 'file-4', name: 'File 4.txt' },
];

describe('TreeView', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render tree nodes', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData },
			});
			expect(wrapper.text()).toContain('Folder 1');
			expect(wrapper.text()).toContain('Folder 2');
			expect(wrapper.text()).toContain('File 4.txt');
		});
	});

	describe('props', () => {
		it('should accept data prop', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData },
			});
			expect(wrapper.text()).toContain('Folder 1');
		});

		it('should accept defaultExpanded prop', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData, defaultExpanded: ['folder-2'] },
			});
			expect(wrapper.text()).toContain('File 3.txt');
		});

		it('should accept multiple prop', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData, multiple: true },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('expansion', () => {
		it('should expand nodes from defaultExpanded', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData, defaultExpanded: ['folder-1'] },
			});
			expect(wrapper.text()).toContain('File 1.txt');
			expect(wrapper.text()).toContain('File 2.txt');
		});

		it('should not show children of collapsed nodes', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData },
			});
			expect(wrapper.text()).not.toContain('File 1.txt');
		});
	});

	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(TreeView, {
				props: { data: sampleData, class: 'custom-tree' },
			});
			expect(wrapper.html()).toContain('custom-tree');
		});
	});

	describe('edge cases', () => {
		it('should handle empty data', () => {
			const wrapper = mount(TreeView, {
				props: { data: [] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle deeply nested data', () => {
			const deepData: TreeNode[] = [
				{
					id: 'level-1',
					name: 'Level 1',
					children: [
						{
							id: 'level-2',
							name: 'Level 2',
							children: [
								{
									id: 'level-3',
									name: 'Level 3',
									children: [{ id: 'level-4', name: 'Level 4' }],
								},
							],
						},
					],
				},
			];
			const wrapper = mount(TreeView, {
				props: { data: deepData, defaultExpanded: ['level-1', 'level-2', 'level-3'] },
			});
			expect(wrapper.text()).toContain('Level 1');
			expect(wrapper.text()).toContain('Level 4');
		});

		it('should handle many nodes', () => {
			const manyNodes = Array.from({ length: 50 }, (_, i) => ({
				id: `node-${i}`,
				name: `Node ${i}`,
			}));
			const wrapper = mount(TreeView, {
				props: { data: manyNodes },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
