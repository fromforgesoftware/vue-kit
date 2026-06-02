import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import Drawer from './Drawer.vue';
import DrawerTrigger from './DrawerTrigger.vue';
import DrawerPanel from './DrawerPanel.vue';
import DrawerHeader from './DrawerHeader.vue';
import DrawerBody from './DrawerBody.vue';
import DrawerFooter from './DrawerFooter.vue';
import DrawerTitle from './DrawerTitle.vue';
import DrawerBack from './DrawerBack.vue';
import DrawerStepTrigger from './DrawerStepTrigger.vue';
import DrawerStepClose from './DrawerStepClose.vue';
import Button from '../button/Button.vue';
import Input from '../../form/input/Input.vue';
import Label from '../../form/label/Label.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const ALL_SIDES = ['left', 'right', 'top', 'bottom'] as const;
const ALL_SIZES = ['sm', 'md', 'lg', 'xl', 'full'] as const;

const meta = {
	title: 'General/Drawer',
	component: Drawer,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Side panel that slides in from any edge. Supports stacked side-step panels (right/left) for branched workflows. Below 640 px every side renders as a full-screen overlay.',
			},
		},
	},
	argTypes: {
		side: {
			control: 'select',
			options: ALL_SIDES,
			description: 'Edge the drawer docks to.',
		},
		overlay: { control: 'boolean', description: 'Show backdrop and close on click.' },
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		side: 'right',
		overlay: true,
		'onUpdate:open': fn(),
	},
	render: (args) => ({
		components: {
			Drawer,
			DrawerTrigger,
			DrawerPanel,
			DrawerHeader,
			DrawerBody,
			DrawerFooter,
			DrawerTitle,
			Button,
			Input,
			Label,
		},
		setup: () => {
			const isOpen = ref(false);
			const name = ref('John Doe');
			return { args, isOpen, name };
		},
		template: `
      <Drawer v-bind="args" v-model:open="isOpen">
        <DrawerTrigger>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Edit Profile</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="name">Full Name</Label>
                <Input id="name" v-model="name" placeholder="Enter your name" />
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" @click="isOpen = false">Cancel</Button>
            <Button>Save</Button>
          </DrawerFooter>
        </DrawerPanel>
      </Drawer>
    `,
	}),
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sides: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Pick the side that matches the page hierarchy: <code>right</code> for related detail, <code>left</code> for navigation, <code>top</code>/<code>bottom</code> for filters or actions.',
			},
		},
	},
	render: () => ({
		components: {
			Drawer,
			DrawerTrigger,
			DrawerPanel,
			DrawerHeader,
			DrawerBody,
			DrawerFooter,
			DrawerTitle,
			Button,
		},
		setup: () => ({ ALL_SIDES }),
		template: `
      <div class="flex flex-wrap gap-3 p-6">
        <Drawer v-for="s in ALL_SIDES" :key="s" :side="s">
          <DrawerTrigger>
            <Button variant="outline">side: {{ s }}</Button>
          </DrawerTrigger>
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Side: {{ s }}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody><p class="text-sm">Drawer docks to {{ s }} edge.</p></DrawerBody>
            <DrawerFooter>
              <Button variant="outline">Close</Button>
            </DrawerFooter>
          </DrawerPanel>
        </Drawer>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'For left / right drawers, size sets the width tier. For top / bottom drawers it sets the height tier.',
			},
		},
	},
	render: () => ({
		components: {
			Drawer,
			DrawerTrigger,
			DrawerPanel,
			DrawerHeader,
			DrawerBody,
			DrawerFooter,
			DrawerTitle,
			Button,
		},
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-wrap gap-3 p-6">
        <Drawer v-for="s in ALL_SIZES" :key="s">
          <DrawerTrigger>
            <Button variant="outline">size: {{ s }}</Button>
          </DrawerTrigger>
          <DrawerPanel :size="s">
            <DrawerHeader>
              <DrawerTitle>Size: {{ s }}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody><p class="text-sm">Width tier: <strong>{{ s }}</strong>.</p></DrawerBody>
            <DrawerFooter>
              <Button variant="outline">Close</Button>
            </DrawerFooter>
          </DrawerPanel>
        </Drawer>
      </div>
    `,
	}),
};

