import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { Info, AlertTriangle, CheckCircle, AlertOctagon, Settings } from '@lucide/vue';
import Alert from './Alert.vue';
import AlertTitle from './AlertTitle.vue';
import AlertDescription from './AlertDescription.vue';
import Button from '../button/Button.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'info', 'warning', 'destructive', 'success'] as const;
const ALL_TONES = ['solid', 'soft'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'General/Alert',
	component: Alert,
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Semantic colour. Match to the meaning of the message.',
		},
		tone: {
			control: 'select',
			options: ALL_TONES,
			description:
				'`solid` keeps the card surface; `soft` tints the background for stronger emphasis.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density.',
		},
		dismissible: { control: 'boolean', description: 'Render a built-in close button.' },
		dismissLabel: { control: 'text', description: 'Accessible label for the dismiss button.' },
		icon: { control: false, description: 'Optional leading icon component (Lucide).' },
		onDismiss: { action: 'dismiss' },
	},
	args: {
		variant: 'default',
		tone: 'solid',
		size: 'default',
		dismissible: false,
		dismissLabel: 'Dismiss',
		onDismiss: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Static, in-page message that draws attention to information, warnings, errors, or successes. Use `Toast` for transient feedback; use `Alert` when the message is part of the page itself.',
			},
		},
	},
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ args, Info }),
		template: `
      <Alert v-bind="args" :icon="Info" class="sm:min-w-96" @dismiss="args.onDismiss">
        <AlertTitle :size="args.size">Heads up</AlertTitle>
        <AlertDescription :size="args.size">Something noteworthy just happened.</AlertDescription>
      </Alert>
    `,
	}),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Five semantic variants. Match the variant to the meaning of the message.',
			},
		},
	},
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ args, Info, AlertTriangle, CheckCircle, AlertOctagon }),
		template: `
      <div class="flex flex-col gap-3 sm:min-w-96">
        <Alert variant="default" :icon="Info">
          <AlertTitle>Default</AlertTitle>
          <AlertDescription>Neutral, informational message.</AlertDescription>
        </Alert>
        <Alert variant="info" :icon="Info">
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>Helpful context the reader should be aware of.</AlertDescription>
        </Alert>
        <Alert variant="success" :icon="CheckCircle">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>The operation finished as expected.</AlertDescription>
        </Alert>
        <Alert variant="warning" :icon="AlertTriangle">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Something to look out for before you proceed.</AlertDescription>
        </Alert>
        <Alert variant="destructive" :icon="AlertOctagon">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>An action could not be completed.</AlertDescription>
        </Alert>
      </div>
    `,
	}),
};

export const Tones: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`solid` (default) sits on the card surface. `soft` tints the background for stronger emphasis when the alert is part of dense content.',
			},
		},
	},
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ args, AlertTriangle }),
		template: `
      <div class="flex flex-col gap-3 sm:min-w-96">
        <Alert variant="warning" tone="solid" :icon="AlertTriangle">
          <AlertTitle>Solid</AlertTitle>
          <AlertDescription>Default tone — uses the card surface.</AlertDescription>
        </Alert>
        <Alert variant="warning" tone="soft" :icon="AlertTriangle">
          <AlertTitle>Soft</AlertTitle>
          <AlertDescription>Tinted background for dense or in-form contexts.</AlertDescription>
        </Alert>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three densities. Default for general use; `sm` for inline form context; `lg` for page-level callouts.',
			},
		},
	},
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ args, Info }),
		template: `
      <div class="flex flex-col gap-3 sm:min-w-96">
        <Alert size="sm" variant="info" :icon="Info">
          <AlertTitle size="sm">Small</AlertTitle>
          <AlertDescription size="sm">Compact alert for inline use.</AlertDescription>
        </Alert>
        <Alert size="default" variant="info" :icon="Info">
          <AlertTitle>Default</AlertTitle>
          <AlertDescription>Standard alert for most contexts.</AlertDescription>
        </Alert>
        <Alert size="lg" variant="info" :icon="Info">
          <AlertTitle size="lg">Large</AlertTitle>
          <AlertDescription size="lg">Prominent page-level callout.</AlertDescription>
        </Alert>
      </div>
    `,
	}),
};

export const WithIcon: Story = {
	args: { variant: 'info' },
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ args, Info }),
		template: `
      <Alert v-bind="args" :icon="Info" class="sm:min-w-96">
        <AlertTitle>Sync in progress</AlertTitle>
        <AlertDescription>This entity is connected to an external system. Some fields are read-only.</AlertDescription>
      </Alert>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Pass any Lucide icon via the `icon` prop. The icon inherits the alert variant colour.',
			},
		},
	},
};

export const TitleOnly: Story = {
	render: (args) => ({
		components: { Alert, AlertTitle },
		setup: () => ({ args, Info }),
		template: `
      <Alert :icon="Info" variant="info" class="sm:min-w-96">
        <AlertTitle>Single-line message — no description needed.</AlertTitle>
      </Alert>
    `,
	}),
	parameters: {
		docs: { description: { story: 'Skip the description for a one-line callout.' } },
	},
};

