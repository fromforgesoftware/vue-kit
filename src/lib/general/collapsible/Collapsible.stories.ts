import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ref } from 'vue';
import Collapsible from './Collapsible.vue';
import CollapsibleTrigger from './CollapsibleTrigger.vue';
import CollapsibleContent from './CollapsibleContent.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_VARIANTS = ['default', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default'] as const;

const meta = {
	title: 'General/Collapsible',
	component: Collapsible,
	tags: ['!autodocs'],
	argTypes: {
		open: { control: 'boolean', description: 'Controlled open state.' },
		defaultOpen: { control: 'boolean', description: 'Initial open state when uncontrolled.' },
		disabled: { control: 'boolean', description: 'Disable the trigger entirely.' },
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual surface treatment.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density tier — controls trigger padding and typography.',
		},
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		defaultOpen: false,
		disabled: false,
		variant: 'default',
		size: 'default',
		'onUpdate:open': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Single open/closed disclosure built on Reka UI. Use it to hide secondary content behind a single toggle (e.g. "Show advanced options"). For multiple sections use Accordion.',
			},
		},
	},
	render: (args) => ({
		components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
		setup: () => ({ args }),
		template: `
      <Collapsible v-bind="args" class="w-full max-w-md">
        <CollapsibleTrigger>Show advanced options</CollapsibleTrigger>
        <CollapsibleContent>
          Settings live here — only loaded once the section opens. Body text is muted by default.
        </CollapsibleContent>
      </Collapsible>
    `,
	}),
} satisfies Meta<typeof Collapsible>;

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
		components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">default</span>
          <Collapsible default-open>
            <CollapsibleTrigger>Card surface with border</CollapsibleTrigger>
            <CollapsibleContent>Bordered card surface — use as a standalone disclosure block.</CollapsibleContent>
          </Collapsible>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">ghost</span>
          <Collapsible variant="ghost" default-open>
            <CollapsibleTrigger>Borderless ghost surface</CollapsibleTrigger>
            <CollapsibleContent>No border or surface fill — sits flush inside containers.</CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Two density tiers: `sm` for sidebars and filter panels; `default` for general use.',
			},
		},
	},
	render: () => ({
		components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
		template: `
      <div class="flex flex-col gap-6 w-full max-w-md">
        <Collapsible size="sm" default-open>
          <CollapsibleTrigger>Small density</CollapsibleTrigger>
          <CollapsibleContent>Compact rows for sidebars or filter panels.</CollapsibleContent>
        </Collapsible>
        <Collapsible size="default" default-open>
          <CollapsibleTrigger>Default density</CollapsibleTrigger>
          <CollapsibleContent>The general-purpose size.</CollapsibleContent>
        </Collapsible>
      </div>
    `,
	}),
};

export const Controlled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Drive the open value externally via `v-model:open` when the parent owns the source of truth.',
			},
		},
	},
	render: () => ({
		components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
		setup() {
			const isOpen = ref(false);
			return { isOpen };
		},
		template: `
      <div class="flex flex-col gap-4 w-full max-w-md">
        <div class="text-xs text-muted-foreground">Open: {{ isOpen }}</div>
        <Collapsible v-model:open="isOpen">
          <CollapsibleTrigger>Toggle me</CollapsibleTrigger>
          <CollapsibleContent>Open state is owned by the parent component.</CollapsibleContent>
        </Collapsible>
      </div>
    `,
	}),
};

export const DefaultOpen: Story = {
	parameters: {
		docs: {
			description: { story: 'Use `default-open` to render the content expanded on first paint.' },
		},
	},
	args: { defaultOpen: true },
};

export const Disabled: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Disabled state — pointer events ignored, opacity reduced, focus skipped.',
			},
		},
	},
	args: { disabled: true },
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveSpaceToggles: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await expect(trigger.getAttribute('data-slot')).toBe('collapsible-trigger');
		await expect(trigger.getAttribute('data-state')).toBe('closed');

		trigger.focus();
		await userEvent.keyboard(' ');
		await expect(trigger.getAttribute('data-state')).toBe('open');

		await userEvent.keyboard('{Enter}');
		await expect(trigger.getAttribute('data-state')).toBe('closed');
	},
};

export const InteractiveClickToggles: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await expect(trigger.getAttribute('aria-expanded')).toBe('false');

		await userEvent.click(trigger);
		await expect(trigger.getAttribute('aria-expanded')).toBe('true');

		const content = canvasElement.querySelector('[data-slot="collapsible-content"]');
		await expect(content).not.toBeNull();
		await expect(content!.getAttribute('data-state')).toBe('open');
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="collapsible"]');
		await expect(root).not.toBeNull();
		const trigger = canvasElement.querySelector('[data-slot="collapsible-trigger"]');
		await expect(trigger).not.toBeNull();
		// Trigger click so content mounts
		await userEvent.click(trigger as HTMLElement);
		const content = canvasElement.querySelector('[data-slot="collapsible-content"]');
		await expect(content).not.toBeNull();
		const inner = canvasElement.querySelector('[data-slot="collapsible-content-inner"]');
		await expect(inner).not.toBeNull();
	},
};

export const InteractiveDisabledRejectsClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button');
		await expect(trigger.getAttribute('aria-expanded')).toBe('false');

		// Disabled buttons reject userEvent.click — dispatch raw event instead.
		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect(trigger.getAttribute('aria-expanded')).toBe('false');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Collapsible fills its parent at every viewport without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
		template: `
      <div data-test-root class="w-full p-2">
        <Collapsible default-open>
          <CollapsibleTrigger>A wide trigger label that should wrap or truncate gracefully on narrow viewports</CollapsibleTrigger>
          <CollapsibleContent>Body text fits inside its parent and never causes horizontal scroll.</CollapsibleContent>
        </Collapsible>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector<HTMLButtonElement>('[data-slot="collapsible-trigger"]')!;
			const r = trigger.getBoundingClientRect();
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
