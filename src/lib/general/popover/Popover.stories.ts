import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { Settings2 } from '@lucide/vue';
import Popover from './Popover.vue';
import PopoverTrigger from './PopoverTrigger.vue';
import PopoverContent from './PopoverContent.vue';
import Button from '../button/Button.vue';
import Input from '../../form/input/Input.vue';
import Label from '../../form/label/Label.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const ALL_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const ALL_ALIGNS = ['start', 'center', 'end'] as const;
const ALL_SIZES = ['sm', 'default', 'lg', 'xl', 'auto'] as const;

const meta = {
	title: 'General/Popover',
	component: Popover,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A floating panel anchored to a trigger. Opens on click, closes on Escape, outside click, or the close button. Built on Reka UI — content portals to <code>document.body</code> so it can escape <code>overflow: hidden</code> ancestors.',
			},
		},
	},
	argTypes: {
		modal: {
			control: 'boolean',
			description:
				'When true, focus is trapped and the rest of the page is inert. Default false (non-modal).',
		},
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		modal: false,
		'onUpdate:open': fn(),
	},
	render: (args) => ({
		components: { Popover, PopoverTrigger, PopoverContent, Button, Input, Label, Settings2 },
		setup: () => ({ args }),
		template: `
      <div class="flex justify-center p-12">
        <Popover v-bind="args">
          <PopoverTrigger>
            <Button variant="outline" size="icon" aria-label="Update dimensions">
              <Settings2 />
            </Button>
          </PopoverTrigger>
          <PopoverContent :side-offset="8">
            <div class="flex flex-col gap-3">
              <p class="text-sm font-semibold">Dimensions</p>
              <fieldset class="flex items-center gap-3">
                <Label class="w-20 text-xs" for="width">Width</Label>
                <Input id="width" model-value="100%" size="sm" class="flex-1" />
              </fieldset>
              <fieldset class="flex items-center gap-3">
                <Label class="w-20 text-xs" for="maxWidth">Max width</Label>
                <Input id="maxWidth" model-value="300px" size="sm" class="flex-1" />
              </fieldset>
              <fieldset class="flex items-center gap-3">
                <Label class="w-20 text-xs" for="height">Height</Label>
                <Input id="height" model-value="25px" size="sm" class="flex-1" />
              </fieldset>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    `,
	}),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sides: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Four sides — Reka flips automatically near viewport edges (<code>avoidCollisions</code> is on by default).',
			},
		},
	},
	render: () => ({
		components: { Popover, PopoverTrigger, PopoverContent, Button },
		setup: () => ({ ALL_SIDES }),
		template: `
      <div class="grid grid-cols-2 gap-6 p-12 place-items-center">
        <Popover v-for="s in ALL_SIDES" :key="s">
          <PopoverTrigger>
            <Button variant="outline">side: {{ s }}</Button>
          </PopoverTrigger>
          <PopoverContent :side="s" size="sm">
            <p class="text-sm">Popover on {{ s }}.</p>
          </PopoverContent>
        </Popover>
      </div>
    `,
	}),
};

export const Alignments: Story = {
	parameters: {
		docs: { description: { story: 'Alignment along the chosen side.' } },
	},
	render: () => ({
		components: { Popover, PopoverTrigger, PopoverContent, Button },
		setup: () => ({ ALL_ALIGNS }),
		template: `
      <div class="flex gap-6 p-12 justify-center">
        <Popover v-for="a in ALL_ALIGNS" :key="a">
          <PopoverTrigger>
            <Button variant="outline">align: {{ a }}</Button>
          </PopoverTrigger>
          <PopoverContent :align="a" size="sm">
            <p class="text-sm">align: {{ a }}</p>
          </PopoverContent>
        </Popover>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Five width tiers — pick the smallest that fits.' } },
	},
	render: () => ({
		components: { Popover, PopoverTrigger, PopoverContent, Button },
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-wrap gap-3 p-6 justify-center">
        <Popover v-for="s in ALL_SIZES" :key="s">
          <PopoverTrigger>
            <Button variant="outline">size: {{ s }}</Button>
          </PopoverTrigger>
          <PopoverContent :size="s">
            <p class="text-sm">Width tier: <strong>{{ s }}</strong>.</p>
          </PopoverContent>
        </Popover>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpensOnTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /update dimensions/i });
		await userEvent.click(trigger);
		const content = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="popover-content"]') as HTMLElement | null;
			if (!el) throw new Error('popover content not found');
			return el;
		});
		await expect(content).toBeInTheDocument();
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /update dimensions/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="popover-content"]');
			if (!el) throw new Error('popover content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="popover-content"]')).toBeNull();
		});
	},
};

export const InteractiveOutsideClickCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /update dimensions/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="popover-content"]');
			if (!el) throw new Error('popover content not found');
			return el;
		});
		// Click on the canvas root (outside the portaled content)
		await userEvent.click(canvasElement);
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="popover-content"]')).toBeNull();
		});
	},
};

export const InteractiveCloseButton: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /update dimensions/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="popover-content"]');
			if (!el) throw new Error('popover content not found');
			return el;
		});
		const close = await inBody().findByRole('button', { name: /close/i });
		await userEvent.click(close);
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="popover-content"]')).toBeNull();
		});
	},
};

export const InteractiveFocusReturnsToTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /update dimensions/i });
		trigger.focus();
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="popover-content"]');
			if (!el) throw new Error('popover content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(document.body.querySelector('[data-slot="popover-content"]')).toBeNull();
		});
		await waitFor(async () => {
			await expect(document.activeElement).toBe(trigger);
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /update dimensions/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="popover-content"]');
			if (!el) throw new Error('popover content not found');
			return el;
		});
		// popover-trigger is on the canvas (not portaled)
		await expect(canvasElement.querySelector('[data-slot="popover-trigger"]')).not.toBeNull();
		await expect(document.body.querySelector('[data-slot="popover-content"]')).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Trigger renders without overflow at every viewport. Content is portaled and never affects parent layout.',
			},
		},
	},
	render: () => ({
		components: { Popover, PopoverTrigger, PopoverContent, Button, Settings2 },
		template: `
      <div data-test-root class="p-2">
        <Popover>
          <PopoverTrigger>
            <Button variant="outline" size="icon" aria-label="Open settings">
              <Settings2 />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p class="text-sm">Portaled content — sits on document.body.</p>
          </PopoverContent>
        </Popover>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const btn = root.querySelector<HTMLButtonElement>('button')!;
			const r = btn.getBoundingClientRect();
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
