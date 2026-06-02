import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { Component } from 'vue';
import { expect } from 'storybook/test';
import { House, Settings, User, AlertCircle } from '@lucide/vue';
import Icon from './Icon.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['2xs', 'xs', 'xs-sm', 'sm', 'md', 'default', 'lg', 'xl', 'none'] as const;

const meta = {
	title: 'General/Icon',
	component: Icon,
	tags: ['!autodocs'],
	argTypes: {
		icon: {
			control: false,
			description: 'Lucide icon component (or any component that accepts a `class` prop).',
		},
		size: { control: 'select', options: ALL_SIZES, description: 'Sizing token.' },
		strokeWidth: { control: { type: 'number', min: 0.5, step: 0.25 } },
	},
	args: {
		icon: House as Component,
		size: 'default',
		strokeWidth: 2,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Thin wrapper around Lucide icons that applies the design-system size scale and stroke width. Always pair with `aria-hidden="true"` when decorative — keep meaningful icons accessible by setting `role` and `aria-label` on the parent.',
			},
		},
	},
	render: (args) => ({
		components: { Icon },
		setup: () => ({ args }),
		template: `<Icon v-bind="args" />`,
	}),
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The full size scale. Pair with text size: `xs` for `text-xs`; `default` for body; `xl` for hero contexts.',
			},
		},
	},
	render: () => ({
		components: { Icon },
		setup: () => ({ ALL_SIZES, House }),
		template: `
      <div class="flex items-end gap-3 flex-wrap">
        <div v-for="s in ALL_SIZES" :key="s" class="flex flex-col items-center gap-1">
          <Icon :icon="House" :size="s" class="text-foreground" />
          <span class="text-xs text-muted-foreground">{{ s }}</span>
        </div>
      </div>
    `,
	}),
};

export const StrokeWidth: Story = {
	parameters: {
		docs: {
			description: { story: 'Stroke width is configurable; the design system default is 2.' },
		},
	},
	render: () => ({
		components: { Icon },
		setup: () => ({ House }),
		template: `
      <div class="flex items-center gap-4">
        <Icon :icon="House" size="lg" :stroke-width="1" />
        <Icon :icon="House" size="lg" :stroke-width="1.5" />
        <Icon :icon="House" size="lg" :stroke-width="2" />
        <Icon :icon="House" size="lg" :stroke-width="2.5" />
        <Icon :icon="House" size="lg" :stroke-width="3" />
      </div>
    `,
	}),
};

export const Colored: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Icons inherit `currentColor` — colour them via Tailwind text utilities on the consumer.',
			},
		},
	},
	render: () => ({
		components: { Icon },
		setup: () => ({ AlertCircle, Settings, User }),
		template: `
      <div class="flex items-center gap-4">
        <Icon :icon="AlertCircle" class="text-destructive" />
        <Icon :icon="Settings" class="text-primary" />
        <Icon :icon="User" class="text-muted-foreground" />
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRenders: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const svg = canvasElement.querySelector('svg') as SVGElement;
		await expect(svg).toBeInTheDocument();
	},
};

export const InteractiveSizeApplies: Story = {
	tags: ['!autodocs', 'test'],
	args: { size: 'lg' },
	play: async ({ canvasElement }) => {
		const svg = canvasElement.querySelector('svg') as SVGElement;
		await expect(svg.getAttribute('class')).toContain('size-8');
	},
};

export const InteractiveStrokeWidthApplies: Story = {
	tags: ['!autodocs', 'test'],
	args: { strokeWidth: 1.5 },
	play: async ({ canvasElement }) => {
		const svg = canvasElement.querySelector('svg') as SVGElement;
		await expect(svg.getAttribute('stroke-width')).toBe('1.5');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Icon },
		setup: () => ({ House, ALL_SIZES }),
		template: `
      <div data-test-root class="flex items-end gap-2 p-2 flex-wrap">
        <Icon v-for="s in ALL_SIZES" :key="s" :icon="House" :size="s" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const icons = root.querySelectorAll('svg');
			await expect(icons.length).toBe(ALL_SIZES.length);
		});
	},
};