// Regression guard for the icon alignment: single-line alerts (no subtitle)
// must centre the icon against the line; only a title + description top-aligns it.
export const IconAlignment: Story = {
	render: () => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ Info, CheckCircle, AlertTriangle }),
		template: `
      <div class="flex flex-col gap-3 sm:min-w-96">
        <!-- description-only, single line → icon centred -->
        <Alert :icon="Info" variant="info" tone="soft">
          <AlertDescription>You have unpublished changes.</AlertDescription>
        </Alert>
        <!-- title-only, single line → icon centred -->
        <Alert :icon="CheckCircle" variant="success" tone="soft">
          <AlertTitle>Saved just now.</AlertTitle>
        </Alert>
        <!-- title + description → icon aligns to the first line -->
        <Alert :icon="AlertTriangle" variant="warning" tone="soft">
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>This one has a subtitle, so the icon aligns to the first line instead of centring.</AlertDescription>
        </Alert>
      </div>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Single-line alerts (title-only or description-only) centre the icon against the line. Only when both a title and a description are present does the icon top-align to the first line.',
			},
		},
	},
};

export const Dismissible: Story = {
	args: { dismissible: true, dismissLabel: 'Dismiss notice', variant: 'info' },
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ args, Info }),
		template: `
      <Alert v-bind="args" :icon="Info" class="sm:min-w-96" @dismiss="args.onDismiss">
        <AlertTitle>Did you know?</AlertTitle>
        <AlertDescription>You can dismiss this message and we won't show it again this session.</AlertDescription>
      </Alert>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Set `dismissible` to render a close button. Has a 24×24 px hit area (WCAG 2.2 SC 2.5.8).',
			},
		},
	},
};

export const WithActions: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Inline action buttons. The action area uses `flex flex-wrap` so buttons drop below the message instead of clipping at narrow widths.',
			},
		},
	},
	render: (args) => ({
		components: { Alert, AlertTitle, AlertDescription, Button, Settings, Info, AlertTriangle },
		setup: () => ({ args, AlertTriangle, Settings, Info }),
		template: `
      <div class="flex flex-col gap-3 sm:min-w-96">
        <!-- Single trailing CTA — the layout most likely to clip on mobile. -->
        <Alert variant="warning" tone="soft" size="sm" :icon="AlertTriangle">
          <AlertTitle>Configuration incomplete</AlertTitle>
          <AlertDescription class="flex flex-wrap items-center justify-between gap-3">
            <span>One or more required settings are missing.</span>
            <Button size="sm" variant="outline" class="shrink-0">
              <Settings class="size-4" /> Configure
            </Button>
          </AlertDescription>
        </Alert>

        <!-- Two-button row stacked under the message. -->
        <Alert variant="info" tone="soft" :icon="Info">
          <AlertTitle>Unsaved changes</AlertTitle>
          <AlertDescription class="space-y-2">
            <p>Apply or discard your changes before navigating away.</p>
            <div class="flex flex-wrap gap-2">
              <Button size="sm">Apply changes</Button>
              <Button size="sm" variant="outline">Discard</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="alert"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		await expect(root).toHaveAttribute('role', 'alert');
		const title = canvasElement.querySelector('[data-slot="alert-title"]');
		const desc = canvasElement.querySelector('[data-slot="alert-description"]');
		await expect(title).toBeInTheDocument();
		await expect(desc).toBeInTheDocument();
	},
};

export const InteractiveDismissByClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { dismissible: true },
	play: async ({ args, canvasElement }) => {
		const dismiss = canvasElement.querySelector('[data-slot="alert-dismiss"]') as HTMLElement;
		await expect(dismiss).toBeInTheDocument();
		expectMinTargetSize(dismiss, 24);
		await userEvent.click(dismiss);
		await expect(args.onDismiss).toHaveBeenCalledOnce();
	},
};

export const InteractiveDismissByKeyboard: Story = {
	tags: ['!autodocs', 'test'],
	args: { dismissible: true },
	play: async ({ args, canvasElement }) => {
		const dismiss = canvasElement.querySelector('[data-slot="alert-dismiss"]') as HTMLButtonElement;
		dismiss.focus();
		await expect(dismiss).toHaveFocus();
		await userEvent.keyboard(' ');
		await userEvent.keyboard('{Enter}');
		await expect(args.onDismiss).toHaveBeenCalledTimes(2);
	},
};

export const InteractiveAccessibleLabel: Story = {
	tags: ['!autodocs', 'test'],
	args: { dismissible: true, dismissLabel: 'Dismiss sync warning' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole('button', { name: 'Dismiss sync warning' });
		await expect(button).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Renders without horizontal overflow at every standard viewport.' },
		},
	},
	render: () => ({
		components: { Alert, AlertTitle, AlertDescription },
		setup: () => ({ ALL_VARIANTS, AlertTriangle }),
		template: `
      <div data-test-root class="flex flex-col gap-3 p-2">
        <Alert v-for="v in ALL_VARIANTS" :key="v" :variant="v" :icon="AlertTriangle">
          <AlertTitle>{{ v }}</AlertTitle>
          <AlertDescription>The quick brown fox jumps over the lazy dog. The quick brown fox jumps.</AlertDescription>
        </Alert>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const alerts = root.querySelectorAll('[data-slot="alert"]');
			await expect(alerts.length).toBe(5);
		});
	},
};
