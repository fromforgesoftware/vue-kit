import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import TreeView from './TreeView.vue';
import type { TreeNode } from './tree-view.js';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default'] as const;

const treeData: TreeNode[] = [
	{
		id: '1',
		name: 'Documents',
		children: [
			{
				id: '1-1',
				name: 'Work',
				children: [
					{ id: '1-1-1', name: 'Project A' },
					{ id: '1-1-2', name: 'Project B' },
				],
			},
			{
				id: '1-2',
				name: 'Personal',
				children: [{ id: '1-2-1', name: 'Resume.pdf' }],
			},
		],
	},
	{
		id: '2',
		name: 'Photos',
		children: [
			{ id: '2-1', name: 'Vacation' },
			{ id: '2-2', name: 'Family' },
		],
	},
	{
		id: '3',
		name: 'README.md',
	},
];

const meta = {
	title: 'General/Tree View',
	component: TreeView,
	tags: ['!autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Hierarchical disclosure (folders / files) built on Reka UI. Roving focus, arrow-key navigation, type-ahead, and selection are wired internally. Each row exposes data-slots for testing.',
			},
		},
	},
	argTypes: {
		multiple: { control: 'boolean', description: 'Allow multiple nodes to be selected.' },
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density tier — controls row height and label typography.',
		},
		hideIcons: { control: 'boolean', description: 'Hide file / folder icons.' },
		indentStep: {
			control: { type: 'number', min: 8, max: 32, step: 4 },
			description: 'Indent step (px) per nesting level.',
		},
		ariaLabel: { control: 'text', description: 'Accessible label for the tree root.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		data: treeData,
		multiple: false,
		size: 'default',
		hideIcons: false,
		indentStep: 16,
		ariaLabel: 'File tree',
		'onUpdate:modelValue': fn(),
	},
	render: (args) => ({
		components: { TreeView },
		setup: () => ({ args, treeData }),
		template: `
      <div class="w-72 rounded-md border bg-card p-3">
        <TreeView v-bind="args" :data="treeData" :default-expanded="['1']" />
      </div>
    `,
	}),
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ──────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`sm` for sidebar/filter contexts; `default` for general use. Both meet 24×24 chevron hit area.',
			},
		},
	},
	render: () => ({
		components: { TreeView },
		setup: () => ({ ALL_SIZES, treeData }),
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="s in ALL_SIZES" :key="s" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">size="{{ s }}"</span>
          <div class="w-72 rounded-md border bg-card p-3">
            <TreeView :size="s" :data="treeData" :default-expanded="['1', '1-1']" />
          </div>
        </div>
      </div>
    `,
	}),
};

export const WithSelection: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Click or Space/Enter to select a node. Selected nodes expose `aria-selected="true"`.',
			},
		},
	},
	render: () => ({
		components: { TreeView },
		setup() {
			const selected = ref<TreeNode>();
			return { selected, treeData };
		},
		template: `
      <div class="flex flex-col gap-2">
        <div class="text-xs text-muted-foreground">Selected: {{ selected?.name ?? 'none' }}</div>
        <div class="w-72 rounded-md border bg-card p-3">
          <TreeView v-model:model-value="selected" :data="treeData" :default-expanded="['1', '1-1']" />
        </div>
      </div>
    `,
	}),
};

export const MultipleSelection: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Set `multiple` to allow several nodes selected at once. The model becomes an array.',
			},
		},
	},
	render: () => ({
		components: { TreeView },
		setup() {
			const selected = ref<TreeNode[]>([]);
			return { selected, treeData };
		},
		template: `
      <div class="w-72 rounded-md border bg-card p-3">
        <TreeView v-model:model-value="selected" :data="treeData" :default-expanded="['1', '1-1', '2']" multiple />
      </div>
    `,
	}),
};

export const HideIcons: Story = {
	parameters: {
		docs: { description: { story: 'Hide icons for a more compact, navigation-style tree.' } },
	},
	render: () => ({
		components: { TreeView },
		setup: () => ({ treeData }),
		template: `
      <div class="w-72 rounded-md border bg-card p-3">
        <TreeView :data="treeData" :default-expanded="['1']" hide-icons />
      </div>
    `,
	}),
};

export const CustomIndent: Story = {
	parameters: {
		docs: {
			description: { story: 'Tweak `indentStep` (px) for more or less aggressive indentation.' },
		},
	},
	render: () => ({
		components: { TreeView },
		setup: () => ({ treeData }),
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">indentStep=8</span>
          <div class="w-72 rounded-md border bg-card p-3">
            <TreeView :data="treeData" :default-expanded="['1', '1-1']" :indent-step="8" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">indentStep=24</span>
          <div class="w-72 rounded-md border bg-card p-3">
            <TreeView :data="treeData" :default-expanded="['1', '1-1']" :indent-step="24" />
          </div>
        </div>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ─────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="tree-view"]')).not.toBeNull();
		const items = canvasElement.querySelectorAll('[data-slot="tree-view-item"]');
		await expect(items.length).toBeGreaterThan(0);
		const labels = canvasElement.querySelectorAll('[data-slot="tree-view-label"]');
		await expect(labels.length).toBe(items.length);
	},
};

export const InteractiveArrowDownMovesFocus: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="tree-view-item"]');
		await expect(items.length).toBeGreaterThan(2);

		items[0].focus();
		await expect(items[0]).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect(items[1]).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect(items[2]).toHaveFocus();

		await userEvent.keyboard('{ArrowUp}');
		await expect(items[1]).toHaveFocus();
	},
};

export const InteractiveArrowRightExpandsCollapsed: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { TreeView },
		setup: () => ({ treeData }),
		template: `
      <div class="w-72 rounded-md border bg-card p-3">
        <TreeView :data="treeData" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="tree-view-item"]');
		// Initially: 3 root nodes, none expanded.
		await expect(items.length).toBe(3);

		items[0].focus();
		// ArrowRight on a collapsed parent expands it.
		await userEvent.keyboard('{ArrowRight}');

		const after = canvasElement.querySelectorAll('[data-slot="tree-view-item"]');
		await expect(after.length).toBeGreaterThan(3);
	},
};

