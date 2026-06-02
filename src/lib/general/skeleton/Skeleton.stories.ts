import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Skeleton from './Skeleton.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_VARIANTS = ['default', 'circle', 'text'] as const;
const ALL_ANIMATIONS = ['pulse', 'shimmer', 'solid'] as const;

const meta = {
	title: 'General/Skeleton',
	component: Skeleton,
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Shape: rounded rect, circle, or text line.',
		},
		animate: { control: 'select', options: ALL_ANIMATIONS, description: 'Animation style.' },
	},
	args: {
		variant: 'default',
		animate: 'pulse',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Loading placeholder primitive. Compose multiple Skeletons to build the shape of the content the user is waiting for.',
			},
		},
	},
	render: (args) => ({
		components: { Skeleton },
		setup: () => ({ args }),
		template: `<Skeleton v-bind="args" class="h-12 w-48" />`,
	}),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`default` for arbitrary blocks; `circle` for avatars; `text` for inline text lines (fixed `h-4`).',
			},
		},
	},
	render: () => ({
		components: { Skeleton },
		template: `
      <div class="flex flex-col gap-4">
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">default</span>
          <Skeleton class="h-12 w-48" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">circle</span>
          <Skeleton variant="circle" class="size-12" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">text</span>
          <Skeleton variant="text" class="w-48" />
        </div>
      </div>
    `,
	}),
};

export const Animations: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three animation styles. `solid` is the static fallback for `prefers-reduced-motion`.',
			},
		},
	},
	render: () => ({
		components: { Skeleton },
		template: `
      <div class="flex flex-col gap-4">
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">pulse (default)</span>
          <Skeleton animate="pulse" class="h-12 w-48" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">shimmer</span>
          <Skeleton animate="shimmer" class="h-12 w-48" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">solid</span>
          <Skeleton animate="solid" class="h-12 w-48" />
        </div>
      </div>
    `,
	}),
};

export const CardSkeleton: Story = {
	parameters: {
		docs: { description: { story: 'Composing primitives into a card-shaped skeleton.' } },
	},
	render: () => ({
		components: { Skeleton },
		template: `
      <div class="rounded-lg border p-4 w-80">
        <div class="flex items-center gap-4">
          <Skeleton variant="circle" class="size-10" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3 w-24" />
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <Skeleton variant="text" class="w-full" />
          <Skeleton variant="text" class="w-full" />
          <Skeleton variant="text" class="w-3/4" />
        </div>
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Skeleton },
		template: `<Skeleton class="h-12 w-48" />`,
	}),
	play: async ({ canvasElement }) => {
		const block = canvasElement.querySelector('[data-slot="skeleton"]') as HTMLElement;
		await expect(block).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Skeleton },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="flex flex-wrap gap-2 p-2">
        <Skeleton v-for="v in ALL_VARIANTS" :key="v" :variant="v" class="h-10 w-32" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const blocks = root.querySelectorAll('[data-slot="skeleton"]');
			await expect(blocks.length).toBe(3);
		});
	},
};
