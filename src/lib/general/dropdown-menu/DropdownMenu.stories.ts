import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { Settings, Plus, Pencil, Trash2 } from '@lucide/vue';
import DropdownMenu from './DropdownMenu.vue';
import DropdownMenuTrigger from './DropdownMenuTrigger.vue';
import DropdownMenuContent from './DropdownMenuContent.vue';
import DropdownMenuItem from './DropdownMenuItem.vue';
import DropdownMenuCheckboxItem from './DropdownMenuCheckboxItem.vue';
import DropdownMenuRadioGroup from './DropdownMenuRadioGroup.vue';
import DropdownMenuRadioItem from './DropdownMenuRadioItem.vue';
import DropdownMenuLabel from './DropdownMenuLabel.vue';
import DropdownMenuSeparator from './DropdownMenuSeparator.vue';
import DropdownMenuSub from './DropdownMenuSub.vue';
import DropdownMenuSubTrigger from './DropdownMenuSubTrigger.vue';
import DropdownMenuSubContent from './DropdownMenuSubContent.vue';
import DropdownMenuShortcut from './DropdownMenuShortcut.vue';
import DropdownMenuGroup from './DropdownMenuGroup.vue';
import Button from '../button/Button.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg', 'auto'] as const;

const components = {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuShortcut,
	DropdownMenuGroup,
	Button,
	Settings,
	Plus,
	Pencil,
	Trash2,
};

const meta = {
	title: 'General/Dropdown Menu',
	component: DropdownMenu,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A list of actions or options triggered by a button click. Built on Reka UI — content portals to <code>document.body</code> so it can escape <code>overflow: hidden</code> ancestors. Supports submenus, checkbox items, radio items, keyboard shortcuts, and a destructive variant for delete actions.',
			},
		},
	},
	argTypes: {
		modal: {
			control: 'boolean',
			description:
				'When true, focus is trapped and the rest of the page is inert. Default true (modal).',
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
        <DropdownMenu v-bind="args">
          <DropdownMenuTrigger>
            <Button variant="outline">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Pencil />
              Edit
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus />
              Duplicate
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 />
              Delete
              <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    `,
	}),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Four width tiers — pick the smallest that fits.' },
		},
	},
	render: () => ({
		components,
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-wrap gap-3 p-6 justify-center">
        <DropdownMenu v-for="s in ALL_SIZES" :key="s">
          <DropdownMenuTrigger>
            <Button variant="outline">size: {{ s }}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent :size="s">
            <DropdownMenuItem>Action one</DropdownMenuItem>
            <DropdownMenuItem>Action two</DropdownMenuItem>
            <DropdownMenuItem>Action three</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    `,
	}),
};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Use <code>variant="destructive"</code> on items that delete or remove data — it tints the text and icon red and shifts the focus background.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <div class="flex justify-center p-12">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">Item variants</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Pencil />
              Default item
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings />
              Disabled item
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 />
              Destructive item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    `,
	}),
};

export const WithSubmenuAndChecks: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Submenus, checkbox items, radio groups, labels, separators and shortcuts in a realistic browser-style menu.',
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
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">Browser menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              New Tab
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Save page as…</DropdownMenuItem>
                <DropdownMenuItem>Create shortcut…</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Developer tools</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>
              New Window
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model:checked="showBookmarks">
              Show Bookmarks
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model:checked="showFullUrls">
              Show Full URLs
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>People</DropdownMenuLabel>
            <DropdownMenuRadioGroup v-model="person">
              <DropdownMenuRadioItem value="pedro">Pedro Duarte</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="colm">Colm Tuite</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

// When the menu is open, Reka's FocusScope marks the canvas root
// (`<div data-v-app>`) as `aria-hidden="true"`. Inside Storybook the trigger
// button stays in that root, which axe reports as `aria-hidden-focus`. In a
// real app the button is correctly inert via Reka, so this is a Storybook
// iframe artifact rather than a real component issue. Disable the rule for
// the interactive stories that open the menu.
const A11Y_HIDDEN_FOCUS_BYPASS = {
	a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

export const InteractiveOpensOnTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open menu/i });
		await userEvent.click(trigger);
		const content = await waitFor(() => {
			const el = document.body.querySelector(
				'[data-slot="dropdown-menu-content"]',
			) as HTMLElement | null;
			if (!el) throw new Error('dropdown content not found');
			return el;
		});
		await expect(content).toBeInTheDocument();
		await expect(content.getAttribute('role')).toBe('menu');
	},
};

export const InteractiveKeyboardArrows: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open menu/i });
		trigger.focus();
		await userEvent.keyboard('{Enter}');
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="dropdown-menu-content"]');
			if (!el) throw new Error('dropdown content not found');
			return el;
		});
		// Reka opens with first item focused on Enter; ArrowDown moves to second.
		await userEvent.keyboard('{ArrowDown}');
		const items = await inBody().findAllByRole('menuitem');
		await waitFor(async () => {
			await expect(document.activeElement).toBe(items[1]);
		});
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open menu/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="dropdown-menu-content"]');
			if (!el) throw new Error('dropdown content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull();
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
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @select="args.onSelect">First item</DropdownMenuItem>
            <DropdownMenuItem>Second item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    `,
	}),
	args: {
		// @ts-expect-error — locally added test arg
		onSelect: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open menu/i });
		await userEvent.click(trigger);
		const item = await inBody().findByRole('menuitem', { name: /first item/i });
		await userEvent.click(item);
		// @ts-expect-error — locally added test arg
		await waitFor(() => expect(args.onSelect).toHaveBeenCalled());
		// Menu closes after select
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull();
		});
	},
};

export const InteractiveDestructiveVariant: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open menu/i });
		await userEvent.click(trigger);
		const item = await inBody().findByRole('menuitem', { name: /delete/i });
		await expect(item.getAttribute('data-variant')).toBe('destructive');
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: A11Y_HIDDEN_FOCUS_BYPASS,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open menu/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="dropdown-menu-content"]');
			if (!el) throw new Error('dropdown content not found');
			return el;
		});
		await expect(canvasElement.querySelector('[data-slot="dropdown-menu-trigger"]')).not.toBeNull();
		await expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).not.toBeNull();
		await expect(
			document.body.querySelectorAll('[data-slot="dropdown-menu-item"]').length,
		).toBeGreaterThan(0);
		await expect(
			document.body.querySelector('[data-slot="dropdown-menu-separator"]'),
		).not.toBeNull();
		await expect(document.body.querySelector('[data-slot="dropdown-menu-label"]')).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Trigger renders without horizontal overflow at every viewport. Content is portaled and never affects parent layout.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <div data-test-root class="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action one</DropdownMenuItem>
            <DropdownMenuItem>Action two</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const btn = root.querySelector<HTMLButtonElement>('button')!;
			const r = btn.getBoundingClientRect();
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
