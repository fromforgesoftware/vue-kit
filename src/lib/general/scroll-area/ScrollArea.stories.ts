import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import ScrollArea from './ScrollArea.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_ORIENTATIONS = ['vertical', 'horizontal', 'both'] as const;

const meta = {
	title: 'General/Scroll Area',
	component: ScrollArea,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A scrollable region with custom, OS-style scrollbars that respect the design tokens. Built on Reka UI — native keyboard scrolling, focusable viewport, and screen-reader semantics handled by the primitive.',
			},
		},
	},
	argTypes: {
		orientation: {
			control: 'select',
			options: ALL_ORIENTATIONS,
			description: 'Which axes can scroll.',
		},
		showScrollbar: {
			control: 'boolean',
			description: 'Toggle the custom scrollbar(s). Scrolling still works when hidden.',
		},
	},
	args: {
		orientation: 'vertical',
		showScrollbar: true,
	},
	render: (args) => ({
		components: { ScrollArea },
		setup: () => ({ args, items: Array.from({ length: 50 }, (_, i) => `v1.2.0-beta.${50 - i}`) }),
		template: `
      <ScrollArea v-bind="args" class="h-72 w-48 rounded-md border border-border">
        <div class="p-4">
          <h4 class="mb-4 text-sm font-medium leading-none">Tags</h4>
          <div v-for="tag in items" :key="tag" class="text-sm py-0.5">{{ tag }}</div>
        </div>
      </ScrollArea>
    `,
	}),
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Horizontal: Story = {
	args: { orientation: 'horizontal' },
	parameters: {
		docs: {
			description: {
				story:
					'Single horizontal axis. The viewport keeps content on one line via `whitespace-nowrap`.',
			},
		},
	},
	render: () => ({
		components: { ScrollArea },
		template: `
      <ScrollArea orientation="horizontal" class="w-full max-w-96 whitespace-nowrap rounded-md border border-border">
        <div class="flex w-max space-x-4 p-4">
          <div v-for="n in 20" :key="n" class="w-32 shrink-0 rounded-md border border-border p-4">
            <div class="text-sm font-medium">Item {{ n }}</div>
            <div class="text-xs text-muted-foreground">Description</div>
          </div>
        </div>
      </ScrollArea>
    `,
	}),
};

export const Both: Story = {
	args: { orientation: 'both' },
	parameters: {
		docs: {
			description: { story: 'Both axes — useful for wide tables or grids inside a fixed pane.' },
		},
	},
	render: () => ({
		components: { ScrollArea },
		template: `
      <ScrollArea orientation="both" class="h-72 w-full max-w-96 rounded-md border border-border">
        <div class="p-4 w-[800px]">
          <h4 class="mb-4 text-sm font-medium">Wide grid (800 px)</h4>
          <div class="grid grid-cols-12 gap-2">
            <div v-for="n in 60" :key="n" class="rounded border border-border p-2 text-xs">Cell {{ n }}</div>
          </div>
        </div>
      </ScrollArea>
    `,
	}),
};

