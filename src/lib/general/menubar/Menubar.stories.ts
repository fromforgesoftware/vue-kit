import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import Menubar from './Menubar.vue';
import MenubarMenu from './MenubarMenu.vue';
import MenubarTrigger from './MenubarTrigger.vue';
import MenubarContent from './MenubarContent.vue';
import MenubarItem from './MenubarItem.vue';
import MenubarCheckboxItem from './MenubarCheckboxItem.vue';
import MenubarRadioGroup from './MenubarRadioGroup.vue';
import MenubarRadioItem from './MenubarRadioItem.vue';
import MenubarLabel from './MenubarLabel.vue';
import MenubarSeparator from './MenubarSeparator.vue';
import MenubarSub from './MenubarSub.vue';
import MenubarSubTrigger from './MenubarSubTrigger.vue';
import MenubarSubContent from './MenubarSubContent.vue';
import MenubarShortcut from './MenubarShortcut.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const components = {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarItem,
	MenubarCheckboxItem,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarLabel,
	MenubarSeparator,
	MenubarSub,
	MenubarSubTrigger,
	MenubarSubContent,
	MenubarShortcut,
};

const meta = {
	title: 'General/Menubar',
	component: Menubar,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'An application-style horizontal menu bar — File / Edit / View — that opens stacked menus when triggered. Built on Reka UI; content portals to <code>document.body</code>. Use sparingly: most modern apps prefer a single Dropdown Menu or in-app commands. Menubar is for genuinely menu-driven editors.',
			},
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Bar height + text size.',
		},
		loop: {
			control: 'boolean',
			description: 'Loop keyboard navigation between first/last top-level menu.',
		},
	},
	args: {
		size: 'default',
		loop: true,
	},
	render: (args) => ({
		components,
		setup() {
			const showToolbar = ref(true);
			const showSidebar = ref(false);
			return { args, showToolbar, showSidebar };
		},
		template: `
      <div class="flex justify-center p-12">
        <Menubar v-bind="args">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New Tab
                <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                New Window
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email link</MenubarItem>
                  <MenubarItem>Messages</MenubarItem>
                  <MenubarItem>Notes</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>
                Print
                <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
              <MenubarItem variant="destructive">Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo<MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
              <MenubarItem>Redo<MenubarShortcut>⌘Y</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut<MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
              <MenubarItem>Copy<MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
              <MenubarItem>Paste<MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem v-model:checked="showToolbar">Show Toolbar</MenubarCheckboxItem>
              <MenubarCheckboxItem v-model:checked="showSidebar">Show Sidebar</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    `,
	}),
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three height tiers — match the surrounding chrome.' } },
	},
	render: () => ({
		components,
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-4 p-6">
        <Menubar v-for="s in ALL_SIZES" :key="s" :size="s">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpensOnClick: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('menuitem', { name: /file/i });
		await userEvent.click(trigger);
		const content = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="menubar-content"]') as HTMLElement | null;
			if (!el) throw new Error('menubar content not found');
			return el;
		});
		await expect(content).toBeInTheDocument();
		await expect(content.getAttribute('role')).toBe('menu');
	},
};

export const InteractiveArrowsBetweenTopLevel: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const fileTrigger = canvas.getByRole('menuitem', { name: /file/i });
		const editTrigger = canvas.getByRole('menuitem', { name: /edit/i });

		await userEvent.click(fileTrigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="menubar-content"]');
			if (!el) throw new Error('menubar content not found');
			return el;
		});
		// ArrowRight inside an open menu moves to next top-level menu
		await userEvent.keyboard('{ArrowRight}');
		await waitFor(async () => {
			await expect(editTrigger.getAttribute('data-state')).toBe('open');
		});
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('menuitem', { name: /file/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="menubar-content"]');
			if (!el) throw new Error('menubar content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="menubar-content"]')).toBeNull();
		});
	},
};

export const InteractiveClickItemInvokesHandler: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <div class="flex justify-center p-12">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem @select="args.onSelect">First action</MenubarItem>
              <MenubarItem>Second action</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    `,
	}),
	args: {
		// @ts-expect-error — locally added test arg
		onSelect: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('menuitem', { name: /file/i });
		await userEvent.click(trigger);
		const item = await inBody().findByRole('menuitem', { name: /first action/i });
		await userEvent.click(item);
		// @ts-expect-error — locally added test arg
		await waitFor(() => expect(args.onSelect).toHaveBeenCalled());
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvasElement.querySelector('[data-slot="menubar"]')).not.toBeNull();
		await expect(
			canvasElement.querySelectorAll('[data-slot="menubar-trigger"]').length,
		).toBeGreaterThan(0);
		const trigger = canvas.getByRole('menuitem', { name: /file/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="menubar-content"]');
			if (!el) throw new Error('menubar content not found');
			return el;
		});
		await expect(document.body.querySelector('[data-slot="menubar-content"]')).not.toBeNull();
		await expect(
			document.body.querySelectorAll('[data-slot="menubar-item"]').length,
		).toBeGreaterThan(0);
		await expect(document.body.querySelector('[data-slot="menubar-separator"]')).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Bar renders without horizontal overflow at every viewport. Content is portaled and never affects parent layout.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <div data-test-root class="p-2">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent><MenubarItem>New</MenubarItem></MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent><MenubarItem>Undo</MenubarItem></MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
		});
	},
};
