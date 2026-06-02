import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ref } from 'vue';
import Accordion from './Accordion.vue';
import AccordionItem from './AccordionItem.vue';
import AccordionTrigger from './AccordionTrigger.vue';
import AccordionContent from './AccordionContent.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default'] as const;
const ALL_CHEVRON_POSITIONS = ['left', 'right'] as const;

const meta = {
	title: 'General/Accordion',
	component: Accordion,
	tags: ['!autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['single', 'multiple'],
			description: 'Single or multiple items expanded at once.',
		},
		collapsible: {
			control: 'boolean',
			description: 'When `single`, allows closing the open item.',
		},
		disabled: { control: 'boolean', description: 'Disable the entire accordion.' },
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual surface treatment.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density tier — controls padding and trigger typography.',
		},
		chevronPosition: {
			control: 'select',
			options: ALL_CHEVRON_POSITIONS,
			description: 'Chevron position relative to the trigger label.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		type: 'single',
		collapsible: true,
		disabled: false,
		variant: 'default',
		size: 'default',
		chevronPosition: 'right',
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Vertically stacked sections that expand to reveal content. Built on Reka UI primitives — keyboard, ARIA, focus management handled internally.',
			},
		},
	},
	render: (args) => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		setup: () => ({ args }),
		template: `
      <Accordion v-bind="args" class="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes — adheres to the WAI-ARIA accordion design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>Animated open/close powered by accordion-up / accordion-down keyframes.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Can I expand multiple?</AccordionTrigger>
          <AccordionContent>Set <code>type="multiple"</code> to allow several open simultaneously.</AccordionContent>
        </AccordionItem>
      </Accordion>
    `,
	}),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Two surface treatments. `default` sits inside a card; `ghost` is borderless for sidebars and filter panels.',
			},
		},
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">default</span>
          <Accordion type="single" collapsible>
            <AccordionItem value="a">
              <AccordionTrigger>Card surface with border</AccordionTrigger>
              <AccordionContent>Bordered card surface — use for FAQs and standalone disclosure groups.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">ghost</span>
          <Accordion variant="ghost" type="single" collapsible>
            <AccordionItem value="a">
              <AccordionTrigger>Borderless ghost surface</AccordionTrigger>
              <AccordionContent>No border or surface fill — sits flush inside containers.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Two density tiers: `sm` (12 px text, tighter padding) and `default` (13 px text).',
			},
		},
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <div class="flex flex-col gap-6 w-full max-w-md">
        <Accordion type="single" collapsible size="sm">
          <AccordionItem value="a">
            <AccordionTrigger>Small density</AccordionTrigger>
            <AccordionContent>Compact rows for sidebars or filter panels.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="single" collapsible size="default">
          <AccordionItem value="a">
            <AccordionTrigger>Default density</AccordionTrigger>
            <AccordionContent>The general-purpose size.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    `,
	}),
};

export const ChevronPositions: Story = {
	parameters: {
		docs: {
			description: {
				story: '`right` is the default; `left` is for tree-style or file-browser disclosure.',
			},
		},
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Accordion type="single" collapsible chevron-position="right">
          <AccordionItem value="a">
            <AccordionTrigger>Chevron right (default)</AccordionTrigger>
            <AccordionContent>Rotates 180° on open.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="single" collapsible chevron-position="left">
          <AccordionItem value="a">
            <AccordionTrigger>Chevron left</AccordionTrigger>
            <AccordionContent>Rotates 90° on open — file-browser feel.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    `,
	}),
};

export const Multiple: Story = {
	parameters: {
		docs: {
			description: { story: '`type="multiple"` lets several items stay open simultaneously.' },
		},
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <Accordion type="multiple" class="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Independent state</AccordionTrigger>
          <AccordionContent>Each item operates independently.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Multiple open at once</AccordionTrigger>
          <AccordionContent>Any combination of items can be open.</AccordionContent>
        </AccordionItem>
      </Accordion>
    `,
	}),
};

export const WithDefaultValue: Story = {
	parameters: {
		docs: { description: { story: 'Open one item by default with `default-value`.' } },
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <Accordion type="single" default-value="item-2" collapsible class="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>First item</AccordionTrigger>
          <AccordionContent>Closed by default.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second item (open)</AccordionTrigger>
          <AccordionContent>Open by default.</AccordionContent>
        </AccordionItem>
      </Accordion>
    `,
	}),
};

