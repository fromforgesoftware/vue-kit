import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import Spinner from './Spinner.vue';
import Button from '../button/Button.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_SIZES = ['xs', 'sm', 'default', 'lg', 'xl'] as const;
const ALL_TONES = ['default', 'primary', 'current'] as const;

const meta = {
	title: 'General/Spinner',
	component: Spinner,
	tags: ['!autodocs'],
	argTypes: {
		size: { control: 'select', options: ALL_SIZES },
		tone: {
			control: 'select',
			options: ALL_TONES,
			description: 'Colour. `current` inherits from the parent (use inside coloured buttons).',
		},
		label: { control: 'text', description: 'Accessible label announced by screen readers.' },
	},
	args: {
		size: 'default',
		tone: 'default',
		label: 'Loading',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Indeterminate progress indicator. Use for short waits where structure is unknown — for known shapes, prefer `Skeleton`.',
			},
		},
	},
	render: (args) => ({
		components: { Spinner },
		setup: () => ({ args }),
		template: `<Spinner v-bind="args" />`,
	}),
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Five sizes scale uniformly. Pair with text size: `xs` for inline `text-xs`; `xl` for hero-level loading screens.',
			},
		},
	},
	render: () => ({
		components: { Spinner },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex items-end gap-4">
        <Spinner v-for="s in ALL_SIZES" :key="s" :size="s" />
      </div>
    `,
	}),
};

export const Tones: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`default` for neutral context; `primary` for branded loading screens; `current` to inherit from a coloured parent (e.g. button).',
			},
		},
	},
	render: () => ({
		components: { Spinner },
		setup: () => ({ ALL_TONES }),
		template: `
      <div class="flex items-end gap-6">
        <Spinner v-for="t in ALL_TONES" :key="t" :tone="t" />
      </div>
    `,
	}),
};

export const WithText: Story = {
	parameters: {
		docs: { description: { story: 'Pair with a label for inline loading states.' } },
	},
	render: () => ({
		components: { Spinner },
		template: `
      <div class="flex items-center gap-2 text-sm">
        <Spinner size="sm" label="Loading employees" />
        <span>Loading employees…</span>
      </div>
    `,
	}),
};

export const InButton: Story = {
	name: 'In button context',
	parameters: {
		docs: {
			description: {
				story:
					'Inside a button, use `tone="current"` so the spinner inherits the button text colour.',
			},
		},
	},
	render: () => ({
		components: { Spinner, Button },
		template: `
      <Button disabled>
        <Spinner size="sm" tone="current" />
        Please wait
      </Button>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const el = canvasElement.querySelector('[data-slot="spinner"]') as SVGElement;
		await expect(el).toBeInTheDocument();
		await expect(el.tagName).toBe('svg');
		await expect(el).toHaveAttribute('role', 'status');
	},
};

export const InteractiveAccessibleLabel: Story = {
	tags: ['!autodocs', 'test'],
	args: { label: 'Saving changes' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const el = canvas.getByRole('status', { name: 'Saving changes' });
		await expect(el).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Spinner },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div data-test-root class="flex items-end gap-2 p-2">
        <Spinner v-for="s in ALL_SIZES" :key="s" :size="s" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const spinners = root.querySelectorAll('[data-slot="spinner"]');
			await expect(spinners.length).toBe(5);
		});
	},
};