export const InteractiveArrowLeftCollapses: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { TreeView },
		setup: () => ({ treeData }),
		template: `
      <div class="w-72 rounded-md border bg-card p-3">
        <TreeView :data="treeData" :default-expanded="['1']" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="tree-view-item"]');
		// Initial: root '1' expanded → at least 5 visible items (1 root + 2 children + 'Photos' + 'README.md').
		const initialCount = items.length;
		await expect(initialCount).toBeGreaterThanOrEqual(5);

		items[0].focus();
		await userEvent.keyboard('{ArrowLeft}');

		const after = canvasElement.querySelectorAll('[data-slot="tree-view-item"]');
		await expect(after.length).toBeLessThan(initialCount);
	},
};

export const InteractiveSelectedAriaAttribute: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { TreeView },
		setup() {
			const selected = ref<TreeNode>();
			return { selected, treeData };
		},
		template: `
      <div class="w-72 rounded-md border bg-card p-3">
        <TreeView v-model:model-value="selected" :data="treeData" :default-expanded="['1']" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="tree-view-item"]');
		items[0].focus();
		await userEvent.keyboard(' ');
		// Selected items expose aria-selected="true" via the bind from Reka.
		const selected = canvasElement.querySelectorAll<HTMLElement>('[aria-selected="true"]');
		await expect(selected.length).toBe(1);
	},
};

export const InteractiveChevronTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'WCAG 2.5.8 — chevron toggles meet the 24×24 minimum.' } },
	},
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const chevrons = canvasElement.querySelectorAll<HTMLElement>('[data-slot="tree-view-chevron"]');
		await expect(chevrons.length).toBeGreaterThan(0);
		for (const c of chevrons) {
			expectMinTargetSize(c, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { TreeView },
		setup: () => ({ treeData }),
		template: `
      <div data-test-root class="w-full p-2">
        <TreeView :data="treeData" :default-expanded="['1', '1-1']" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const items = root.querySelectorAll<HTMLElement>('[data-slot="tree-view-item"]');
			await expect(items.length).toBeGreaterThan(0);
			for (const it of items) {
				const r = it.getBoundingClientRect();
				await expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