export const Orientation: Story = {
	parameters: {
		docs: { description: { story: 'Three orientation values side-by-side.' } },
	},
	render: () => ({
		components: { ScrollArea },
		setup: () => ({ items: Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`) }),
		template: `
      <div class="grid grid-cols-3 gap-6">
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">vertical</span>
          <ScrollArea orientation="vertical" class="h-48 w-48 rounded-md border border-border">
            <div class="p-3">
              <div v-for="r in items" :key="r" class="text-sm py-0.5">{{ r }}</div>
            </div>
          </ScrollArea>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">horizontal</span>
          <ScrollArea orientation="horizontal" class="w-48 rounded-md border border-border">
            <div class="flex w-max gap-2 p-3">
              <div v-for="n in 20" :key="n" class="w-20 shrink-0 rounded border border-border p-2 text-xs">Col {{ n }}</div>
            </div>
          </ScrollArea>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">both</span>
          <ScrollArea orientation="both" class="h-48 w-48 rounded-md border border-border">
            <div class="p-3 w-[400px]">
              <div v-for="r in items" :key="r" class="text-sm py-0.5">{{ r }} — long text that overflows</div>
            </div>
          </ScrollArea>
        </div>
      </div>
    `,
	}),
};

export const NoScrollbar: Story = {
	args: { showScrollbar: false },
	parameters: {
		docs: {
			description: {
				story:
					'Hide the scrollbar but keep scrolling. Use sparingly — visible scrollbars are an affordance.',
			},
		},
	},
};

export const ChatMessages: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Real-world composition: chat panel with header, scrolling body, and input footer.',
			},
		},
	},
	render: () => ({
		components: { ScrollArea },
		template: `
      <div class="flex flex-col h-96 w-80 rounded-md border border-border">
        <div class="border-b border-border p-3">
          <h4 class="text-sm font-semibold">Chat</h4>
        </div>
        <ScrollArea class="flex-1">
          <div class="p-4 space-y-4">
            <div v-for="n in 20" :key="n" :class="['flex', n % 3 === 0 ? 'justify-end' : '']">
              <div :class="['max-w-[70%] rounded-lg px-3 py-2 text-sm', n % 3 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted']">
                Message {{ n }}: This is a sample chat message.
              </div>
            </div>
          </div>
        </ScrollArea>
        <div class="border-t border-border p-3">
          <input class="w-full rounded border border-border px-3 py-2 text-sm bg-background text-foreground" placeholder="Type a message..." />
        </div>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveScrolls: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="scroll-area"]');
		await expect(root).not.toBeNull();
		const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
		await expect(viewport).not.toBeNull();
		// Content overflows so scrollHeight > clientHeight
		await expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);

		viewport!.scrollTop = 100;
		await expect(viewport!.scrollTop).toBe(100);
	},
};

export const InteractiveScrollbarRenders: Story = {
	tags: ['!autodocs', 'test'],
	// `type="always"` keeps the scrollbar mounted regardless of pointer position
	// so the test can query for its DOM presence without simulating hover.
	render: () => ({
		components: { ScrollArea },
		template: `
      <ScrollArea type="always" class="h-48 w-48 rounded-md border border-border">
        <div class="p-3">
          <div v-for="r in 30" :key="r" class="text-sm py-0.5">Row {{ r }}</div>
        </div>
      </ScrollArea>
    `,
	}),
	play: async ({ canvasElement }) => {
		const bars = canvasElement.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
		await expect(bars.length).toBeGreaterThanOrEqual(1);
		const thumb = canvasElement.querySelector('[data-slot="scroll-area-thumb"]');
		await expect(thumb).not.toBeNull();
	},
};

export const InteractiveOrientationBoth: Story = {
	tags: ['!autodocs', 'test'],
	args: { orientation: 'both' },
	render: () => ({
		components: { ScrollArea },
		template: `
      <ScrollArea orientation="both" type="always" class="h-48 w-48 rounded-md border border-border">
        <div class="p-3 w-[400px]">
          <div v-for="r in 30" :key="r" class="text-sm py-0.5">Row {{ r }} — wide content overflowing the viewport horizontally too</div>
        </div>
      </ScrollArea>
    `,
	}),
	play: async ({ canvasElement }) => {
		const bars = canvasElement.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
		// Both vertical and horizontal scrollbar elements should exist
		await expect(bars.length).toBe(2);
	},
};

export const InteractiveHiddenScrollbar: Story = {
	tags: ['!autodocs', 'test'],
	args: { showScrollbar: false },
	play: async ({ canvasElement }) => {
		const bars = canvasElement.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
		await expect(bars.length).toBe(0);
		const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
		// Scrolling still works
		viewport!.scrollTop = 50;
		await expect(viewport!.scrollTop).toBe(50);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'ScrollArea respects its parent width and contains its content at every viewport.',
			},
		},
	},
	render: () => ({
		components: { ScrollArea },
		template: `
      <div data-test-root class="w-full p-2">
        <ScrollArea class="h-48 w-full rounded-md border border-border">
          <div class="p-3">
            <div v-for="r in 30" :key="r" class="text-sm py-0.5">Row {{ r }}</div>
          </div>
        </ScrollArea>
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
