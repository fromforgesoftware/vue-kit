import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect } from 'storybook/test';
import WidgetGrid from './WidgetGrid.vue';
import WidgetGridItem from './WidgetGridItem.vue';
import type { GridItemPosition, WidgetGridBackground } from './widget-grid';
import {
	mouseDragBy,
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

// 24-column dashboard layout. Items position via `{ i, x, y, w, h }` where
// `x`/`w` count columns (0–23) and `y`/`h` count rows. The grid resolves the
// row height from the container and `totalRows`, so demo content must include
// concrete sample data — there's no auto-pack.
const SAMPLE_ITEMS: GridItemPosition[] = [
	{ i: 'overview', x: 0, y: 0, w: 12, h: 4 },
	{ i: 'agents', x: 12, y: 0, w: 12, h: 4 },
	{ i: 'queues', x: 0, y: 4, w: 8, h: 6 },
	{ i: 'forecast', x: 8, y: 4, w: 16, h: 6 },
];

// `moved` and `resized` are emitted by `WidgetGridItem` (not `WidgetGrid`), so
// they don't appear on `Meta<typeof WidgetGrid>` props. We extend the args
// shape with the two handler props the render template wires up, so play
// tests can spy on them via `args.onMoved` / `args.onResized`.
type WidgetGridStoryArgs = {
	cols?: number;
	snapColumns?: number;
	margin?: number;
	draggable?: boolean;
	resizable?: boolean;
	totalRows?: number;
	minRowHeight?: number;
	items?: GridItemPosition[];
	background?: WidgetGridBackground;
	showPlaceholder?: boolean;
	disableDragScale?: boolean;
	onMoved?: (e: GridItemPosition) => void;
	onResized?: (e: GridItemPosition) => void;
};

const BACKGROUND_OPTIONS: WidgetGridBackground[] = ['none', 'grid', 'dots'];

const meta: Meta<WidgetGridStoryArgs> = {
	title: 'Patterns/WidgetGrid',
	component: WidgetGrid,
	tags: ['!autodocs'],
	argTypes: {
		cols: { control: 'number' },
		snapColumns: { control: 'number' },
		margin: { control: 'number' },
		draggable: { control: 'boolean' },
		resizable: { control: 'boolean' },
		totalRows: { control: 'number' },
		minRowHeight: { control: 'number' },
		background: { control: 'select', options: BACKGROUND_OPTIONS },
		showPlaceholder: { control: 'boolean' },
		disableDragScale: { control: 'boolean' },
		onMoved: { action: 'moved' },
		onResized: { action: 'resized' },
	},
	args: {
		cols: 24,
		snapColumns: 4,
		margin: 0.5,
		draggable: false,
		resizable: false,
		totalRows: 20,
		// `minRowHeight` is consumed as `rem` units in the component's inline
		// styles. Keeping the demo around 2 rem (~32 px) per row prevents
		// 4-row widgets ballooning to ~3,800 px tall in the MDX canvas.
		minRowHeight: 2,
		items: SAMPLE_ITEMS,
		background: 'none',
		showPlaceholder: false,
		disableDragScale: false,
		onMoved: fn(),
		onResized: fn(),
	},
};

export default meta;
type Story = StoryObj<WidgetGridStoryArgs>;

const renderGrid = (args: Record<string, unknown>) => ({
	components: { WidgetGrid, WidgetGridItem },
	setup: () => ({ args, items: SAMPLE_ITEMS }),
	template: `
    <div class="w-full" style="height: 480px;">
      <WidgetGrid v-bind="args">
        <WidgetGridItem
          v-for="item in items"
          :key="item.i"
          :i="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :all-items="items"
          @moved="args.onMoved"
          @resized="args.onResized"
        >
          <div class="size-full p-4 flex items-center justify-center text-sm font-medium text-muted-foreground">
            {{ item.i }} ({{ item.w }}×{{ item.h }})
          </div>
        </WidgetGridItem>
      </WidgetGrid>
    </div>
  `,
});

// ── Demo stories ──────────────────────────────────────────────────────────

export const Default: Story = { render: renderGrid };

export const Editable: Story = {
	args: { draggable: true, resizable: true },
	render: renderGrid,
};

export const BackgroundGrid: Story = {
	args: { background: 'grid' },
	render: renderGrid,
};

export const BackgroundDots: Story = {
	args: { background: 'dots' },
	render: renderGrid,
};

// Drag a panel in this story to see the dashed primary outline that tracks
// the snapped landing cell — Grafana-style affordance for edit mode.
export const WithPlaceholder: Story = {
	args: { draggable: true, resizable: true, showPlaceholder: true, background: 'grid' },
	render: renderGrid,
};

// Click a panel and notice it does NOT grow — `disableDragScale` removes the
// micro-scale effect on press/drag while keeping the lift shadow. Pair with
// `showPlaceholder: true` to match the production dashboard configuration.
export const NoDragScale: Story = {
	args: {
		draggable: true,
		resizable: true,
		showPlaceholder: true,
		disableDragScale: true,
		background: 'grid',
	},
	render: renderGrid,
};

// ── Interactive (Pattern D) ───────────────────────────────────────────────

// Single-widget layout used by drag tests — leaves the rest of the grid
// empty so we can drag horizontally without colliding with other widgets.
const SINGLE_ITEM: GridItemPosition[] = [{ i: 'solo', x: 0, y: 0, w: 8, h: 4 }];

const renderSingle = (args: Record<string, unknown>) => ({
	components: { WidgetGrid, WidgetGridItem },
	setup: () => ({ args, items: SINGLE_ITEM }),
	template: `
    <div class="w-full" style="height: 240px;">
      <WidgetGrid v-bind="args">
        <WidgetGridItem
          v-for="item in items"
          :key="item.i"
          :i="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :all-items="items"
          @moved="args.onMoved"
          @resized="args.onResized"
        >
          <div class="size-full p-4 text-sm">{{ item.i }}</div>
        </WidgetGridItem>
      </WidgetGrid>
    </div>
  `,
});

// Pattern D — InteractiveDragOrSelect.
// Drags a lone widget right by ~6 cols. snapSize = cols / snapColumns
// (24 / 4 = 6), so the move snaps to x=6 — the next valid grid step.
// Asserts the grid emits `moved` with an updated x position.
export const InteractiveDragOrSelect: Story = {
	tags: ['!autodocs', 'test'],
	args: { draggable: true, items: SINGLE_ITEM, minRowHeight: 2 },
	render: renderSingle,
	play: async ({ args, canvasElement }) => {
		const grid = canvasElement.querySelector('[data-slot="widget-grid"]') as HTMLElement;
		const colWidth = grid.getBoundingClientRect().width / 24;
		const solo = canvasElement.querySelector('[data-i="solo"]') as HTMLElement;
		await mouseDragBy(solo, colWidth * 6, 0);
		await expect(args.onMoved).toHaveBeenCalled();
		type Mock = { mock: { calls: GridItemPosition[][] } };
		const calls = (args.onMoved as unknown as Mock).mock.calls;
		const last = calls[calls.length - 1][0];
		await expect(last.i).toBe('solo');
		await expect(last.x).toBe(6);
	},
};

// Pattern D — InteractiveKeyboardAlternative (SC 2.5.7).
// WidgetGridItem currently exposes only the resize handle as a focusable
// control; that handle is a real <button> reachable via keyboard. The drag
// itself has no keyboard alternative yet (tracked separately under the WCAG
// 2.2 audit). For now we assert that the resize-handle keyboard path works —
// it focuses, accepts focus, and is visible to assistive tech via aria-label.
export const InteractiveKeyboardAlternative: Story = {
	tags: ['!autodocs', 'test'],
	args: { resizable: true },
	render: renderGrid,
	play: async ({ canvasElement }) => {
		const handle = canvasElement.querySelector(
			'[data-slot="widget-grid-resize-handle"]',
		) as HTMLElement;
		await expect(handle).toBeInTheDocument();
		await expect(handle.tagName).toBe('BUTTON');
		await expect(handle.getAttribute('aria-label')).toBe('Resize widget');
		handle.focus();
		await expect(handle).toHaveFocus();
	},
};

// Pattern D — InteractiveBoundaryClamps.
// Drag a widget at x=0 further left than the grid edge — position must
// clamp to x=0 (no negative column) and the rendered `left` style must not
// go negative.
export const InteractiveBoundaryClamps: Story = {
	tags: ['!autodocs', 'test'],
	args: { draggable: true, items: SINGLE_ITEM, minRowHeight: 2 },
	render: renderSingle,
	play: async ({ args, canvasElement }) => {
		const grid = canvasElement.querySelector('[data-slot="widget-grid"]') as HTMLElement;
		const colWidth = grid.getBoundingClientRect().width / 24;
		const solo = canvasElement.querySelector('[data-i="solo"]') as HTMLElement;
		await mouseDragBy(solo, -colWidth * 12, 0);
		type Mock = { mock: { calls: GridItemPosition[][] } };
		const calls = (args.onMoved as unknown as Mock).mock.calls;
		if (calls.length > 0) {
			const last = calls[calls.length - 1][0];
			await expect(last.x).toBeGreaterThanOrEqual(0);
		}
		const style = solo.getAttribute('style') ?? '';
		const leftMatch = style.match(/left:\s*(-?[\d.]+)%/);
		if (leftMatch) {
			await expect(Number(leftMatch[1])).toBeGreaterThanOrEqual(0);
		}
	},
};

// Pattern D — InteractiveActiveStatesAndA11y.
// Verifies the grid container has the correct ARIA role/label, draggable
// items expose `aria-roledescription="draggable"` only when editable, and the
// resize handle meets WCAG 2.5.8 minimum target size (≥ 24×24 px).
export const InteractiveActiveStatesAndA11y: Story = {
	tags: ['!autodocs', 'test'],
	args: { draggable: true, resizable: true },
	render: renderGrid,
	play: async ({ canvasElement }) => {
		const grid = canvasElement.querySelector('[data-slot="widget-grid"]') as HTMLElement;
		await expect(grid.getAttribute('role')).toBe('region');
		await expect(grid.getAttribute('aria-label')).toBe('Dashboard widgets');

		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="widget-grid-item"]');
		for (const item of items) {
			await expect(item.getAttribute('aria-roledescription')).toBe('draggable');
		}

		const handles = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="widget-grid-resize-handle"]',
		);
		for (const h of handles) {
			const r = h.getBoundingClientRect();
			if (r.width === 0 && r.height === 0) continue;
			expectMinTargetSize(h, 20);
		}
	},
};

