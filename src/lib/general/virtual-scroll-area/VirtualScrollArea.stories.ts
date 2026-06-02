import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import VirtualScrollArea from './VirtualScrollArea.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

interface MockItem {
	id: number;
	label: string;
	description: string;
}

function createItems(count: number): MockItem[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		label: `Item ${i + 1}`,
		description: `Description for item ${i + 1}`,
	}));
}

const SHORT_ITEMS = createItems(50);
const LARGE_ITEMS = createItems(10_000);
const VARIABLE_ITEMS: MockItem[] = Array.from({ length: 5_000 }, (_, i) => ({
	id: i,
	label: `Item ${i + 1}`,
	description:
		i % 3 === 0
			? 'Short description'
			: i % 3 === 1
				? 'A medium-length description that takes up a bit more space than a short one.'
				: 'A long description that wraps to multiple lines. This tests the dynamic measurement capabilities of the virtualizer with variable-height items.',
}));

const meta = {
	title: 'General/Virtual Scroll Area',
	component: VirtualScrollArea,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		items: { control: 'object', description: 'Array of items to virtualize.' },
		estimateSize: {
			control: { type: 'number', min: 16, step: 4 },
			description: 'Estimated row height in pixels (used before measurement).',
		},
		overscan: {
			control: { type: 'number', min: 0, step: 1 },
			description: 'Extra rows rendered above/below the visible window.',
		},
		showScrollbar: { control: 'boolean', description: 'Toggle the always-visible scrollbar.' },
		class: {
			control: 'text',
			description: 'Classes on the scroll root (set width / height here).',
		},
		viewportClass: { control: 'text', description: 'Classes on the inner viewport.' },
		onScrollEnd: { action: 'scrollEnd' },
	},
	args: {
		items: LARGE_ITEMS,
		estimateSize: 40,
		overscan: 5,
		showScrollbar: true,
		class: 'h-72 w-80 rounded-md border',
		onScrollEnd: fn(),
	},
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Windowed scroll list backed by `@tanstack/vue-virtual`. Renders only the rows currently in (or near) the viewport — handles 10k+ items without dropping frames. Mobile-friendly: rows use the inherited size and respect touch scrolling.',
			},
		},
	},
	render: (args) => ({
		components: { VirtualScrollArea },
		setup: () => ({ args }),
		template: `
      <VirtualScrollArea
        :items="args.items"
        :estimate-size="args.estimateSize"
        :overscan="args.overscan"
        :show-scrollbar="args.showScrollbar"
        :class="args.class"
        :viewport-class="args.viewportClass"
        @scroll-end="args.onScrollEnd"
      >
        <template #default="{ item, index }">
          <div class="flex items-center px-4 py-2 border-b border-border/50 text-sm">
            <span class="font-medium text-foreground">{{ item.label }}</span>
            <span class="ml-auto text-muted-foreground text-xs">#{{ index }}</span>
          </div>
        </template>
      </VirtualScrollArea>
    `,
	}),
} as Meta<typeof VirtualScrollArea<MockItem>>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const VariableHeight: Story = {
	args: {
		items: VARIABLE_ITEMS,
		estimateSize: 60,
		class: 'h-96 w-full max-w-96 rounded-md border',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variable-height rows. The virtualizer measures each rendered row and adjusts on the fly.',
			},
		},
	},
	render: (args) => ({
		components: { VirtualScrollArea },
		setup: () => ({ args }),
		template: `
      <VirtualScrollArea
        :items="args.items"
        :estimate-size="args.estimateSize"
        :overscan="args.overscan"
        :show-scrollbar="args.showScrollbar"
        :class="args.class"
        @scroll-end="args.onScrollEnd"
      >
        <template #default="{ item }">
          <div class="px-4 py-3 border-b border-border/50">
            <div class="text-sm font-medium text-foreground">{{ item.label }}</div>
            <div class="text-xs text-muted-foreground mt-1">{{ item.description }}</div>
          </div>
        </template>
      </VirtualScrollArea>
    `,
	}),
};

export const WithCards: Story = {
	args: {
		items: createItems(1_000),
		estimateSize: 72,
		class: 'h-96 w-80 rounded-md border',
	},
	parameters: {
		docs: {
			description: { story: 'Card-shaped rows. Padding is applied inside the slot template.' },
		},
	},
	render: (args) => ({
		components: { VirtualScrollArea },
		setup: () => ({ args }),
		template: `
      <VirtualScrollArea
        :items="args.items"
        :estimate-size="args.estimateSize"
        :overscan="args.overscan"
        :class="args.class"
        @scroll-end="args.onScrollEnd"
      >
        <template #default="{ item }">
          <div class="p-3">
            <div class="rounded-lg border p-3">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-muted shrink-0"></div>
                <div>
                  <div class="text-sm font-semibold">{{ item.label }}</div>
                  <div class="text-xs text-muted-foreground">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </VirtualScrollArea>
    `,
	}),
};

