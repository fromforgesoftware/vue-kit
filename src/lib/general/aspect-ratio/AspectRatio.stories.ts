import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import AspectRatio from './AspectRatio.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const meta = {
	title: 'General/AspectRatio',
	component: AspectRatio,
	tags: ['!autodocs'],
	argTypes: {
		ratio: { control: 'number', description: 'Width ÷ height. e.g. 16/9 = 1.777' },
	},
	args: {
		ratio: 16 / 9,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Locks a child element to a fixed aspect ratio regardless of width — useful for media (images, embeds, video), card thumbnails, and chart placeholders.',
			},
		},
	},
	render: (args) => ({
		components: { AspectRatio },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-[450px]">
        <AspectRatio v-bind="args">
          <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">
            {{ Math.round(args.ratio * 1000) / 1000 }}
          </div>
        </AspectRatio>
      </div>
    `,
	}),
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const CommonRatios: Story = {
	parameters: {
		docs: { description: { story: 'The most-used ratios across the app.' } },
	},
	render: () => ({
		components: { AspectRatio },
		template: `
      <div class="grid grid-cols-1 gap-4 max-w-md sm:grid-cols-2">
        <div>
          <p class="mb-1 text-xs text-muted-foreground">1:1 — square</p>
          <AspectRatio :ratio="1">
            <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">1:1</div>
          </AspectRatio>
        </div>
        <div>
          <p class="mb-1 text-xs text-muted-foreground">4:3 — classic</p>
          <AspectRatio :ratio="4/3">
            <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">4:3</div>
          </AspectRatio>
        </div>
        <div>
          <p class="mb-1 text-xs text-muted-foreground">16:9 — widescreen</p>
          <AspectRatio :ratio="16/9">
            <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">16:9</div>
          </AspectRatio>
        </div>
        <div>
          <p class="mb-1 text-xs text-muted-foreground">21:9 — cinema</p>
          <AspectRatio :ratio="21/9">
            <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">21:9</div>
          </AspectRatio>
        </div>
      </div>
    `,
	}),
};

export const WithImage: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Use AspectRatio to keep images at a fixed shape across responsive widths.',
			},
		},
	},
	render: () => ({
		components: { AspectRatio },
		template: `
      <div class="w-full max-w-[450px]">
        <AspectRatio :ratio="16/9">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&h=450&fit=crop"
            alt="Photograph of a forest at sunrise"
            class="h-full w-full rounded-md object-cover"
          />
        </AspectRatio>
      </div>
    `,
	}),
};

export const Portrait: Story = {
	parameters: {
		docs: { description: { story: 'Ratios less than 1 produce portrait shapes.' } },
	},
	render: () => ({
		components: { AspectRatio },
		template: `
      <div class="w-[200px]">
        <AspectRatio :ratio="3/4">
          <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">3:4</div>
        </AspectRatio>
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="aspect-ratio"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
	},
};

export const InteractiveMaintainsRatio: Story = {
	tags: ['!autodocs', 'test'],
	args: { ratio: 16 / 9 },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="aspect-ratio"]') as HTMLElement;
		const rect = root.getBoundingClientRect();
		// Reka renders padding-bottom; height should equal width / ratio (within 1 px).
		const expectedHeight = rect.width / (16 / 9);
		await expect(Math.abs(rect.height - expectedHeight)).toBeLessThan(2);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { AspectRatio },
		template: `
      <div data-test-root class="p-2">
        <AspectRatio :ratio="16/9">
          <div class="flex h-full w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">16:9</div>
        </AspectRatio>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const ar = root.querySelector('[data-slot="aspect-ratio"]') as HTMLElement;
			const rect = ar.getBoundingClientRect();
			// Verify ratio holds at every viewport.
			const expectedHeight = rect.width / (16 / 9);
			await expect(Math.abs(rect.height - expectedHeight)).toBeLessThan(2);
		});
	},
};
