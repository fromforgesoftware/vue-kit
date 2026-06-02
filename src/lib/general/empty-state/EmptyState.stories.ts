import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import { Inbox, FileText, Plus, RefreshCw, Calendar, Users } from '@lucide/vue';
import EmptyState from './EmptyState.vue';
import EmptyStateAction from './EmptyStateAction.vue';
import Button from '../button/Button.vue';
import Icon from '../icon/Icon.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;
const ALL_TONES = ['default', 'muted'] as const;

const meta = {
	title: 'General/EmptyState',
	component: EmptyState,
	tags: ['!autodocs'],
	argTypes: {
		title: { control: 'text' },
		description: { control: 'text' },
		size: { control: 'select', options: ALL_SIZES },
		tone: {
			control: 'select',
			options: ALL_TONES,
			description: '`default` is transparent; `muted` adds a soft background.',
		},
		icon: { control: false, description: 'Lucide icon component.' },
	},
	args: {
		title: 'No data found',
		description: "It looks like there's no data here. Create one or refresh the page.",
		size: 'default',
		tone: 'default',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Page-level placeholder shown when a list, table, or panel has no data yet. Always pair with a clear next-step action.',
			},
		},
	},
	render: (args) => ({
		components: { EmptyState },
		setup: () => ({ args, Inbox }),
		template: `<EmptyState v-bind="args" :icon="Inbox" />`,
	}),
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithActions: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Pair with one or two buttons that describe the next step. Use the default slot.',
			},
		},
	},
	render: () => ({
		components: { EmptyState, Button, Icon },
		setup: () => ({ FileText, Plus, RefreshCw }),
		template: `
      <EmptyState
        :icon="FileText"
        title="No data found"
        description="Create a new entry or refresh the page."
      >
        <Button size="default">
          <Icon :icon="Plus" size="sm" />
          Create new
        </Button>
        <Button variant="outline" size="default">
          <Icon :icon="RefreshCw" size="sm" />
          Refresh
        </Button>
      </EmptyState>
    `,
	}),
};

export const WithActionCards: Story = {
	parameters: {
		docs: {
			description: {
				story: 'For multi-step onboarding, use the `actions` slot with EmptyStateAction cards.',
			},
		},
	},
	render: () => ({
		components: { EmptyState, EmptyStateAction, Button },
		setup: () => ({ Inbox }),
		template: `
      <EmptyState
        :icon="Inbox"
        title="Get started"
        description="Pick one of the actions below to populate your account."
      >
        <template #actions>
          <EmptyStateAction title="Create new account" description="Create a new account to get started.">
            <Button size="default">Create account</Button>
          </EmptyStateAction>
          <EmptyStateAction title="Add new card" description="Add a new card to your account.">
            <Button size="default">Add card</Button>
          </EmptyStateAction>
        </template>
      </EmptyState>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three densities. `sm` for inline use inside a card; `default` for page-level; `lg` for full-page splash.',
			},
		},
	},
	render: () => ({
		components: { EmptyState },
		setup: () => ({ Inbox }),
		template: `
      <div class="flex flex-col divide-y rounded-lg border">
        <EmptyState :icon="Inbox" title="Small" description="Inline use" size="sm" />
        <EmptyState :icon="Inbox" title="Default" description="Page-level" size="default" />
        <EmptyState :icon="Inbox" title="Large" description="Full-page splash" size="lg" />
      </div>
    `,
	}),
};

export const Tones: Story = {
	args: { tone: 'muted' },
	parameters: {
		docs: {
			description: {
				story:
					'`muted` tone wraps the empty state in a soft background — useful inside white cards.',
			},
		},
	},
	render: (args) => ({
		components: { EmptyState },
		setup: () => ({ args, Inbox }),
		template: `<EmptyState v-bind="args" :icon="Inbox" />`,
	}),
};

export const NoIcon: Story = {
	parameters: {
		docs: { description: { story: 'For minimal contexts, omit the icon.' } },
	},
	render: () => ({
		components: { EmptyState, Button, Icon },
		setup: () => ({ Plus }),
		template: `
      <EmptyState title="Nothing here yet" description="Create your first item to get started.">
        <Button size="default">
          <Icon :icon="Plus" size="sm" />
          Get started
        </Button>
      </EmptyState>
    `,
	}),
};

export const CustomIconSlot: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Override the icon area entirely with the `icon` slot. Useful when more than one glyph is meaningful.',
			},
		},
	},
	render: () => ({
		components: { EmptyState, Button, Icon },
		setup: () => ({ FileText, Calendar, Users, Plus }),
		template: `
      <EmptyState title="Pick a starting point" description="Choose a template or start from scratch.">
        <template #icon>
          <div class="flex items-center gap-2">
            <div class="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon :icon="FileText" size="md" />
            </div>
            <div class="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon :icon="Calendar" size="default" />
            </div>
            <div class="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon :icon="Users" size="md" />
            </div>
          </div>
        </template>
        <Button size="default">
          <Icon :icon="Plus" size="sm" />
          Start
        </Button>
      </EmptyState>
    `,
	}),
};

export const Illustration: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Use the `illustration` prop to render a branded SVG illustration instead of a Lucide icon. The light/dark variant is swapped automatically via `[data-theme]`. Available names live in `ILLUSTRATION_NAMES`.',
			},
		},
	},
	render: () => ({
		components: { EmptyState, Button, Icon },
		setup: () => ({ Plus }),
		template: `
      <EmptyState
        illustration="empty-datatable"
        title="No employees yet"
        description="Get started by adding your first employee to the system."
      >
        <Button size="default">
          <Icon :icon="Plus" size="sm" />
          Add employee
        </Button>
      </EmptyState>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="empty-state"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await expect(root.tagName).toBe('SECTION');
		const title = canvasElement.querySelector('[data-slot="empty-state-title"]') as HTMLElement;
		await expect(title.tagName).toBe('H3');
		const desc = canvasElement.querySelector('[data-slot="empty-state-description"]');
		await expect(desc).toBeInTheDocument();
		const icon = canvasElement.querySelector('[data-slot="empty-state-icon"]') as HTMLElement;
		await expect(icon).toHaveAttribute('aria-hidden', 'true');
	},
};

export const InteractiveAriaLabel: Story = {
	tags: ['!autodocs', 'test'],
	args: { title: 'No employees match this filter' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="empty-state"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-label', 'No employees match this filter');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { EmptyState, Button },
		setup: () => ({ Inbox }),
		template: `
      <div data-test-root class="p-2">
        <EmptyState :icon="Inbox" title="No data" description="Create something to get started.">
          <Button size="default">Create</Button>
        </EmptyState>
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