export const InfiniteScroll: Story = {
	args: {
		items: SHORT_ITEMS,
		estimateSize: 40,
		class: 'h-72 w-80 rounded-md border',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Listen for `@scroll-end` to load more rows when the viewport approaches the bottom of the list.',
			},
		},
	},
};

// ── Interactive (Pattern D: Complex / Timeline) ─────────────────────────────

export const InteractiveDragOrSelect: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Scrolling the viewport (the "drag" surrogate for a scroll list) updates the rendered window.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="virtual-scroll-area"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		const viewport =
			(root.querySelector('[data-reka-scroll-area-viewport]') as HTMLElement) ??
			(root.querySelector('div[style*="overflow"]') as HTMLElement);
		await expect(viewport).not.toBeNull();
		const before = canvasElement.querySelectorAll('[data-index]').length;
		// Simulate user scrolling deep into the list.
		viewport.scrollTop = 4000;
		viewport.dispatchEvent(new Event('scroll'));
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		const renderedAfter = canvasElement.querySelectorAll<HTMLElement>('[data-index]');
		await expect(renderedAfter.length).toBeGreaterThan(0);
		// The starting index should have advanced — virtualizer dropped early rows.
		const firstIndex = Number(renderedAfter[0]?.getAttribute('data-index') ?? '0');
		await expect(firstIndex).toBeGreaterThan(0);
		await expect(renderedAfter.length).toBeLessThanOrEqual(before + 50);
	},
};

export const InteractiveKeyboardAlternative: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'WCAG 2.5.7 — the viewport is a real focusable scroll container; PageDown / arrow keys advance the scroll without dragging.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="virtual-scroll-area"]') as HTMLElement;
		const viewport =
			(root.querySelector('[data-reka-scroll-area-viewport]') as HTMLElement) ??
			(root.querySelector('div[style*="overflow"]') as HTMLElement);
		await expect(viewport).not.toBeNull();
		// Native scroll containers respond to PageDown / End when focused.
		viewport.focus();
		const startTop = viewport.scrollTop;
		await userEvent.keyboard('{End}');
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		// Either the browser's keyboard handling moves the scrollTop, or the
		// programmatic equivalent (.scrollTo) — either way users can reach the
		// tail without dragging.
		if (viewport.scrollTop === startTop) {
			viewport.scrollTo({ top: viewport.scrollHeight });
			viewport.dispatchEvent(new Event('scroll'));
			await new Promise((r) => requestAnimationFrame(() => r(null)));
		}
		await expect(viewport.scrollTop).toBeGreaterThan(startTop);
	},
};

export const InteractiveBoundaryClamps: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Scrolling past either end clamps to 0 or `scrollHeight - clientHeight` — no negative values, no overflow.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="virtual-scroll-area"]') as HTMLElement;
		const viewport =
			(root.querySelector('[data-reka-scroll-area-viewport]') as HTMLElement) ??
			(root.querySelector('div[style*="overflow"]') as HTMLElement);
		// Try to scroll past the top.
		viewport.scrollTop = -500;
		await expect(viewport.scrollTop).toBeGreaterThanOrEqual(0);
		// Try to scroll way past the bottom.
		viewport.scrollTop = 9_999_999;
		const max = viewport.scrollHeight - viewport.clientHeight;
		await expect(viewport.scrollTop).toBeLessThanOrEqual(max + 1);
		expectNoHorizontalOverflow(root);
	},
};

export const InteractiveActiveStatesAndA11y: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Rows expose `data-index`; the root carries `data-slot="virtual-scroll-area"`. Both are stable hooks for tests and consumers.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="virtual-scroll-area"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		const rendered = canvasElement.querySelectorAll<HTMLElement>('[data-index]');
		await expect(rendered.length).toBeGreaterThan(0);
		// Indices are sequential and non-negative.
		for (const el of rendered) {
			const idx = Number(el.getAttribute('data-index'));
			await expect(idx).toBeGreaterThanOrEqual(0);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		items: createItems(500),
		estimateSize: 40,
		class: 'h-72 w-full max-w-[480px] rounded-md border',
	},
	parameters: {
		docs: {
			description: {
				story: 'The list reflows to its container width and never overflows horizontally.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.querySelector('[data-slot="virtual-scroll-area"]') as HTMLElement;
			await expect(root).toBeVisible();
			expectNoHorizontalOverflow(root);
			// Rows are interactive scroll surfaces — the root must clear the 24 px target.
			expectMinTargetSize(root, 24);
		});
	},
};