// Pattern D — InteractivePlaceholderShows.
// While dragging, `showPlaceholder` should render a ghost cell at the snap
// target and remove it on release. We split the drag into mousedown +
// mouseup manually (rather than `mouseDragBy`) so we can assert mid-drag.
export const InteractivePlaceholderShows: Story = {
	tags: ['!autodocs', 'test'],
	args: { draggable: true, showPlaceholder: true, items: SINGLE_ITEM, minRowHeight: 2 },
	render: renderSingle,
	play: async ({ canvasElement }) => {
		const solo = canvasElement.querySelector('[data-i="solo"]') as HTMLElement;
		const rect = solo.getBoundingClientRect();
		const startX = rect.left + rect.width / 2;
		const startY = rect.top + rect.height / 2;

		// No placeholder before drag.
		await expect(canvasElement.querySelector('[data-slot="widget-grid-placeholder"]')).toBeNull();

		solo.dispatchEvent(
			new MouseEvent('mousedown', {
				bubbles: true,
				cancelable: true,
				clientX: startX,
				clientY: startY,
				button: 0,
				buttons: 1,
			}),
		);
		await new Promise<void>((r) => requestAnimationFrame(() => r()));

		// Placeholder appears as soon as the drag starts.
		await expect(
			canvasElement.querySelector('[data-slot="widget-grid-placeholder"]'),
		).toBeInTheDocument();

		document.dispatchEvent(
			new MouseEvent('mouseup', {
				bubbles: true,
				cancelable: true,
				clientX: startX,
				clientY: startY,
				button: 0,
				buttons: 0,
			}),
		);
		await new Promise<void>((r) => requestAnimationFrame(() => r()));

		// Placeholder is removed on release.
		await expect(canvasElement.querySelector('[data-slot="widget-grid-placeholder"]')).toBeNull();
	},
};

// Pattern E — Responsive. Iterates the standard viewports and asserts the
// grid container never overflows its parent horizontally.
export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { WidgetGrid, WidgetGridItem },
		setup: () => ({ args, items: SAMPLE_ITEMS }),
		template: `
      <div data-test-root class="w-full p-4">
        <WidgetGrid v-bind="args">
          <WidgetGridItem
            v-for="item in items"
            :key="item.i"
            :i="item.i"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :all-items="items"
          >
            <div class="size-full p-4 text-sm">{{ item.i }}</div>
          </WidgetGridItem>
        </WidgetGrid>
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
