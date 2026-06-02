import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Kbd from './Kbd.vue';
import KbdGroup from './KbdGroup.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'General/Kbd',
	component: Kbd,
	tags: ['!autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description:
				'Density tier. `sm` for palette/toolbar chips; `default` for docs and tooltips; `lg` for standalone callouts.',
		},
		variant: {
			control: 'inline-radio',
			options: ['default', 'ghost'],
			description:
				'Visual style. `default` is the bordered key chip; `ghost` is borderless and transparent for inline shortcut hints next to menu items / list rows.',
		},
	},
	args: {
		size: 'default',
		variant: 'default',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Keyboard key chip. Use `Kbd` for a single key and `KbdGroup` to compose a multi-key shortcut with collapsed borders.',
			},
		},
	},
	render: (args) => ({
		components: { Kbd },
		setup: () => ({ args }),
		template: `<Kbd v-bind="args">⌘</Kbd>`,
	}),
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three density tiers. `sm` for compact UI contexts (command palette, toolbar hints); `default` for prose and tooltips; `lg` for prominent callouts.',
			},
		},
	},
	render: () => ({
		components: { Kbd },
		template: `
      <div class="flex flex-wrap items-center gap-3">
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="default">⌘</Kbd>
        <Kbd size="lg">⌘</Kbd>
      </div>
    `,
	}),
};

export const Ghost: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Borderless variant for shortcut hints inline with menu items, list rows, or dropdown options — where the bordered chip would compete visually with the row itself.',
			},
		},
	},
	render: () => ({
		components: { Kbd, KbdGroup },
		template: `
      <div class="flex flex-col gap-3 text-sm">
        <div class="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
          <span>DesignHub</span>
          <KbdGroup variant="ghost"><Kbd>⌘</Kbd><Kbd>1</Kbd></KbdGroup>
        </div>
        <div class="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
          <span>Vortex Innovations</span>
          <KbdGroup variant="ghost"><Kbd>⌘</Kbd><Kbd>2</Kbd></KbdGroup>
        </div>
      </div>
    `,
	}),
};

export const Group: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`KbdGroup` collapses adjacent borders so multi-key shortcuts read as a single unit.',
			},
		},
	},
	render: () => ({
		components: { Kbd, KbdGroup },
		template: `
      <div class="flex flex-wrap items-center gap-4">
        <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
        <KbdGroup><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd></KbdGroup>
        <KbdGroup size="sm"><Kbd>Ctrl</Kbd><Kbd>Alt</Kbd><Kbd>Del</Kbd></KbdGroup>
      </div>
    `,
	}),
};

export const CommonShortcuts: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Typical keyboard shortcut patterns as they appear in tooltips and command palette footers.',
			},
		},
	},
	render: () => ({
		components: { Kbd, KbdGroup },
		template: `
      <div class="flex flex-col gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <span>Open command palette</span>
          <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
        </div>
        <div class="flex items-center gap-2">
          <span>Navigate</span>
          <KbdGroup size="sm"><Kbd>↑</Kbd><Kbd>↓</Kbd></KbdGroup>
        </div>
        <div class="flex items-center gap-2">
          <span>Select</span>
          <Kbd size="sm">↵</Kbd>
        </div>
        <div class="flex items-center gap-2">
          <span>Dismiss</span>
          <Kbd>Esc</Kbd>
        </div>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ────────────────────────

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Kbd, KbdGroup },
		template: `
      <div data-test-root class="flex flex-wrap items-center gap-3 p-2">
        <Kbd size="sm">⌘</Kbd>
        <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
        <KbdGroup size="sm"><Kbd>↑</Kbd><Kbd>↓</Kbd></KbdGroup>
        <Kbd size="lg">Esc</Kbd>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const keys = root.querySelectorAll('[data-slot="kbd"]');
			await expect(keys.length).toBeGreaterThan(0);
			for (const key of keys) {
				const r = (key as HTMLElement).getBoundingClientRect();
				await expect(r.width).toBeGreaterThan(0);
				await expect(r.height).toBeGreaterThan(0);
			}
		});
	},
};