export const TwoLevelSideStep: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Side-step panels stack on the right with the parent peeking behind — only available for <code>side="right"</code> or <code>"left"</code>.',
			},
		},
	},
	render: () => ({
		components: {
			Drawer,
			DrawerTrigger,
			DrawerPanel,
			DrawerHeader,
			DrawerBody,
			DrawerFooter,
			DrawerTitle,
			DrawerBack,
			DrawerStepTrigger,
			DrawerStepClose,
			Button,
			Input,
			Label,
		},
		setup: () => {
			const isOpen = ref(false);
			const treatmentName = ref('');
			return { isOpen, treatmentName };
		},
		template: `
      <Drawer v-model:open="isOpen">
        <DrawerTrigger>
          <Button>Set Multiple Visits</Button>
        </DrawerTrigger>
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Set Multiple Visits</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label>Treatment Name</Label>
                <Input v-model="treatmentName" placeholder="Enter treatment name" />
              </div>
              <div class="flex items-center gap-3 rounded-lg border p-4">
                <div class="flex-1">
                  <p class="text-sm font-medium">Component Used</p>
                </div>
                <DrawerStepTrigger step="setup-component">
                  <Button variant="link">Setup</Button>
                </DrawerStepTrigger>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" @click="isOpen = false">Cancel</Button>
            <Button>Save</Button>
          </DrawerFooter>
        </DrawerPanel>
        <DrawerPanel name="setup-component" hide-close-button>
          <DrawerHeader>
            <DrawerBack />
            <DrawerTitle>Setup Component</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p class="text-sm text-muted-foreground">Add components for this visit.</p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerStepClose>
              <Button variant="outline">Cancel</Button>
            </DrawerStepClose>
            <DrawerStepClose>
              <Button>Save</Button>
            </DrawerStepClose>
          </DrawerFooter>
        </DrawerPanel>
      </Drawer>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpensOnTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		const panel = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-panel"]');
			if (!el) throw new Error('drawer panel not found');
			return el as HTMLElement;
		});
		await expect(panel).toBeInTheDocument();
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-panel"]');
			if (!el) throw new Error('drawer panel not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			const overlay = document.body.querySelector('[data-slot="drawer-overlay"]');
			await expect(overlay).toBeNull();
		});
	},
};

export const InteractiveOverlayClickCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		const overlay = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-overlay"]') as HTMLElement | null;
			if (!el) throw new Error('overlay not found');
			return el;
		});
		await userEvent.click(overlay);
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="drawer-overlay"]')).toBeNull();
		});
	},
};

export const InteractiveLeftSide: Story = {
	tags: ['!autodocs', 'test'],
	args: { side: 'left' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		const panel = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-panel"]');
			if (!el) throw new Error('panel not found');
			return el as HTMLElement;
		});
		// Left-side: panel sits on the left (sm:left-4)
		await expect(panel.className).toContain('sm:left-4');
	},
};

export const InteractiveTopSide: Story = {
	tags: ['!autodocs', 'test'],
	args: { side: 'top' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		const panel = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-panel"]');
			if (!el) throw new Error('panel not found');
			return el as HTMLElement;
		});
		await expect(panel.className).toContain('sm:top-4');
	},
};

export const InteractiveBottomSide: Story = {
	tags: ['!autodocs', 'test'],
	args: { side: 'bottom' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		const panel = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-panel"]');
			if (!el) throw new Error('panel not found');
			return el as HTMLElement;
		});
		await expect(panel.className).toContain('sm:bottom-4');
	},
};

export const InteractiveCloseButton: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		const close = await waitFor(() => {
			const panel = document.body.querySelector('[data-slot="drawer-panel"]');
			const btn = panel?.querySelector('button[aria-label="Close"]') as HTMLElement | null;
			if (!btn) throw new Error('close button not found');
			return btn;
		});
		await userEvent.click(close);
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="drawer-overlay"]')).toBeNull();
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByText('Open Drawer');
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="drawer-panel"]');
			if (!el) throw new Error('panel not found');
			return el;
		});
		for (const slot of [
			'drawer-panel',
			'drawer-overlay',
			'drawer-header',
			'drawer-body',
			'drawer-footer',
			'drawer-title',
		]) {
			await expect(document.body.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Below 640 px the drawer fills the screen regardless of side; above 640 px it docks to the chosen edge.',
			},
		},
	},
	render: () => ({
		components: {
			Drawer,
			DrawerTrigger,
			DrawerPanel,
			DrawerHeader,
			DrawerBody,
			DrawerFooter,
			DrawerTitle,
			Button,
		},
		setup: () => {
			const isOpen = ref(true);
			return { isOpen };
		},
		template: `
      <div data-test-root class="p-2">
        <Drawer v-model:open="isOpen">
          <DrawerTrigger>
            <Button>Open</Button>
          </DrawerTrigger>
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Responsive drawer</DrawerTitle>
            </DrawerHeader>
            <DrawerBody><p class="text-sm">Body content reflows to width.</p></DrawerBody>
            <DrawerFooter>
              <Button variant="outline">Close</Button>
            </DrawerFooter>
          </DrawerPanel>
        </Drawer>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const panel = await waitFor(() => {
				const el = document.body.querySelector('[data-slot="drawer-panel"]');
				if (!el) throw new Error('drawer panel not found');
				return el as HTMLElement;
			});
			const r = panel.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
		});
	},
};
