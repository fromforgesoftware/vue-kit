import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import Tabs from './Tabs.vue';
import TabsList from './TabsList.vue';
import TabsTrigger from './TabsTrigger.vue';
import TabsContent from './TabsContent.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'pill', 'underlined', 'ghost'] as const;
const ALL_SIZES = ['sm', 'default'] as const;
const ALL_ORIENTATIONS = ['horizontal', 'vertical'] as const;

const meta = {
	title: 'General/Tabs',
	component: Tabs,
	tags: ['!autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Switches between mutually exclusive content panels. Built on Reka UI — keyboard navigation and ARIA tab pattern handled internally.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual treatment.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density tier.',
		},
		orientation: {
			control: 'select',
			options: ALL_ORIENTATIONS,
			description: 'Layout axis. `vertical` puts the list on the side.',
		},
		activationMode: {
			control: 'select',
			options: ['automatic', 'manual'],
			description:
				'`automatic` activates on focus (arrow keys); `manual` requires Enter/Space — use for tabs that load expensive content.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		variant: 'default',
		size: 'default',
		orientation: 'horizontal',
		activationMode: 'automatic',
		defaultValue: 'overview',
		'onUpdate:modelValue': fn(),
	},
	render: (args) => ({
		components: { Tabs, TabsList, TabsTrigger, TabsContent },
		setup: () => ({ args }),
		template: `
      <Tabs v-bind="args" class="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><p class="p-4 text-sm">Overview content</p></TabsContent>
        <TabsContent value="activity"><p class="p-4 text-sm">Activity content</p></TabsContent>
        <TabsContent value="settings"><p class="p-4 text-sm">Settings content</p></TabsContent>
      </Tabs>
    `,
	}),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Four visual treatments — pick the one that matches the surrounding chrome.',
			},
		},
	},
	render: () => ({
		components: { Tabs, TabsList, TabsTrigger, TabsContent },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-8 w-full max-w-2xl">
        <div v-for="v in ALL_VARIANTS" :key="v" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">{{ v }}</span>
          <Tabs :variant="v" default-value="a">
            <TabsList>
              <TabsTrigger value="a">First</TabsTrigger>
              <TabsTrigger value="b">Second</TabsTrigger>
              <TabsTrigger value="c">Third</TabsTrigger>
            </TabsList>
            <TabsContent value="a"><p class="p-3 text-sm">First panel</p></TabsContent>
            <TabsContent value="b"><p class="p-3 text-sm">Second panel</p></TabsContent>
            <TabsContent value="c"><p class="p-3 text-sm">Third panel</p></TabsContent>
          </Tabs>
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Two density tiers. `sm` is for dense layouts (toolbars, side-panels); `default` is general-purpose.',
			},
		},
	},
	render: () => ({
		components: { Tabs, TabsList, TabsTrigger, TabsContent },
		template: `
      <div class="flex flex-col gap-6 w-full max-w-md">
        <Tabs default-value="a" size="sm">
          <TabsList>
            <TabsTrigger value="a">Small</TabsTrigger>
            <TabsTrigger value="b">density</TabsTrigger>
          </TabsList>
          <TabsContent value="a"><p class="p-3 text-xs">Small panel</p></TabsContent>
          <TabsContent value="b"><p class="p-3 text-xs">Other panel</p></TabsContent>
        </Tabs>
        <Tabs default-value="a" size="default">
          <TabsList>
            <TabsTrigger value="a">Default</TabsTrigger>
            <TabsTrigger value="b">density</TabsTrigger>
          </TabsList>
          <TabsContent value="a"><p class="p-3 text-sm">Default panel</p></TabsContent>
          <TabsContent value="b"><p class="p-3 text-sm">Other panel</p></TabsContent>
        </Tabs>
      </div>
    `,
	}),
};

export const Orientations: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`horizontal` is the default; `vertical` puts the list down the side — useful for settings or wizard layouts.',
			},
		},
	},
	render: () => ({
		components: { Tabs, TabsList, TabsTrigger, TabsContent },
		template: `
      <div class="flex flex-col gap-8">
        <Tabs default-value="a" variant="pill">
          <TabsList>
            <TabsTrigger value="a">Horizontal</TabsTrigger>
            <TabsTrigger value="b">tabs</TabsTrigger>
            <TabsTrigger value="c">layout</TabsTrigger>
          </TabsList>
          <TabsContent value="a"><p class="p-3 text-sm">Panel A</p></TabsContent>
          <TabsContent value="b"><p class="p-3 text-sm">Panel B</p></TabsContent>
          <TabsContent value="c"><p class="p-3 text-sm">Panel C</p></TabsContent>
        </Tabs>
        <div class="flex h-64">
          <Tabs default-value="a" variant="pill" orientation="vertical" class="h-full">
            <TabsList>
              <TabsTrigger value="a">Profile</TabsTrigger>
              <TabsTrigger value="b">Security</TabsTrigger>
              <TabsTrigger value="c">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="a"><p class="p-3 text-sm">Profile content</p></TabsContent>
            <TabsContent value="b"><p class="p-3 text-sm">Security content</p></TabsContent>
            <TabsContent value="c"><p class="p-3 text-sm">Notifications content</p></TabsContent>
          </Tabs>
        </div>
      </div>
    `,
	}),
};

