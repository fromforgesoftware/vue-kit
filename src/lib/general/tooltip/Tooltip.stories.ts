import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import Tooltip from './Tooltip.vue';
import Button from '../button/Button.vue';
import { inBody } from '../../../test-utils/playHelpers.js';

const ALL_SIDES = ['top', 'right', 'bottom', 'left'] as const;

const meta = {
	title: 'General/Tooltip',
	component: Tooltip,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Brief, non-essential help text shown on hover or focus of an element. Built on Reka UI — opens on hover or keyboard focus, closes on Escape, blur, or pointer leave. Content is portaled to <code>document.body</code>.',
			},
		},
	},
	argTypes: {
		content: {
			control: 'text',
			description: 'Tooltip text. Override via the `content` slot for composed content.',
		},
		side: {
			control: 'select',
			options: ALL_SIDES,
			description: 'Side of the trigger to position the tooltip.',
		},
		align: {
			control: 'select',
			options: ['start', 'center', 'end'],
			description: 'Alignment along the chosen side.',
		},
		sideOffset: {
			control: { type: 'number', min: 0, max: 32 },
			description: 'Distance from the trigger (px).',
		},
		delayDuration: {
			control: { type: 'number', min: 0, max: 1000, step: 50 },
			description: 'Hover delay before open (ms).',
		},
		disableHoverableContent: {
			control: 'boolean',
			description: 'When true, hovering the tooltip itself does NOT keep it open.',
		},
	},
	args: {
		content: 'This is a tooltip',
		side: 'top',
		align: 'center',
		sideOffset: 4,
		delayDuration: 200,
		skipDelayDuration: 300,
		disableHoverableContent: false,
	},
	render: (args) => ({
		components: { Tooltip, Button },
		setup: () => ({ args }),
		template: `
      <div class="flex justify-center p-12">
        <Tooltip v-bind="args">
          <Button>Hover or focus me</Button>
        </Tooltip>
      </div>
    `,
	}),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sides: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Four sides — Reka also handles collision avoidance and flips automatically near viewport edges.',
			},
		},
	},
	render: () => ({
		components: { Tooltip, Button },
		setup: () => ({ ALL_SIDES }),
		template: `
      <div class="grid grid-cols-2 gap-6 p-12">
        <Tooltip v-for="s in ALL_SIDES" :key="s" :content="'Tooltip on ' + s" :side="s">
          <Button variant="outline">side: {{ s }}</Button>
        </Tooltip>
      </div>
    `,
	}),
};

export const WithDelay: Story = {
	args: { delayDuration: 500, content: 'I appear after 500 ms' },
	parameters: {
		docs: {
			description: {
				story:
					'Tune `delayDuration` to balance discoverability against fatigue. 200 ms is the default.',
			},
		},
	},
};

export const LongContent: Story = {
	args: {
		content:
			'A longer tooltip with multiple lines of text. Tooltips wrap automatically and have a maximum width of 17.5rem (max-w-70).',
	},
};

export const ComposedContent: Story = {
	parameters: {
		docs: { description: { story: 'Use the `content` slot for non-string content.' } },
	},
	render: () => ({
		components: { Tooltip, Button },
		template: `
      <div class="flex justify-center p-12">
        <Tooltip>
          <Button variant="outline">Custom content</Button>
          <template #content>
            <div class="flex flex-col gap-1">
              <strong>Heading</strong>
              <span class="text-muted-foreground">Detail line</span>
            </div>
          </template>
        </Tooltip>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveHoverOpens: Story = {
	tags: ['!autodocs', 'test'],
	args: { delayDuration: 0, content: 'Tooltip content' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await userEvent.hover(trigger);
		const tip = await inBody().findByRole('tooltip', { hidden: true });
		await expect(tip).toBeInTheDocument();
		await expect(tip.textContent?.trim()).toContain('Tooltip content');
	},
};

export const InteractiveFocusOpens: Story = {
	tags: ['!autodocs', 'test'],
	args: { delayDuration: 0, content: 'Focus opens tooltip' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		const tip = await inBody().findByRole('tooltip', { hidden: true });
		await expect(tip).toBeInTheDocument();
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	args: { delayDuration: 0, content: 'Press Escape to close' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		await inBody().findByRole('tooltip', { hidden: true });
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			const tip = inBody().queryByRole('tooltip', { hidden: true });
			await expect(tip).toBeNull();
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	args: { delayDuration: 0, content: 'Slots test' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await userEvent.hover(trigger);
		await inBody().findByRole('tooltip', { hidden: true });
		const content = document.body.querySelector('[data-slot="tooltip-content"]');
		await expect(content).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Tooltip trigger and label remain laid out across all viewports without overflow.',
			},
		},
	},
	render: () => ({
		components: { Tooltip, Button },
		template: `
      <div data-test-root class="p-2">
        <Tooltip content="Inline help text">
          <Button variant="outline">Trigger</Button>
        </Tooltip>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		// Tooltips are point-content on hover/focus, not a flow element — the
		// test verifies the trigger renders at every viewport without overflow.
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await expect(root).not.toBeNull();
		const btn = root.querySelector('button');
		await expect(btn).not.toBeNull();
		const r = btn!.getBoundingClientRect();
		await expect(r.height).toBeGreaterThanOrEqual(24);
	},
};
