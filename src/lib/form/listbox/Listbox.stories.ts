import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import Listbox from './Listbox.vue';
import ListboxItem from './ListboxItem.vue';
import ListboxGroup from './ListboxGroup.vue';
import ListboxLabel from './ListboxLabel.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const components = { Listbox, ListboxItem, ListboxGroup, ListboxLabel, Label };

const numbers = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

const meta = {
	title: 'Form/Listbox',
	component: Listbox,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Visible, keyboard-navigable list of selectable options. Built on Reka UI <code>Listbox</code>. Inline (not portaled). Use it when the user benefits from seeing all (or most) options at once and a Select would feel hidden.',
			},
		},
	},
	argTypes: {
		multiple: { control: 'boolean' },
		disabled: { control: 'boolean' },
		error: { control: 'boolean' },
		size: { control: 'select', options: ALL_SIZES },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		multiple: false,
		disabled: false,
		error: false,
		size: 'default',
		'onUpdate:modelValue': fn(),
	},
	render: (args) => ({
		components,
		setup() {
			const value = ref<string | string[]>('');
			return { args, value, numbers };
		},
		template: `
      <Listbox v-bind="args" v-model="value" class="w-64" aria-label="Numbers">
        <ListboxItem v-for="n in numbers" :key="n" :value="n">{{ n }}</ListboxItem>
      </Listbox>
    `,
	}),
} satisfies Meta<typeof Listbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Three height tiers — controls how many items fit before scrolling.' },
		},
	},
	render: () => ({
		components,
		setup: () => ({ ALL_SIZES, numbers }),
		template: `
      <div class="grid w-64 gap-3">
        <div v-for="s in ALL_SIZES" :key="s">
          <p class="mb-1 text-xs text-muted-foreground">size: {{ s }}</p>
          <Listbox :size="s" :aria-label="'Numbers ' + s">
            <ListboxItem v-for="n in numbers" :key="n" :value="n">{{ n }}</ListboxItem>
          </Listbox>
        </div>
      </div>
    `,
	}),
};

export const Multiple: Story = {
	args: { multiple: true },
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		// Disabled controls are exempt from color-contrast under WCAG 1.4.3.
		// Reka's ListboxItem sets `data-disabled` (not `disabled` attr) on
		// <div role="option">, so axe-core's built-in disabled-skip does not
		// recognise the exemption. The visual fade is intentional UX feedback.
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
	},
};

export const WithError: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets <code>aria-invalid="true"</code> on the root and tints the border destructive. Pair with helper text via <code>describedBy</code>.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ numbers }),
		// Note: a native <label for> only labels native form controls, not a
		// role="listbox" custom element — axe flags it as unnamed. We give the
		// listbox an aria-label sourced from the visible label text.
		template: `
      <div class="grid w-64 gap-2">
        <Label id="lbx-error-label" for="lbx-error" required>Pick a number</Label>
        <Listbox id="lbx-error" error described-by="lbx-error-msg" aria-label="Pick a number">
          <ListboxItem v-for="n in numbers.slice(0, 5)" :key="n" :value="n">{{ n }}</ListboxItem>
        </Listbox>
        <p id="lbx-error-msg" class="text-xs text-destructive">Please pick a number.</p>
      </div>
    `,
	}),
};

export const WithGroups: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Compose <code>ListboxGroup</code> + <code>ListboxLabel</code> for sectioned content.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <Listbox class="w-64" aria-label="Food">
        <ListboxGroup>
          <ListboxLabel>Fruits</ListboxLabel>
          <ListboxItem value="apple">Apple</ListboxItem>
          <ListboxItem value="banana">Banana</ListboxItem>
        </ListboxGroup>
        <ListboxGroup>
          <ListboxLabel>Vegetables</ListboxLabel>
          <ListboxItem value="carrot">Carrot</ListboxItem>
          <ListboxItem value="potato">Potato</ListboxItem>
        </ListboxGroup>
      </Listbox>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveInline: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		// Listbox is NOT portaled — content lives inside the canvas.
		const listbox = canvasElement.querySelector('[data-slot="listbox"]');
		expect(listbox).toBeInTheDocument();
		expect(canvasElement.querySelector('[data-slot="listbox-content"]')).toBeInTheDocument();
		const items = within(canvasElement as HTMLElement).getAllByRole('option');
		expect(items.length).toBeGreaterThan(0);
	},
};

export const InteractiveArrowAndSelect: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ args, canvasElement }) => {
		const listbox = canvasElement.querySelector('[data-slot="listbox"]') as HTMLElement;
		listbox.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		});
	},
};

export const InteractiveMultipleToggles: Story = {
	tags: ['!autodocs', 'test'],
	args: { multiple: true },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ args, canvasElement }) => {
		const listbox = canvasElement.querySelector('[data-slot="listbox"]') as HTMLElement;
		listbox.focus();
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('[data-slot="listbox"]')).toBeInTheDocument();
		expect(canvasElement.querySelector('[data-slot="listbox-content"]')).toBeInTheDocument();
		expect(canvasElement.querySelector('[data-slot="listbox-item"]')).toBeInTheDocument();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="listbox"]') as HTMLElement;
		expect(root).toHaveAttribute('aria-invalid', 'true');
		expect(root).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	parameters: {
		// Disabled controls are exempt from color-contrast under WCAG 1.4.3.
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="listbox"]') as HTMLElement;
		expect(root).toHaveAttribute('data-disabled');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="listbox-item"]');
		expect(items.length).toBeGreaterThan(0);
		for (const i of items) expectMinTargetSize(i, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup: () => ({ numbers }),
		template: `
      <div data-test-root class="p-2">
        <Listbox class="w-full" aria-label="Numbers">
          <ListboxItem v-for="n in numbers.slice(0, 4)" :key="n" :value="n">{{ n }}</ListboxItem>
        </Listbox>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const items = root.querySelectorAll<HTMLElement>('[data-slot="listbox-item"]');
			for (const i of items) expectMinTargetSize(i, 24);
		});
	},
};
