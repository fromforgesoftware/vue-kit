import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, userEvent, waitFor } from 'storybook/test';
import { Pencil, Trash2, Plus, ArrowRightLeft } from '@lucide/vue';
import ContextMenu from './ContextMenu.vue';
import ContextMenuTrigger from './ContextMenuTrigger.vue';
import ContextMenuContent from './ContextMenuContent.vue';
import ContextMenuItem from './ContextMenuItem.vue';
import ContextMenuCheckboxItem from './ContextMenuCheckboxItem.vue';
import ContextMenuRadioGroup from './ContextMenuRadioGroup.vue';
import ContextMenuRadioItem from './ContextMenuRadioItem.vue';
import ContextMenuLabel from './ContextMenuLabel.vue';
import ContextMenuSeparator from './ContextMenuSeparator.vue';
import ContextMenuSub from './ContextMenuSub.vue';
import ContextMenuSubTrigger from './ContextMenuSubTrigger.vue';
import ContextMenuSubContent from './ContextMenuSubContent.vue';
import ContextMenuShortcut from './ContextMenuShortcut.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg', 'auto'] as const;

const components = {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubTrigger,
	ContextMenuSubContent,
	ContextMenuShortcut,
	Pencil,
	Trash2,
	Plus,
	ArrowRightLeft,
};

const meta = {
	title: 'General/Context Menu',
	component: ContextMenu,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A right-click (long-press on touch) menu anchored to a target element. Same composition as Dropdown Menu, but the trigger is a region instead of a button. Built on Reka UI — content portals to <code>document.body</code>.',
			},
		},
	},
	argTypes: {
		modal: {
			control: 'boolean',
			description: 'When true, focus is trapped and the rest of the page is inert.',
		},
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		modal: true,
		'onUpdate:open': fn(),
	},
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <div class="flex justify-center p-12">
        <ContextMenu v-bind="args">
          <ContextMenuTrigger>
            <div data-trigger class="flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground select-none">
              Right click here
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Pencil />
              Edit
              <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <Plus />
              Duplicate
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Trash2 />
              Delete
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    `,
	}),
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Four width tiers — pick the smallest that fits.' } },
	},
	render: () => ({
		components,
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="grid grid-cols-2 gap-6 p-6">
        <ContextMenu v-for="s in ALL_SIZES" :key="s">
          <ContextMenuTrigger>
            <div class="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground select-none">
              size: {{ s }}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent :size="s">
            <ContextMenuItem>Action one</ContextMenuItem>
            <ContextMenuItem>Action two</ContextMenuItem>
            <ContextMenuItem>Action three</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    `,
	}),
};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Use <code>variant="destructive"</code> for delete or remove actions.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <div class="flex justify-center p-12">
        <ContextMenu>
          <ContextMenuTrigger>
            <div class="flex h-32 w-72 items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground select-none">
              Right click for variants
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Pencil />
              Default item
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <ArrowRightLeft />
              Disabled item
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Trash2 />
              Destructive item
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    `,
	}),
};

export const WithSubmenuAndChecks: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Submenus, checkbox items, radio groups, labels, separators and shortcuts.',
			},
		},
	},
	render: () => ({
		components,
		setup() {
			const showBookmarks = ref(true);
			const showFullUrls = ref(false);
			const person = ref('pedro');
			return { showBookmarks, showFullUrls, person };
		},
		template: `
      <div class="flex justify-center p-12">
        <ContextMenu>
          <ContextMenuTrigger>
            <div class="flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground select-none">
              Right click here
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              New Tab
              <ContextMenuShortcut>⌘T</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Save page as…</ContextMenuItem>
                <ContextMenuItem>Create shortcut…</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Developer tools</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem v-model:checked="showBookmarks">
              Show Bookmarks
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem v-model:checked="showFullUrls">
              Show Full URLs
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuLabel>People</ContextMenuLabel>
            <ContextMenuRadioGroup v-model="person">
              <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
              <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

function fireContextMenu(el: Element) {
	const r = el.getBoundingClientRect();
	el.dispatchEvent(
		new MouseEvent('contextmenu', {
			bubbles: true,
			cancelable: true,
			button: 2,
			clientX: r.left + r.width / 2,
			clientY: r.top + r.height / 2,
		}),
	);
}

export const InteractiveOpensOnContextmenu: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-trigger]')!;
		fireContextMenu(trigger);
		const content = await waitFor(() => {
			const el = document.body.querySelector(
				'[data-slot="context-menu-content"]',
			) as HTMLElement | null;
			if (!el) throw new Error('context-menu content not found');
			return el;
		});
		await expect(content).toBeInTheDocument();
		await expect(content.getAttribute('role')).toBe('menu');
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-trigger]')!;
		fireContextMenu(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="context-menu-content"]');
			if (!el) throw new Error('context-menu content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="context-menu-content"]')).toBeNull();
		});
	},
};

export const InteractiveDestructiveVariant: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-trigger]')!;
		fireContextMenu(trigger);
		const item = await inBody().findByRole('menuitem', { name: /delete/i });
		await expect(item.getAttribute('data-variant')).toBe('destructive');
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-trigger]')!;
		fireContextMenu(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="context-menu-content"]');
			if (!el) throw new Error('context-menu content not found');
			return el;
		});
		await expect(canvasElement.querySelector('[data-slot="context-menu-trigger"]')).not.toBeNull();
		await expect(document.body.querySelector('[data-slot="context-menu-content"]')).not.toBeNull();
		await expect(
			document.body.querySelectorAll('[data-slot="context-menu-item"]').length,
		).toBeGreaterThan(0);
		await expect(
			document.body.querySelector('[data-slot="context-menu-separator"]'),
		).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Trigger renders without horizontal overflow at every viewport.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <div data-test-root class="p-2">
        <ContextMenu>
          <ContextMenuTrigger>
            <div data-trigger class="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-border text-sm text-muted-foreground select-none">
              Right click here
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Action one</ContextMenuItem>
            <ContextMenuItem>Action two</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
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
