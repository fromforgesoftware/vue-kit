import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import HoverCard from './HoverCard.vue';
import HoverCardTrigger from './HoverCardTrigger.vue';
import HoverCardContent from './HoverCardContent.vue';
import Avatar from '../avatar/Avatar.vue';
import Button from '../button/Button.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const ALL_ALIGNS = ['start', 'center', 'end'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'General/Hover Card',
	component: HoverCard,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A floating panel that appears on hover or focus, showing supplementary detail (user previews, link previews, metric breakdowns). Built on Reka UI — content is portaled to <code>document.body</code>. Unlike Tooltip, the panel can host interactive content because hover-intent keeps it open.',
			},
		},
	},
	argTypes: {
		openDelay: {
			control: { type: 'number', min: 0, max: 1000, step: 50 },
			description: 'Hover delay before open (ms).',
		},
		closeDelay: {
			control: { type: 'number', min: 0, max: 1000, step: 50 },
			description: 'Hover-out delay before close (ms).',
		},
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		openDelay: 200,
		closeDelay: 150,
		'onUpdate:open': fn(),
	},
	render: (args) => ({
		components: { HoverCard, HoverCardTrigger, HoverCardContent, Avatar, Button },
		setup: () => ({ args }),
		template: `
      <div class="flex justify-center p-16">
        <HoverCard v-bind="args">
          <HoverCardTrigger>
            <Button variant="link">@tradingbot</Button>
          </HoverCardTrigger>
          <HoverCardContent :side-offset="8" size="lg">
            <div class="flex gap-4">
              <Avatar fallback="WA" size="lg" />
              <div class="space-y-1">
                <h4 class="text-sm font-semibold">@tradingbot</h4>
                <p class="text-sm text-muted-foreground">
                  Workforce management platform for modern teams.
                </p>
                <div class="flex items-center pt-2 text-xs text-muted-foreground">
                  Joined December 2021
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    `,
	}),
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sides: Story = {
	parameters: {
		docs: { description: { story: 'Four sides — Reka flips automatically near viewport edges.' } },
	},
	render: () => ({
		components: { HoverCard, HoverCardTrigger, HoverCardContent, Button },
		setup: () => ({ ALL_SIDES }),
		template: `
      <div class="grid grid-cols-2 gap-6 p-12 place-items-center">
        <HoverCard v-for="s in ALL_SIDES" :key="s" :open-delay="100">
          <HoverCardTrigger>
            <Button variant="outline">side: {{ s }}</Button>
          </HoverCardTrigger>
          <HoverCardContent :side="s" size="sm">
            <p class="text-sm">Hover card on {{ s }}.</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    `,
	}),
};

export const Alignments: Story = {
	parameters: {
		docs: { description: { story: 'Alignment along the chosen side.' } },
	},
	render: () => ({
		components: { HoverCard, HoverCardTrigger, HoverCardContent, Button },
		setup: () => ({ ALL_ALIGNS }),
		template: `
      <div class="flex gap-6 p-12 justify-center">
        <HoverCard v-for="a in ALL_ALIGNS" :key="a" :open-delay="100">
          <HoverCardTrigger>
            <Button variant="outline">align: {{ a }}</Button>
          </HoverCardTrigger>
          <HoverCardContent :align="a" size="sm">
            <p class="text-sm">align: {{ a }}</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Three width tiers — pick the smallest that fits the content.' },
		},
	},
	render: () => ({
		components: { HoverCard, HoverCardTrigger, HoverCardContent, Button },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex gap-6 p-12 justify-center">
        <HoverCard v-for="s in ALL_SIZES" :key="s" :open-delay="100">
          <HoverCardTrigger>
            <Button variant="outline">size: {{ s }}</Button>
          </HoverCardTrigger>
          <HoverCardContent :size="s">
            <p class="text-sm">Width tier: <strong>{{ s }}</strong>.</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    `,
	}),
};

export const WithDelay: Story = {
	args: { openDelay: 500 },
	parameters: {
		docs: {
			description: {
				story:
					'Tune `openDelay` for hover intent. 700 ms is the WAI-ARIA recommendation; 200 ms feels snappy.',
			},
		},
	},
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

async function findHoverCardContent(): Promise<HTMLElement> {
	return await waitFor(() => {
		const el = document.body.querySelector<HTMLElement>('[data-slot="hover-card-content"]');
		if (!el) throw new Error('hover-card content not found');
		return el;
	});
}

export const InteractiveHoverOpens: Story = {
	tags: ['!autodocs', 'test'],
	args: { openDelay: 0, closeDelay: 0 },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await userEvent.hover(trigger);
		const content = await findHoverCardContent();
		await expect(content).toBeInTheDocument();
	},
};

export const InteractiveFocusOpens: Story = {
	tags: ['!autodocs', 'test'],
	args: { openDelay: 0, closeDelay: 0 },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		const content = await findHoverCardContent();
		await expect(content).toBeInTheDocument();
	},
};

export const InteractiveBlurCloses: Story = {
	tags: ['!autodocs', 'test'],
	args: { openDelay: 0, closeDelay: 0 },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		await findHoverCardContent();
		trigger.blur();
		await waitFor(async () => {
			const content = document.body.querySelector('[data-slot="hover-card-content"]');
			await expect(content).toBeNull();
		});
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	args: { openDelay: 0, closeDelay: 0 },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		trigger.focus();
		await findHoverCardContent();
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			const content = document.body.querySelector('[data-slot="hover-card-content"]');
			await expect(content).toBeNull();
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	args: { openDelay: 0, closeDelay: 0 },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		// Reka HoverCardRoot is renderless, so data-slot="hover-card" lives on the
		// forwarded trigger element only.
		const trigger = canvasElement.querySelector('[data-slot="hover-card-trigger"]');
		await expect(trigger).not.toBeNull();

		await userEvent.hover(trigger as HTMLElement);
		await waitFor(async () => {
			const content = document.body.querySelector('[data-slot="hover-card-content"]');
			await expect(content).not.toBeNull();
		});
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Trigger renders without overflow at every viewport. Content is portaled and never affects parent layout.',
			},
		},
	},
	render: () => ({
		components: { HoverCard, HoverCardTrigger, HoverCardContent, Button },
		template: `
      <div data-test-root class="p-2">
        <HoverCard :open-delay="0">
          <HoverCardTrigger>
            <Button variant="outline">Hover trigger</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p class="text-sm">Portaled content — sits on document.body.</p>
          </HoverCardContent>
        </HoverCard>
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
