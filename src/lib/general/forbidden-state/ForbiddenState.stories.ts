import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import { ArrowLeft, LogOut } from '@lucide/vue';
import ForbiddenState from './ForbiddenState.vue';
import Button from '../button/Button.vue';
import Icon from '../icon/Icon.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_VARIANTS = ['forbidden', 'not-found', 'error', 'locked'] as const;

const meta = {
	title: 'General/ForbiddenState',
	component: ForbiddenState,
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Preset (icon + default title and description).',
		},
		title: { control: 'text', description: 'Overrides the preset title.' },
		description: { control: 'text', description: 'Overrides the preset description.' },
		size: { control: 'select', options: ['default', 'lg'] },
		tone: { control: 'select', options: ['default', 'muted'] },
	},
	args: {
		variant: 'forbidden',
		size: 'lg',
		tone: 'default',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Full-page placeholder shown when access is denied or content is missing. Built on top of `EmptyState` with permission-domain presets.',
			},
		},
	},
	render: (args) => ({
		components: { ForbiddenState },
		setup: () => ({ args }),
		template: `<ForbiddenState v-bind="args" />`,
	}),
} satisfies Meta<typeof ForbiddenState>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: { story: 'Four presets cover the most common access / availability errors.' },
		},
	},
	render: () => ({
		components: { ForbiddenState },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col divide-y rounded-lg border">
        <ForbiddenState v-for="v in ALL_VARIANTS" :key="v" :variant="v" size="default" />
      </div>
    `,
	}),
};

export const WithBackButton: Story = {
	parameters: {
		docs: { description: { story: 'Pair with a single recovery action — usually "Go back".' } },
	},
	render: () => ({
		components: { ForbiddenState, Button, Icon },
		setup: () => ({ ArrowLeft }),
		template: `
      <ForbiddenState>
        <Button variant="outline" size="default">
          <Icon :icon="ArrowLeft" size="sm" />
          Go back
        </Button>
      </ForbiddenState>
    `,
	}),
};

export const WithMultipleActions: Story = {
	parameters: {
		docs: {
			description: { story: 'Two actions: a primary recovery path and a secondary fallback.' },
		},
	},
	render: () => ({
		components: { ForbiddenState, Button, Icon },
		setup: () => ({ ArrowLeft, LogOut }),
		template: `
      <ForbiddenState>
        <Button size="default">
          <Icon :icon="ArrowLeft" size="sm" />
          Go to homepage
        </Button>
        <Button variant="outline" size="default">
          <Icon :icon="LogOut" size="sm" />
          Log out
        </Button>
      </ForbiddenState>
    `,
	}),
};

export const CustomMessage: Story = {
	parameters: {
		docs: {
			description: { story: 'Override `title` and `description` for context-specific copy.' },
		},
	},
	render: () => ({
		components: { ForbiddenState, Button, Icon },
		setup: () => ({ ArrowLeft }),
		template: `
      <ForbiddenState
        title="No Permissions"
        description="Your account does not have the required permissions to access this resource. Contact your team administrator."
      >
        <Button variant="outline" size="default">
          <Icon :icon="ArrowLeft" size="sm" />
          Go back
        </Button>
      </ForbiddenState>
    `,
	}),
};

export const NotFound: Story = {
	args: { variant: 'not-found' },
};

export const Error: Story = {
	args: { variant: 'error' },
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="forbidden-state"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await expect(root.tagName).toBe('SECTION');
	},
};

export const InteractiveDefaultPreset: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="forbidden-state"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-label', 'Access Denied');
		await expect(root.textContent).toContain('You do not have permission');
	},
};

export const InteractivePresetSwitch: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'not-found' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="forbidden-state"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-label', 'Not found');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ForbiddenState, Button },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="p-2">
        <ForbiddenState size="default">
          <Button size="default">Go back</Button>
        </ForbiddenState>
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
