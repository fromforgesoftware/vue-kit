import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import Toolbar from './Toolbar.vue';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarLink from './ToolbarLink.vue';
import ToolbarSeparator from './ToolbarSeparator.vue';
import ToolbarToggleGroup from './ToolbarToggleGroup.vue';
import ToolbarToggleItem from './ToolbarToggleItem.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default'] as const;
const ALL_ORIENTATIONS = ['horizontal', 'vertical'] as const;

const meta = {
	title: 'General/Toolbar',
	component: Toolbar,
	tags: ['!autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A horizontal or vertical group of related actions with roving focus. Built on Reka UI — implements the WAI-ARIA Toolbar pattern (single tab stop, arrow keys move between items).',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual surface treatment.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density tier — propagates to all items inside.',
		},
		orientation: {
			control: 'select',
			options: ALL_ORIENTATIONS,
			description: 'Layout axis.',
		},
	},
	args: {
		variant: 'default',
		size: 'default',
		orientation: 'horizontal',
	},
	render: (args) => ({
		components: {
			Toolbar,
			ToolbarButton,
			ToolbarLink,
			ToolbarSeparator,
			ToolbarToggleGroup,
			ToolbarToggleItem,
		},
		setup() {
			const formatting = ref<string[]>([]);
			const alignment = ref('center');
			return { args, formatting, alignment, fnCb: fn() };
		},
		template: `
      <Toolbar v-bind="args" aria-label="Formatting options">
        <ToolbarToggleGroup v-model="formatting" type="multiple" aria-label="Text formatting">
          <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
          <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
          <ToolbarToggleItem value="underline" aria-label="Underline">U</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarToggleGroup v-model="alignment" type="single" aria-label="Text alignment">
          <ToolbarToggleItem value="left" aria-label="Left">L</ToolbarToggleItem>
          <ToolbarToggleItem value="center" aria-label="Center">C</ToolbarToggleItem>
          <ToolbarToggleItem value="right" aria-label="Right">R</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarLink href="#">Edited 2 hours ago</ToolbarLink>
        <ToolbarButton class="ml-auto">Share</ToolbarButton>
      </Toolbar>
    `,
	}),
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Two surface treatments. `default` is the bordered card; `ghost` strips chrome for inline placements.',
			},
		},
	},
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-6">
        <div v-for="v in ALL_VARIANTS" :key="v" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">{{ v }}</span>
          <Toolbar :variant="v" aria-label="Demo">
            <ToolbarToggleGroup type="multiple" aria-label="Format">
              <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
              <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
            </ToolbarToggleGroup>
            <ToolbarSeparator />
            <ToolbarButton>Action</ToolbarButton>
          </Toolbar>
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Two density tiers. Items propagate from the toolbar via inject.' },
		},
	},
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-6">
        <div v-for="s in ALL_SIZES" :key="s" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">{{ s }}</span>
          <Toolbar :size="s" aria-label="Demo">
            <ToolbarToggleGroup type="multiple" aria-label="Format">
              <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
              <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
            </ToolbarToggleGroup>
            <ToolbarSeparator />
            <ToolbarButton>Action</ToolbarButton>
          </Toolbar>
        </div>
      </div>
    `,
	}),
};

export const Orientation: Story = {
	parameters: {
		docs: {
			description: {
				story: '`vertical` stacks items in a column. The separator switches axis automatically.',
			},
		},
	},
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem },
		template: `
      <div class="flex gap-8 items-start">
        <Toolbar orientation="horizontal" aria-label="Horizontal demo">
          <ToolbarToggleGroup type="multiple" aria-label="Format">
            <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
            <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton>Action</ToolbarButton>
        </Toolbar>
        <Toolbar orientation="vertical" class="w-32" aria-label="Vertical demo">
          <ToolbarToggleGroup type="multiple" aria-label="Format">
            <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
            <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton>Action</ToolbarButton>
        </Toolbar>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveArrowKeysRovingFocus: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem },
		template: `
      <Toolbar aria-label="Roving focus test">
        <ToolbarToggleGroup type="multiple" aria-label="Format">
          <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
          <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton>Action</ToolbarButton>
      </Toolbar>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="toolbar-toggle-item"], [data-slot="toolbar-button"]',
		);
		await expect(items.length).toBe(3);

		items[0].focus();
		await expect(items[0]).toHaveFocus();

		await userEvent.keyboard('{ArrowRight}');
		await expect(items[1]).toHaveFocus();

		await userEvent.keyboard('{ArrowRight}');
		await expect(items[2]).toHaveFocus();

		await userEvent.keyboard('{ArrowLeft}');
		await expect(items[1]).toHaveFocus();
	},
};

export const InteractiveHomeEndJump: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarToggleGroup, ToolbarToggleItem },
		template: `
      <Toolbar aria-label="Home/End test">
        <ToolbarToggleGroup type="multiple" aria-label="Format">
          <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
          <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
          <ToolbarToggleItem value="underline" aria-label="Underline">U</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarButton>Last</ToolbarButton>
      </Toolbar>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="toolbar-toggle-item"], [data-slot="toolbar-button"]',
		);
		await expect(items.length).toBe(4);

		items[1].focus();
		await userEvent.keyboard('{Home}');
		await expect(items[0]).toHaveFocus();

		await userEvent.keyboard('{End}');
		await expect(items[3]).toHaveFocus();
	},
};