export const ManualActivation: Story = {
	args: { activationMode: 'manual' },
	parameters: {
		docs: {
			description: {
				story:
					'`manual` activation: arrow keys move focus, but Enter/Space is required to activate the tab. Use when each panel triggers a network request or expensive render.',
			},
		},
	},
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="tabs"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="tabs-list"]')).not.toBeNull();
		// The Reka TabsIndicator mounts only once the active tab's geometry is
		// measured (one resize-observer tick). Wait for that before asserting.
		await waitFor(() =>
			expect(canvasElement.querySelector('[data-slot="tabs-indicator"]')).not.toBeNull(),
		);
		const triggers = canvasElement.querySelectorAll('[data-slot="tabs-trigger"]');
		await expect(triggers.length).toBe(3);
		await expect(canvasElement.querySelector('[data-slot="tabs-content"]')).not.toBeNull();
	},
};

export const InteractiveAriaState: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const tabs = canvas.getAllByRole('tab');
		await expect(tabs.length).toBe(3);
		await expect(tabs[0].getAttribute('aria-selected')).toBe('true');
		await expect(tabs[1].getAttribute('aria-selected')).toBe('false');

		const controls = tabs[0].getAttribute('aria-controls');
		await expect(controls).toBeTruthy();
		const panel = canvasElement.querySelector(`#${CSS.escape(controls!)}`);
		await expect(panel).not.toBeNull();
		await expect(panel?.getAttribute('aria-labelledby')).toBe(tabs[0].id);
	},
};

export const InteractiveArrowKeysActivate: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'In automatic mode, ArrowRight/Left moves selection; Home/End jump to ends.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const tabs = canvas.getAllByRole('tab');

		tabs[0].focus();
		await expect(tabs[0]).toHaveFocus();
		await expect(tabs[0].getAttribute('aria-selected')).toBe('true');

		await userEvent.keyboard('{ArrowRight}');
		await expect(tabs[1]).toHaveFocus();
		await expect(tabs[1].getAttribute('aria-selected')).toBe('true');

		await userEvent.keyboard('{ArrowRight}');
		await expect(tabs[2]).toHaveFocus();

		await userEvent.keyboard('{Home}');
		await expect(tabs[0]).toHaveFocus();

		await userEvent.keyboard('{End}');
		await expect(tabs[2]).toHaveFocus();

		await userEvent.keyboard('{ArrowLeft}');
		await expect(tabs[1]).toHaveFocus();
	},
};

export const InteractiveManualKeyboardActivation: Story = {
	tags: ['!autodocs', 'test'],
	args: { activationMode: 'manual' },
	parameters: {
		docs: {
			description: {
				story: 'In manual mode, focus moves on arrows but selection only changes on Enter/Space.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const tabs = canvas.getAllByRole('tab');

		tabs[0].focus();
		await expect(tabs[0].getAttribute('aria-selected')).toBe('true');

		await userEvent.keyboard('{ArrowRight}');
		await expect(tabs[1]).toHaveFocus();
		// Manual mode: focus moved but selection stayed on tab[0]
		await expect(tabs[0].getAttribute('aria-selected')).toBe('true');
		await expect(tabs[1].getAttribute('aria-selected')).toBe('false');

		await userEvent.keyboard('{Enter}');
		await expect(tabs[1].getAttribute('aria-selected')).toBe('true');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Tabs lay out across all viewports. Many tabs scroll horizontally on narrow viewports rather than wrap.',
			},
		},
	},
	render: () => ({
		components: { Tabs, TabsList, TabsTrigger, TabsContent },
		template: `
      <div data-test-root class="w-full p-2">
        <Tabs default-value="a" variant="underlined">
          <TabsList>
            <TabsTrigger value="a">Overview</TabsTrigger>
            <TabsTrigger value="b">Activity</TabsTrigger>
            <TabsTrigger value="c">Notifications</TabsTrigger>
            <TabsTrigger value="d">Settings</TabsTrigger>
            <TabsTrigger value="e">Billing</TabsTrigger>
            <TabsTrigger value="f">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="a"><p class="p-3 text-sm">A</p></TabsContent>
          <TabsContent value="b"><p class="p-3 text-sm">B</p></TabsContent>
          <TabsContent value="c"><p class="p-3 text-sm">C</p></TabsContent>
          <TabsContent value="d"><p class="p-3 text-sm">D</p></TabsContent>
          <TabsContent value="e"><p class="p-3 text-sm">E</p></TabsContent>
          <TabsContent value="f"><p class="p-3 text-sm">F</p></TabsContent>
        </Tabs>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			// The root div should never overflow horizontally; the inner list
			// (overflow-x-auto) handles its own scroll when tabs don't fit.
			expectNoHorizontalOverflow(root);
			const tabs = root.querySelectorAll<HTMLButtonElement>('[data-slot="tabs-trigger"]');
			await expect(tabs.length).toBe(6);
			for (const t of tabs) {
				const r = t.getBoundingClientRect();
				await expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
