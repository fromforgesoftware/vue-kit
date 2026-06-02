import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import { User } from '@lucide/vue';
import Avatar from './Avatar.vue';
import Icon from '../icon/Icon.vue';
import Badge from '../badge/Badge.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const SAMPLE_IMAGE =
	'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

const ALL_SIZES = ['xs', 'sm', 'default', 'lg', 'xl'] as const;
const ALL_SHAPES = ['circle', 'rounded', 'square'] as const;

const meta = {
	title: 'General/Avatar',
	component: Avatar,
	tags: ['!autodocs'],
	argTypes: {
		size: { control: 'select', options: ALL_SIZES },
		shape: { control: 'select', options: ALL_SHAPES },
		name: { control: 'text' },
		initials: { control: 'text' },
		src: { control: 'text' },
		alt: { control: 'text' },
	},
	args: {
		size: 'default',
		shape: 'circle',
		name: 'Kelly King',
		src: SAMPLE_IMAGE,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Compact representation of a person or entity. Renders an image with a graceful fallback to initials, an icon, or custom slot content.',
			},
		},
	},
	render: (args) => ({
		components: { Avatar },
		setup: () => ({ args }),
		template: `<Avatar v-bind="args" />`,
	}),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InitialsFallback: Story = {
	args: { src: undefined },
	parameters: {
		docs: {
			description: {
				story:
					'Without an `src`, initials are derived from `name` (first letter of first two words).',
			},
		},
	},
};

export const ExplicitInitials: Story = {
	args: { src: undefined, name: undefined, initials: 'AB' },
	parameters: {
		docs: {
			description: { story: 'Pass `initials` explicitly to override the name-derived value.' },
		},
	},
};

export const IconFallback: Story = {
	args: { src: undefined, name: undefined },
	render: (args) => ({
		components: { Avatar, Icon },
		setup: () => ({ args, User }),
		template: `
      <Avatar v-bind="args">
        <template #fallback>
          <Icon :icon="User" size="sm" class="opacity-60" />
        </template>
      </Avatar>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Use the `fallback` slot for a generic placeholder when no name or initials are available.',
			},
		},
	},
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Five sizes scale uniformly. Pair with text size: `xs` next to `text-xs`, `default` next to body text, `xl` for hero contexts.',
			},
		},
	},
	render: (args) => ({
		components: { Avatar },
		setup: () => ({ args, ALL_SIZES, SAMPLE_IMAGE }),
		template: `
      <div class="flex items-end gap-3">
        <Avatar v-for="s in ALL_SIZES" :key="s" :size="s" :shape="args.shape" name="Kelly King" :src="SAMPLE_IMAGE" />
      </div>
    `,
	}),
};

export const Shapes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`circle` for personal avatars; `rounded` for team or org avatars; `square` for product or brand glyphs.',
			},
		},
	},
	render: (args) => ({
		components: { Avatar },
		setup: () => ({ args, ALL_SHAPES, SAMPLE_IMAGE }),
		template: `
      <div class="flex items-center gap-3">
        <Avatar v-for="sh in ALL_SHAPES" :key="sh" :shape="sh" :size="args.size" name="Kelly King" :src="SAMPLE_IMAGE" />
      </div>
    `,
	}),
};

export const WithStatusIndicator: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Compose Avatar + Badge to show a status indicator. The Badge is positioned absolutely at the corner — this is composition, not styling override.',
			},
		},
	},
	render: (args) => ({
		components: { Avatar, Badge },
		setup: () => ({ args }),
		template: `
      <div class="relative inline-flex">
        <Avatar v-bind="args" />
        <Badge
          variant="success"
          shape="pill"
          size="xs"
          class="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
        >
          ●
        </Badge>
      </div>
    `,
	}),
};

export const Group: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Stack avatars with a small overlap (`-ms-2`). The group should ideally have a labelled count after a few faces.',
			},
		},
	},
	render: () => ({
		components: { Avatar },
		setup: () => ({ SAMPLE_IMAGE }),
		template: `
      <div class="flex items-center">
        <Avatar name="Kelly King" :src="SAMPLE_IMAGE" class="ring-2 ring-background" />
        <Avatar name="Sam Olsen" class="-ms-2 ring-2 ring-background" />
        <Avatar name="Toby Cobb" class="-ms-2 ring-2 ring-background" />
        <span class="ms-2 text-sm text-muted-foreground">+ 12 more</span>
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveImageRenders: Story = {
	tags: ['!autodocs', 'test'],
	args: { src: SAMPLE_IMAGE, name: 'Kelly King' },
	play: async ({ canvasElement }) => {
		// The fallback always mounts in DOM; image is loaded async by reka-ui.
		// Once the image completes, the fallback is hidden and the image is
		// present with the alt text.
		const root = canvasElement.querySelector('[data-slot="avatar"]') as HTMLElement;
		await expect(root).toBeInTheDocument();
		// wait for the image to load
		const img = await within(canvasElement).findByRole('img', {}, { timeout: 5000 });
		await expect(img).toHaveAttribute('alt', 'Kelly King');
	},
};

export const InteractiveFallbackRenders: Story = {
	tags: ['!autodocs', 'test'],
	args: { src: undefined, name: 'Sam Olsen' },
	play: async ({ canvasElement }) => {
		const fallback = canvasElement.querySelector('[data-slot="avatar-fallback"]') as HTMLElement;
		await expect(fallback).toBeInTheDocument();
		await expect(fallback.textContent?.trim()).toBe('SO');
	},
};

export const InteractiveExplicitInitialsOverridesName: Story = {
	tags: ['!autodocs', 'test'],
	args: { src: undefined, name: 'Kelly King', initials: 'KK' },
	play: async ({ canvasElement }) => {
		const fallback = canvasElement.querySelector('[data-slot="avatar-fallback"]') as HTMLElement;
		await expect(fallback.textContent?.trim()).toBe('KK');
	},
};

export const InteractiveAltText: Story = {
	tags: ['!autodocs', 'test'],
	args: { src: SAMPLE_IMAGE, name: 'Kelly King', alt: 'Photograph of Kelly King smiling' },
	play: async ({ canvasElement }) => {
		const img = await within(canvasElement).findByRole(
			'img',
			{ name: 'Photograph of Kelly King smiling' },
			{ timeout: 5000 },
		);
		await expect(img).toBeInTheDocument();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Avatar },
		setup: () => ({ ALL_SIZES, SAMPLE_IMAGE }),
		template: `
      <div data-test-root class="flex items-end gap-2 p-2">
        <Avatar v-for="s in ALL_SIZES" :key="s" :size="s" name="Kelly King" :src="SAMPLE_IMAGE" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const avatars = root.querySelectorAll('[data-slot="avatar"]');
			await expect(avatars.length).toBe(5);
		});
	},
};
