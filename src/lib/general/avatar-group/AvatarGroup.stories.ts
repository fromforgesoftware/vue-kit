import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import AvatarGroup from './AvatarGroup.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';
import type { AvatarGroupItem } from './avatar-group.js';

const ALL_SIZES = ['xs', 'sm', 'default', 'lg', 'xl'] as const;
const ALL_SHAPES = ['circle', 'rounded', 'square'] as const;

const SAMPLE_ITEMS: AvatarGroupItem[] = [
	{ name: 'Alice Adams', description: 'alice@acme.io' },
	{ name: 'Bob Brown', description: 'bob@acme.io' },
	{ name: 'Carol Cole', description: 'carol@acme.io' },
	{ name: 'Dan Davis', description: 'dan@acme.io' },
	{ name: 'Eve Evans', description: 'eve@acme.io' },
	{ name: 'Frank Foster', description: 'frank@acme.io' },
	{ name: 'Gina Grant', description: 'gina@acme.io' },
];

const HUGE_LIST: AvatarGroupItem[] = Array.from({ length: 10005 }, (_, i) => ({
	name: `Member ${i + 1}`,
	description: `member-${i + 1}@acme.io`,
}));

const meta = {
	title: 'General/AvatarGroup',
	component: AvatarGroup,
	tags: ['!autodocs'],
	argTypes: {
		items: { control: 'object' },
		max: { control: { type: 'number', min: 0, max: 12 } },
		overflowCap: { control: { type: 'number', min: 9, max: 999 } },
		size: { control: 'select', options: ALL_SIZES },
		shape: { control: 'select', options: ALL_SHAPES },
		tooltips: { control: 'boolean' },
		tooltipSide: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
	},
	args: {
		items: SAMPLE_ITEMS,
		max: 4,
		overflowCap: 99,
		size: 'default',
		shape: 'circle',
		tooltips: true,
		tooltipSide: 'bottom',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Stack of overlapping avatars with a trailing overflow indicator. Use to represent a small group of people or entities inline. Past three or four faces the overflow indicator takes over; the count caps at `overflowCap` so the badge stays readable.',
			},
		},
	},
	render: (args) => ({
		components: { AvatarGroup },
		setup: () => ({ args }),
		template: `<AvatarGroup v-bind="args" />`,
	}),
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UnderMax: Story = {
	args: { items: SAMPLE_ITEMS.slice(0, 3) },
	parameters: {
		docs: {
			description: {
				story: 'When the number of items is at or below `max`, no overflow badge is rendered.',
			},
		},
	},
};

export const Overflow: Story = {
	args: { items: SAMPLE_ITEMS, max: 4 },
	parameters: {
		docs: {
			description: {
				story:
					'When items exceed `max`, the remaining count collapses into a `+N` badge. The full list is reachable from the badge tooltip.',
			},
		},
	},
};

export const OverflowCapped: Story = {
	args: { items: HUGE_LIST, max: 4, overflowCap: 99 },
	parameters: {
		docs: {
			description: {
				story:
					'`overflowCap` keeps the badge readable when the underlying collection is huge. With 10 005 items and a cap of 99 the badge renders `+99`.',
			},
		},
	},
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Five sizes scale uniformly. The overlap distance shrinks at smaller sizes so initials remain readable.',
			},
		},
	},
	render: (args) => ({
		components: { AvatarGroup },
		setup: () => ({ args, ALL_SIZES }),
		template: `
      <div class="flex flex-col gap-3">
        <AvatarGroup v-for="s in ALL_SIZES" :key="s" v-bind="args" :size="s" />
      </div>
    `,
	}),
};

export const Shapes: Story = {
	parameters: {
		docs: {
			description: {
				story: '`circle` for people; `rounded` for teams or orgs; `square` for brand glyphs.',
			},
		},
	},
	render: (args) => ({
		components: { AvatarGroup },
		setup: () => ({ args, ALL_SHAPES }),
		template: `
      <div class="flex flex-col gap-3">
        <AvatarGroup v-for="sh in ALL_SHAPES" :key="sh" v-bind="args" :shape="sh" />
      </div>
    `,
	}),
};

export const WithImages: Story = {
	args: {
		items: [
			{
				name: 'Kelly King',
				src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
			},
			{ name: 'Sam Olsen' },
			{ name: 'Toby Cobb' },
			{ name: 'Dan Davis' },
			{ name: 'Eve Evans' },
		],
	},
	parameters: {
		docs: {
			description: {
				story:
					'Mixed image + initials avatars. Faces with `src` use the image; the rest fall back to initials.',
			},
		},
	},
};

export const TooltipsDisabled: Story = {
	args: { tooltips: false },
	parameters: {
		docs: {
			description: {
				story:
					'Disable tooltips when the group sits inside a richer parent affordance (a row link, a card with its own popover) and the duplicated info would be noisy.',
			},
		},
	},
};

export const CustomOverflowTooltip: Story = {
	args: { items: SAMPLE_ITEMS, max: 3 },
	render: (args) => ({
		components: { AvatarGroup },
		setup: () => ({ args }),
		template: `
      <AvatarGroup v-bind="args">
        <template #overflow-tooltip="{ items, count }">
          <div class="text-xs">
            <div class="font-medium">{{ count }} more members</div>
            <ul class="mt-1 list-disc ps-4">
              <li v-for="(item, i) in items" :key="i">{{ item.name }}</li>
            </ul>
          </div>
        </template>
      </AvatarGroup>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Override `overflow-tooltip` to project richer content (counts, headings, sectioned lists). Slot props expose both the remaining items and the count.',
			},
		},
	},
};

// ── Interactive (hidden from autodocs, run as play tests) ───────────────────

export const InteractiveOverflowCap: Story = {
	tags: ['!autodocs', 'test'],
	args: { items: HUGE_LIST, max: 4, overflowCap: 99 },
	play: async ({ canvasElement }) => {
		const overflow = canvasElement.querySelector(
			'[data-slot="avatar-group-overflow"]',
		) as HTMLElement;
		await expect(overflow).toBeInTheDocument();
		await expect(overflow.textContent?.trim()).toBe('+99');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { AvatarGroup },
		setup: () => ({ SAMPLE_ITEMS }),
		template: `
      <div data-test-root class="p-2">
        <AvatarGroup :items="SAMPLE_ITEMS" :max="4" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const items = root.querySelectorAll('[data-slot="avatar-group-item"]');
			await expect(items.length).toBe(4);
			const overflow = root.querySelector('[data-slot="avatar-group-overflow"]');
			await expect(overflow).toBeInTheDocument();
		});
	},
};
