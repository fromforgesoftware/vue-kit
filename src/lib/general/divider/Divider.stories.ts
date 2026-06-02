import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Divider from './Divider.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_VARIANTS = ['solid', 'dashed', 'dotted'] as const;
const ALL_TONES = ['default', 'muted', 'strong'] as const;
const ALL_INSETS = ['none', 'sm', 'default', 'lg'] as const;

const meta = {
	title: 'General/Divider',
	component: Divider,
	tags: ['!autodocs'],
	argTypes: {
		orientation: { control: 'select', options: ['horizontal', 'vertical'] },
		variant: { control: 'select', options: ALL_VARIANTS, description: 'Border style.' },
		tone: { control: 'select', options: ALL_TONES, description: 'Visual weight.' },
		inset: { control: 'select', options: ALL_INSETS, description: 'Margin around the divider.' },
		label: {
			control: 'text',
			description: 'Optional inline label rendered between two line segments (horizontal only).',
		},
		decorative: { control: 'boolean' },
	},
	args: {
		orientation: 'horizontal',
		variant: 'solid',
		tone: 'default',
		inset: 'none',
		decorative: true,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Thin rule used to separate sections within a layout, list, or card. Decorative by default; pass `decorative={false}` to expose a `role="separator"` to assistive tech.',
			},
		},
	},
	render: (args) => ({
		components: { Divider },
		setup: () => ({ args }),
		template: `<div class="w-full max-w-96"><Divider v-bind="args" /></div>`,
	}),
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three border styles. `dashed` and `dotted` for soft section breaks; `solid` for the default rule.',
			},
		},
	},
	render: () => ({
		components: { Divider },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-3 w-full max-w-96">
        <div v-for="v in ALL_VARIANTS" :key="v">
          <p class="text-xs text-muted-foreground mb-1">{{ v }}</p>
          <Divider :variant="v" />
        </div>
      </div>
    `,
	}),
};

export const Tones: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`default` for general use; `muted` for in-card section breaks; `strong` for layout-level dividers.',
			},
		},
	},
	render: () => ({
		components: { Divider },
		setup: () => ({ ALL_TONES }),
		template: `
      <div class="flex flex-col gap-3 w-full max-w-96">
        <div v-for="t in ALL_TONES" :key="t">
          <p class="text-xs text-muted-foreground mb-1">{{ t }}</p>
          <Divider :tone="t" />
        </div>
      </div>
    `,
	}),
};

export const Inset: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`inset` controls the spacing around the divider. Skip <code>my-N</code> classes — use this prop instead.',
			},
		},
	},
	render: () => ({
		components: { Divider },
		setup: () => ({ ALL_INSETS }),
		template: `
      <div class="w-full max-w-96">
        <p class="text-sm">Top content</p>
        <template v-for="i in ALL_INSETS" :key="i">
          <Divider :inset="i" />
          <p class="text-xs text-muted-foreground">inset: {{ i }}</p>
        </template>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	args: { label: 'OR' },
	parameters: {
		docs: {
			description: {
				story:
					'Pass `label` (or use the `label` slot) to render text between two line segments. Useful as a divider in auth flows.',
			},
		},
	},
	render: (args) => ({
		components: { Divider },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-96">
        <Divider v-bind="args" inset="default" />
      </div>
    `,
	}),
};

export const Vertical: Story = {
	args: { orientation: 'vertical' },
	parameters: {
		docs: {
			description: {
				story:
					'Vertical dividers stretch to fill their flex/grid parent. Use with `inset` to add horizontal margin.',
			},
		},
	},
	render: () => ({
		components: { Divider },
		template: `
      <div class="flex items-center gap-0 h-12">
        <span class="px-3 text-sm">Left</span>
        <Divider orientation="vertical" />
        <span class="px-3 text-sm">Middle</span>
        <Divider orientation="vertical" inset="sm" variant="dashed" />
        <span class="px-3 text-sm">Right</span>
      </div>
    `,
	}),
};

export const InList: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Used to separate rows in a list or stack. Prefer <code>inset="default"</code> for consistent vertical rhythm.',
			},
		},
	},
	render: () => ({
		components: { Divider },
		template: `
      <ul class="w-full max-w-96">
        <li class="py-2 text-sm">First item</li>
        <!--
          A <ul>/<ol> must only directly contain <li> children (axe rule: list).
          We wrap each Divider in a plain <li> so the list semantics stay
          intact while keeping the visual separator.
        -->
        <li><Divider /></li>
        <li class="py-2 text-sm">Second item</li>
        <li><Divider /></li>
        <li class="py-2 text-sm">Third item</li>
      </ul>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const el = canvasElement.querySelector('[data-slot="divider"]') as HTMLElement;
		await expect(el).toBeInTheDocument();
	},
};

export const InteractiveLabelStructure: Story = {
	tags: ['!autodocs', 'test'],
	args: { label: 'OR', inset: 'default' },
	render: (args) => ({
		components: { Divider },
		setup: () => ({ args }),
		template: `<div class="w-full max-w-96"><Divider v-bind="args" /></div>`,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="divider"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await expect(root).toHaveAttribute('role', 'separator');
		await expect(root).toHaveAttribute('aria-orientation', 'horizontal');
		const lines = root.querySelectorAll('[data-slot="divider-line"]');
		await expect(lines.length).toBe(2);
		const label = root.querySelector('[data-slot="divider-label"]') as HTMLElement;
		await expect(label.textContent?.trim()).toBe('OR');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Divider },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="p-2 w-full">
        <p class="text-sm">Top</p>
        <Divider v-for="v in ALL_VARIANTS" :key="v" :variant="v" inset="default" />
        <p class="text-sm">Bottom</p>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const dividers = root.querySelectorAll('[data-slot="divider"]');
			await expect(dividers.length).toBe(3);
		});
	},
};