export const Controlled: Story = {
	parameters: {
		docs: { description: { story: 'Drive the open value externally with v-model.' } },
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		setup() {
			const activeItem = ref('item-1');
			return { activeItem };
		},
		template: `
      <div class="flex flex-col gap-4">
        <div class="text-xs text-muted-foreground">Active: {{ activeItem }}</div>
        <Accordion v-model="activeItem" type="single" collapsible class="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content for item 1.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content for item 2.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    `,
	}),
};

export const WithDisabledItem: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Per-item disabled state — disabled triggers are skipped during keyboard navigation.',
			},
		},
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <Accordion type="single" collapsible class="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Enabled item</AccordionTrigger>
          <AccordionContent>This item can be expanded.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Disabled item</AccordionTrigger>
          <AccordionContent>This content cannot be accessed.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Another enabled item</AccordionTrigger>
          <AccordionContent>This item can be expanded.</AccordionContent>
        </AccordionItem>
      </Accordion>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveSpaceToggles: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const triggers = canvas.getAllByRole('button');
		await expect(triggers.length).toBeGreaterThan(0);
		const first = triggers[0];
		await expect(first.getAttribute('data-slot')).toBe('accordion-trigger');
		await expect(first.getAttribute('aria-expanded')).toBe('false');

		first.focus();
		await userEvent.keyboard(' ');
		await expect(first.getAttribute('aria-expanded')).toBe('true');

		await userEvent.keyboard('{Enter}');
		await expect(first.getAttribute('aria-expanded')).toBe('false');
	},
};

export const InteractiveArrowKeysNavigate: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const triggers = canvas.getAllByRole('button');
		await expect(triggers.length).toBe(3);

		triggers[0].focus();
		await expect(triggers[0]).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect(triggers[1]).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect(triggers[2]).toHaveFocus();

		await userEvent.keyboard('{ArrowUp}');
		await expect(triggers[1]).toHaveFocus();

		await userEvent.keyboard('{Home}');
		await expect(triggers[0]).toHaveFocus();

		await userEvent.keyboard('{End}');
		await expect(triggers[2]).toHaveFocus();
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="accordion"]');
		await expect(root).not.toBeNull();
		const items = canvasElement.querySelectorAll('[data-slot="accordion-item"]');
		await expect(items.length).toBe(3);
		const triggers = canvasElement.querySelectorAll('[data-slot="accordion-trigger"]');
		await expect(triggers.length).toBe(3);
		const headers = canvasElement.querySelectorAll('[data-slot="accordion-header"]');
		await expect(headers.length).toBe(3);
		const chevrons = canvasElement.querySelectorAll('[data-slot="accordion-chevron"]');
		await expect(chevrons.length).toBe(3);
	},
};

export const InteractiveExpandedAriaState: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const triggers = canvas.getAllByRole('button');
		await expect(triggers[0].getAttribute('aria-expanded')).toBe('false');

		await userEvent.click(triggers[0]);
		await expect(triggers[0].getAttribute('aria-expanded')).toBe('true');

		// Reka renders content with role region tied via aria-labelledby on open
		const expandedItem = canvasElement.querySelector('[data-state="open"]');
		await expect(expandedItem).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Accordion fills its parent at every viewport without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
		template: `
      <div data-test-root class="w-full p-2">
        <Accordion type="single" collapsible default-value="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>A wide trigger label that should wrap or truncate gracefully on narrow viewports</AccordionTrigger>
            <AccordionContent>Body text fits inside its parent and never causes horizontal scroll.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second</AccordionTrigger>
            <AccordionContent>More content</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const triggers = root.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]');
			for (const t of triggers) {
				const r = t.getBoundingClientRect();
				await expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