export const InteractiveSeparatorNotFocusable: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const sep = canvasElement.querySelector<HTMLElement>('[data-slot="toolbar-separator"]');
		await expect(sep).not.toBeNull();
		// Focusing a non-tabbable element either no-ops or moves to body.
		sep!.focus();
		await expect(document.activeElement).not.toBe(sep);
		// tabindex must not be set (or must be -1 / absent)
		const ti = sep!.getAttribute('tabindex');
		await expect(ti === null || ti === '-1').toBe(true);
	},
};

export const InteractiveTogglePressed: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Toolbar, ToolbarToggleGroup, ToolbarToggleItem },
		template: `
      <Toolbar aria-label="Toggle test">
        <ToolbarToggleGroup type="multiple" aria-label="Format">
          <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    `,
	}),
	play: async ({ canvasElement }) => {
		const item = canvasElement.querySelector<HTMLElement>('[data-slot="toolbar-toggle-item"]')!;
		await expect(item.getAttribute('data-state')).toBe('off');

		await userEvent.click(item);
		await expect(item.getAttribute('data-state')).toBe('on');

		await userEvent.click(item);
		await expect(item.getAttribute('data-state')).toBe('off');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Every interactive item meets the WCAG 2.5.8 minimum (24×24).' },
		},
	},
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarToggleGroup, ToolbarToggleItem },
		template: `
      <Toolbar aria-label="Target size test">
        <ToolbarToggleGroup type="multiple" aria-label="Format">
          <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
          <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarButton>Action</ToolbarButton>
      </Toolbar>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="toolbar-toggle-item"], [data-slot="toolbar-button"]',
		);
		for (const it of items) {
			expectMinTargetSize(it, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Toolbar uses min-w-max so it can scroll horizontally inside a constrained container — but the container itself never overflows the viewport.',
			},
		},
	},
	render: () => ({
		components: { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem },
		template: `
      <div data-test-root class="w-full overflow-x-auto p-2">
        <Toolbar aria-label="Responsive demo">
          <ToolbarToggleGroup type="multiple" aria-label="Format">
            <ToolbarToggleItem value="bold" aria-label="Bold">B</ToolbarToggleItem>
            <ToolbarToggleItem value="italic" aria-label="Italic">I</ToolbarToggleItem>
            <ToolbarToggleItem value="underline" aria-label="Underline">U</ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton>Action</ToolbarButton>
        </Toolbar>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const items = root.querySelectorAll<HTMLElement>(
				'[data-slot="toolbar-toggle-item"], [data-slot="toolbar-button"]',
			);
			for (const it of items) {
				const r = it.getBoundingClientRect();
				await expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
