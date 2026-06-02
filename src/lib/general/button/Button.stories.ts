import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ArrowRight, ChevronLeft, Plus, Trash2 } from '@lucide/vue';
import Button from './Button.vue';
import Icon from '../icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = [
	'default',
	'secondary',
	'destructive',
	'outline',
	'ghost',
	'link',
	'soft-destructive',
	'soft-success',
	'soft-warning',
	'soft-info',
] as const;

const ALL_SIZES = ['xs', 'sm', 'default', 'lg'] as const;
const ALL_ICON_SIZES = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;

const meta = {
	title: 'General/Button',
	component: Button,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual style.',
		},
		size: {
			control: 'select',
			options: [...ALL_SIZES, ...ALL_ICON_SIZES],
			description: 'Density. `icon-*` sizes are square — pair with `aria-label`.',
		},
		block: { control: 'boolean', description: 'Full-width within parent.' },
		loading: { control: 'boolean', description: 'Show spinner; implicitly disables.' },
		disabled: { control: 'boolean', description: 'Disabled state.' },
		loadingLabel: { control: 'text', description: 'Accessible label for the spinner.' },
		asChild: {
			control: 'boolean',
			description: 'Merge button props onto the slot child (e.g. RouterLink).',
		},
		onClick: { action: 'click' },
	},
	args: {
		variant: 'default',
		size: 'default',
		block: false,
		loading: false,
		disabled: false,
		loadingLabel: 'Loading',
		asChild: false,
		onClick: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'The primary interactive element of the system. Triggers an action on click, Enter, or Space.',
			},
		},
	},
	render: (args) => ({
		components: { Button },
		setup: () => ({ args }),
		template: `<Button v-bind="args" @click="args.onClick">Button</Button>`,
	}),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'All ten variants. Solid variants for primary actions; soft- for low-emphasis surfaces; `link` for navigational text.',
			},
		},
	},
	render: (args) => ({
		components: { Button },
		setup: () => ({ args, ALL_VARIANTS }),
		template: `
      <div class="flex flex-wrap gap-2">
        <Button v-for="v in ALL_VARIANTS" :key="v" :variant="v" :size="args.size">{{ v }}</Button>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Four density tiers for text-bearing buttons.' } },
	},
	render: (args) => ({
		components: { Button },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-center gap-3">
        <Button :variant="args.variant" size="xs">xs</Button>
        <Button :variant="args.variant" size="sm">sm</Button>
        <Button :variant="args.variant" size="default">default</Button>
        <Button :variant="args.variant" size="lg">lg</Button>
      </div>
    `,
	}),
};

export const IconSizes: Story = {
	parameters: {
		docs: { description: { story: 'Square icon-only sizes. Always pair with `aria-label`.' } },
	},
	render: (args) => ({
		components: { Button, Icon },
		setup: () => ({ args, Plus }),
		template: `
      <div class="flex flex-wrap items-center gap-3">
        <Button :variant="args.variant" size="icon-xs" aria-label="Add"><Icon :icon="Plus" size="xs" /></Button>
        <Button :variant="args.variant" size="icon-sm" aria-label="Add"><Icon :icon="Plus" size="xs" /></Button>
        <Button :variant="args.variant" size="icon" aria-label="Add"><Icon :icon="Plus" size="sm" /></Button>
        <Button :variant="args.variant" size="icon-lg" aria-label="Add"><Icon :icon="Plus" size="md" /></Button>
      </div>
    `,
	}),
};

export const WithLeadingIcon: Story = {
	parameters: {
		docs: {
			description: { story: 'Compose icons via the default slot. Icons inherit `currentColor`.' },
		},
	},
	render: (args) => ({
		components: { Button, Icon },
		setup: () => ({ args, Plus }),
		template: `
      <Button v-bind="args" @click="args.onClick">
        <Icon :icon="Plus" size="sm" />
        New item
      </Button>
    `,
	}),
};

export const WithTrailingIcon: Story = {
	parameters: {
		docs: { description: { story: 'Trailing icon for navigational and "next" affordances.' } },
	},
	render: (args) => ({
		components: { Button, Icon },
		setup: () => ({ args, ArrowRight }),
		template: `
      <Button v-bind="args" @click="args.onClick">
        Continue
        <Icon :icon="ArrowRight" size="sm" />
      </Button>
    `,
	}),
};

