import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { Zap } from '@lucide/vue';
import Badge from './Badge.vue';
import Icon from '../icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const ALL_VARIANTS = [
	'default',
	'secondary',
	'destructive',
	'outline',
	'success',
	'warning',
	'info',
	'soft-success',
	'soft-warning',
	'soft-destructive',
	'soft-info',
] as const;

const meta = {
	title: 'General/Badge',
	component: Badge,
	// Disable autodocs because this component has a curated `badge.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description:
				'Visual style. Solid variants for strong emphasis; soft- variants for low emphasis.',
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'default', 'lg'],
			description: 'Density. `xs` and `sm` for inline use in tables/toolbars.',
		},
		shape: {
			control: 'select',
			options: ['default', 'pill'],
			description: 'Corner radius. `pill` for counts, status pills, and tag-like usage.',
		},
		removable: { control: 'boolean', description: 'Render a built-in remove button.' },
		removeLabel: { control: 'text', description: 'Accessible label for the remove button.' },
		onRemove: { action: 'remove' },
	},
	args: {
		variant: 'default',
		size: 'default',
		shape: 'default',
		removable: false,
		removeLabel: 'Remove',
		onRemove: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Compact label for status, categories, counts, and tags. Use sparingly — too many badges crowd the UI.',
			},
		},
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args }),
		template: `<Badge v-bind="args" @remove="args.onRemove">Badge</Badge>`,
	}),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories (visible in autodocs) ─────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'All eleven variants. Solid variants are for primary status; soft- variants are for low-emphasis context.',
			},
		},
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args, ALL_VARIANTS }),
		template: `
      <div class="flex flex-wrap gap-2">
        <Badge v-for="v in ALL_VARIANTS" :key="v" :variant="v" :size="args.size" :shape="args.shape">{{ v }}</Badge>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Four density tiers. `default` for general use; `sm`/`xs` for inline contexts; `lg` for headline status.',
			},
		},
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-center gap-3">
        <Badge :variant="args.variant" size="xs">xs</Badge>
        <Badge :variant="args.variant" size="sm">sm</Badge>
        <Badge :variant="args.variant" size="default">default</Badge>
        <Badge :variant="args.variant" size="lg">lg</Badge>
      </div>
    `,
	}),
};

export const Shapes: Story = {
	parameters: {
		docs: {
			description: {
				story: '`default` for tags and labels; `pill` for counts and rounded status indicators.',
			},
		},
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args }),
		template: `
      <div class="flex items-center gap-3">
        <Badge :variant="args.variant" shape="default">default</Badge>
        <Badge :variant="args.variant" shape="pill">pill</Badge>
        <Badge :variant="args.variant" shape="pill">42</Badge>
      </div>
    `,
	}),
};

export const WithIcon: Story = {
	parameters: {
		docs: {
			description: { story: 'Compose icons via the default slot. Icons inherit `currentColor`.' },
		},
	},
	render: (args) => ({
		components: { Badge, Icon },
		setup: () => ({ args, Zap }),
		template: `
      <Badge v-bind="args" @remove="args.onRemove">
        <Icon :icon="Zap" size="xs" />
        Featured
      </Badge>
    `,
	}),
};

export const WithCount: Story = {
	parameters: {
		docs: { description: { story: 'Pair label and count via slot composition.' } },
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args }),
		template: `
      <Badge v-bind="args" @remove="args.onRemove">
        Notifications
        <span class="text-current font-semibold">73</span>
      </Badge>
    `,
	}),
};

export const Removable: Story = {
	args: { removable: true, removeLabel: 'Remove tag' },
	parameters: {
		docs: {
			description: {
				story:
					'Set `removable` to render a built-in close button. The button has a 24×24 px hit area (WCAG 2.2 SC 2.5.8) and emits `remove`.',
			},
		},
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args }),
		template: `<Badge v-bind="args" @remove="args.onRemove">Removable</Badge>`,
	}),
};

export const AsLink: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Wrap in an `<a>` for navigational tags. Hover styling automatically activates via `[a&]:hover:` selectors.',
			},
		},
	},
	render: (args) => ({
		components: { Badge },
		setup: () => ({ args }),
		template: `<a href="#anchor"><Badge v-bind="args">Link badge</Badge></a>`,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveRemoveByClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { removable: true },
	play: async ({ args, canvasElement }) => {
		const remove = canvasElement.querySelector('[data-slot="badge-remove"]') as HTMLElement;
		await expect(remove).toBeInTheDocument();
		expectMinTargetSize(remove, 24);
		await userEvent.click(remove);
		await expect(args.onRemove).toHaveBeenCalledOnce();
	},
};

export const InteractiveRemoveByKeyboard: Story = {
	tags: ['!autodocs', 'test'],
	args: { removable: true },
	play: async ({ args, canvasElement }) => {
		const remove = canvasElement.querySelector('[data-slot="badge-remove"]') as HTMLButtonElement;
		remove.focus();
		await expect(remove).toHaveFocus();
		await userEvent.keyboard(' ');
		await userEvent.keyboard('{Enter}');
		await expect(args.onRemove).toHaveBeenCalledTimes(2);
	},
};

export const InteractiveAccessibleLabel: Story = {
	tags: ['!autodocs', 'test'],
	args: { removable: true, removeLabel: 'Dismiss featured tag' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const remove = canvas.getByRole('button', { name: 'Dismiss featured tag' });
		await expect(remove).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five standard viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { Badge },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="flex flex-wrap gap-2 p-2">
        <Badge v-for="v in ALL_VARIANTS" :key="v" :variant="v">{{ v }}</Badge>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const badges = root.querySelectorAll('[data-slot="badge"]');
			await expect(badges.length).toBe(11);
			for (const b of badges) {
				const r = (b as HTMLElement).getBoundingClientRect();
				await expect(r.width).toBeGreaterThan(0);
				await expect(r.height).toBeGreaterThan(0);
			}
		});
	},
};
