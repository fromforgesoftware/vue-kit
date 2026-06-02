import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import Pagination from './Pagination.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'General/Pagination',
	component: Pagination,
	tags: ['!autodocs'],
	argTypes: {
		page: { control: 'number', description: 'Controlled current page (1-based).' },
		defaultPage: { control: 'number', description: 'Initial page when uncontrolled.' },
		total: { control: 'number', description: 'Total number of items in the dataset.' },
		itemsPerPage: { control: 'number', description: 'Number of items per page.' },
		siblingCount: {
			control: 'number',
			description: 'Number of page buttons either side of current.',
		},
		showEdges: { control: 'boolean', description: 'Show First/Last edge buttons.' },
		disabled: { control: 'boolean', description: 'Disable the entire control.' },
		'onUpdate:page': { action: 'update:page' },
	},
	args: {
		defaultPage: 1,
		total: 100,
		itemsPerPage: 10,
		siblingCount: 1,
		showEdges: true,
		disabled: false,
		'onUpdate:page': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Page-N navigation control. Built on Reka primitives — handles ellipsis, sibling counts, and edge buttons. Emits `update:page` for v-model.',
			},
		},
	},
	render: (args) => ({
		components: { Pagination },
		setup: () => ({ args }),
		template: `
      <Pagination
        v-bind="args"
        @update:page="args['onUpdate:page']"
      />
    `,
	}),
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const ManyPages: Story = {
	args: { total: 1000 },
	parameters: {
		docs: {
			description: { story: 'Large datasets show ellipsis between sibling and edge groups.' },
		},
	},
};

export const NoEdges: Story = {
	args: { showEdges: false },
	parameters: {
		docs: {
			description: {
				story: 'Drop the First/Last buttons when navigation through edges is uncommon.',
			},
		},
	},
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Bound: Story = {
	parameters: {
		docs: {
			description: { story: 'Two-way bound with `v-model:page` to demonstrate controlled state.' },
		},
	},
	render: () => ({
		components: { Pagination },
		setup() {
			const page = ref(3);
			return { page };
		},
		template: `
      <div class="flex flex-col items-center gap-2">
        <p class="text-sm text-muted-foreground">Current page: {{ page }}</p>
        <Pagination v-model:page="page" :total="200" :items-per-page="10" />
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveCurrentAriaCurrent: Story = {
	tags: ['!autodocs', 'test'],
	args: { defaultPage: 3 },
	play: async ({ canvasElement }) => {
		const current = canvasElement.querySelector('[aria-current="page"]') as HTMLElement;
		await expect(current).not.toBeNull();
		// On desktop the active page button shows the value; on mobile the span shows it.
		await expect(current.textContent?.trim()).toBe('3');
	},
};

export const InteractivePageClickEmits: Story = {
	tags: ['!autodocs', 'test'],
	// Page-N buttons are hidden below `sm:` (640 px). Force tablet so the
	// numbered buttons are visible for this assertion.
	globals: { viewport: { value: 'tablet' } },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const page2 = canvas.getByRole('button', { name: 'Page 2' });
		await userEvent.click(page2);
		await expect(args['onUpdate:page']).toHaveBeenCalledWith(2);
	},
};

export const InteractiveNextPrevEmits: Story = {
	tags: ['!autodocs', 'test'],
	args: { defaultPage: 5 },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const next = canvas.getByRole('button', { name: 'Next page' });
		await userEvent.click(next);
		await expect(args['onUpdate:page']).toHaveBeenCalledWith(6);
		const prev = canvas.getByRole('button', { name: 'Previous page' });
		await userEvent.click(prev);
		await expect(args['onUpdate:page']).toHaveBeenCalled();
	},
};

export const InteractiveDisabledBlocks: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const next = canvas.getByRole('button', { name: 'Next page' });
		// Disabled buttons reject userEvent.click (pointer-events: none).
		// Native dispatch is the equivalent of pressing a disabled control.
		next.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect(args['onUpdate:page']).not.toHaveBeenCalled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Every interactive control meets WCAG SC 2.5.8 (≥ 24×24 px).' } },
	},
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLElement>('button');
		for (const btn of buttons) {
			// Skip elements hidden on this viewport (display:none) — they have 0×0 rects.
			const r = btn.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) continue;
			expectMinTargetSize(btn, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Adapts across viewports. On `<sm` only the prev/next buttons + current page text remain.',
			},
		},
	},
	args: { total: 1000 },
	render: (args) => ({
		components: { Pagination },
		setup: () => ({ args }),
		template: `
      <div data-test-root style="max-width: 100%;">
        <Pagination v-bind="args" @update:page="args['onUpdate:page']" />
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