export const Loading: Story = {
	args: { loading: true },
	parameters: {
		docs: {
			description: {
				story:
					'Loading state shows an inline spinner. Button stays disabled until loading completes.',
			},
		},
	},
	render: (args) => ({
		components: { Button },
		setup: () => ({ args }),
		template: `<Button v-bind="args" @click="args.onClick">Saving…</Button>`,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Block: Story = {
	args: { block: true },
	parameters: {
		docs: { description: { story: "`block` makes the button fill its parent's width." } },
	},
	render: (args) => ({
		components: { Button },
		setup: () => ({ args }),
		template: `<div class="w-80"><Button v-bind="args" @click="args.onClick">Block button</Button></div>`,
	}),
};

export const AsLink: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Use `as="a"` (or `asChild` with RouterLink) for navigation. Button styling applies to the underlying anchor.',
			},
		},
	},
	render: () => ({
		components: { Button, Icon },
		setup: () => ({ ChevronLeft }),
		template: `
      <Button as="a" href="#anchor" variant="link">
        <Icon :icon="ChevronLeft" size="sm" />
        Go back
      </Button>
    `,
	}),
};

export const DangerousAction: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Destructive variants for irreversible actions. Pair with a confirmation dialog at the consumer level.',
			},
		},
	},
	render: (args) => ({
		components: { Button, Icon },
		setup: () => ({ args, Trash2 }),
		template: `
      <div class="flex items-center gap-2">
        <Button v-bind="args" variant="destructive" @click="args.onClick">
          <Icon :icon="Trash2" size="sm" />
          Delete
        </Button>
        <Button v-bind="args" variant="soft-destructive" @click="args.onClick">
          <Icon :icon="Trash2" size="sm" />
          Delete
        </Button>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveClickEmits: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const btn = canvas.getByRole('button');
		await userEvent.click(btn);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const InteractiveDisabledBlocksClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const btn = canvas.getByRole('button');
		await expect(btn).toBeDisabled();
		// Clicks are blocked by the browser on disabled buttons; userEvent.click
		// rejects on `pointer-events: none`. The native click should be a no-op.
		btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect(args.onClick).not.toHaveBeenCalled();
	},
};

export const InteractiveLoadingBlocksClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { loading: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const btn = canvas.getByRole('button');
		await expect(btn).toBeDisabled();
		const spinner = canvasElement.querySelector('[data-slot="button-spinner"]');
		await expect(spinner).not.toBeNull();
		btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect(args.onClick).not.toHaveBeenCalled();
	},
};

export const InteractiveKeyboardActivates: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const btn = canvas.getByRole('button');
		btn.focus();
		await expect(btn).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard(' ');
		await expect(args.onClick).toHaveBeenCalledTimes(2);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Every text and icon size meets WCAG SC 2.5.8 (≥ 24×24 px).' } },
	},
	render: () => ({
		components: { Button, Icon },
		setup: () => ({ Plus }),
		template: `
      <div data-test-root class="flex flex-wrap items-center gap-2">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="default">default</Button>
        <Button size="lg">lg</Button>
        <Button size="icon-xs" aria-label="Add"><Icon :icon="Plus" size="xs" /></Button>
        <Button size="icon-sm" aria-label="Add"><Icon :icon="Plus" size="xs" /></Button>
        <Button size="icon" aria-label="Add"><Icon :icon="Plus" size="sm" /></Button>
        <Button size="icon-lg" aria-label="Add"><Icon :icon="Plus" size="md" /></Button>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>('button');
		await expect(buttons.length).toBe(8);
		for (const b of buttons) {
			expectMinTargetSize(b, 24);
		}
	},
};

export const InteractiveAsChildLink: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: '`asChild` merges Button styling onto a slot child (e.g. RouterLink).',
			},
		},
	},
	render: () => ({
		components: { Button },
		template: `
      <Button as-child variant="default">
        <a data-test-link href="#somewhere">As-child link</a>
      </Button>
    `,
	}),
	play: async ({ canvasElement }) => {
		const link = canvasElement.querySelector('[data-test-link]') as HTMLAnchorElement;
		await expect(link).not.toBeNull();
		await expect(link.tagName).toBe('A');
		await expect(link.getAttribute('data-slot')).toBe('button');
		await expect(link.className).toContain('bg-primary');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Buttons remain laid out across all five standard viewports without overflow.',
			},
		},
	},
	render: () => ({
		components: { Button },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="flex flex-wrap gap-2 p-2">
        <Button v-for="v in ALL_VARIANTS" :key="v" :variant="v">{{ v }}</Button>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const buttons = root.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
			await expect(buttons.length).toBe(ALL_VARIANTS.length);
			for (const b of buttons) {
				const r = b.getBoundingClientRect();
				await expect(r.width).toBeGreaterThan(0);
				await expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
