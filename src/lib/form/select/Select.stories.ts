import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import Select from './Select.vue';
import SelectTrigger from './SelectTrigger.vue';
import SelectValue from './SelectValue.vue';
import SelectContent from './SelectContent.vue';
import SelectItem from './SelectItem.vue';
import SelectGroup from './SelectGroup.vue';
import SelectLabel from './SelectLabel.vue';
import SelectSeparator from './SelectSeparator.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const components = {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	SelectGroup,
	SelectLabel,
	SelectSeparator,
	Label,
};

const fruits = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry' },
	{ value: 'date', label: 'Date' },
	{ value: 'elderberry', label: 'Elderberry' },
	{ value: 'fig', label: 'Fig' },
	{ value: 'grape', label: 'Grape' },
];

const meta = {
	title: 'Form/Select',
	component: Select,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Single- or multi-select dropdown built on Reka UI <code>Select</code>. Content portals to <code>document.body</code> so it escapes <code>overflow: hidden</code> ancestors. Trigger sizes match Input.',
			},
		},
	},
	argTypes: {
		multiple: { control: 'boolean', description: 'Allow multiple selections.' },
		disabled: { control: 'boolean', description: 'Disable the entire select.' },
		required: { control: 'boolean', description: 'Required attribute.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		multiple: false,
		disabled: false,
		required: false,
		'onUpdate:modelValue': fn(),
		'onUpdate:open': fn(),
	},
	render: (args) => ({
		components,
		setup() {
			const value = ref<string | undefined>(undefined);
			return { args, value, fruits };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="select-default">Favourite fruit</Label>
        <Select v-bind="args" v-model="value">
          <SelectTrigger id="select-default">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three trigger heights — match the Input sizes used elsewhere on the form.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ ALL_SIZES, fruits }),
		template: `
      <div class="grid w-72 gap-3">
        <div v-for="s in ALL_SIZES" :key="s" class="grid gap-1.5">
          <Label :for="'select-size-' + s">{{ 'Size: ' + s }}</Label>
          <Select>
            <SelectTrigger :id="'select-size-' + s" :size="s">
              <SelectValue :placeholder="'Size: ' + s" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const WithError: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The trigger surfaces validation failure with the <code>error</code> prop, which sets <code>aria-invalid</code> and tints the border. Pair with a hint paragraph referenced via <code>describedBy</code>.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ fruits }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="fruit-error" required>Favourite fruit</Label>
        <Select>
          <SelectTrigger id="fruit-error" error described-by="fruit-error-msg">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
        <p id="fruit-error-msg" class="text-xs text-destructive">Please pick a fruit.</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	render: () => ({
		components,
		setup: () => ({ fruits }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="fruit-label">Favourite fruit</Label>
        <Select>
          <SelectTrigger id="fruit-label">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
};

export const WithGroups: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Compose <code>SelectGroup</code>, <code>SelectLabel</code> and <code>SelectSeparator</code> for sectioned content.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="select-groups">Food</Label>
        <Select>
          <SelectTrigger id="select-groups">
            <SelectValue placeholder="Pick a food" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="potato">Potato</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
};

export const Multiple: Story = {
	args: { multiple: true },
	parameters: {
		docs: {
			description: {
				story:
					'When <code>multiple</code> is set, modelValue is a string array and the trigger renders selected values as removable chips.',
			},
		},
	},
	render: (args) => ({
		components,
		setup() {
			const value = ref<string[]>([]);
			const labelOf = (code: string) => fruits.find((f) => f.value === code)?.label ?? code;
			return { args, value, fruits, labelOf };
		},
		template: `
      <div class="grid w-80 gap-1.5">
        <Label for="select-multiple">Favourite fruits</Label>
        <Select v-bind="args" v-model="value">
          <SelectTrigger id="select-multiple">
            <SelectValue placeholder="Pick fruits">
              <template #default="{ value }">{{ labelOf(value) }}</template>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpenAndSelect: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		a11y: {
			config: {
				// Reka FocusScope marks the canvas root aria-hidden when the overlay
				// opens; in a real app the canvas is not the focus container.
				rules: [{ id: 'aria-hidden-focus', enabled: false }],
			},
		},
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('combobox');
		await userEvent.click(trigger);
		const list = await waitFor(() => {
			const el = document.body.querySelector('[data-slot="select-content"]') as HTMLElement | null;
			if (!el) throw new Error('select content not found');
			return el;
		});
		expect(list).toBeInTheDocument();
		const options = await inBody().findAllByRole('option');
		expect(options.length).toBeGreaterThan(0);
		await userEvent.click(options[1]);
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		});
	},
};

export const InteractiveKeyboardArrows: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		a11y: {
			config: {
				// Reka FocusScope marks the canvas root aria-hidden when the overlay
				// opens; in a real app the canvas is not the focus container.
				rules: [{ id: 'aria-hidden-focus', enabled: false }],
			},
		},
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('combobox');
		trigger.focus();
		await userEvent.keyboard('{Enter}');
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="select-content"]');
			if (!el) throw new Error('select content not found');
			return el;
		});
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		});
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		a11y: {
			config: {
				// Reka FocusScope marks the canvas root aria-hidden when the overlay
				// opens; in a real app the canvas is not the focus container.
				rules: [{ id: 'aria-hidden-focus', enabled: false }],
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('combobox');
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="select-content"]');
			if (!el) throw new Error('select content not found');
			return el;
		});
		await userEvent.keyboard('{Escape}');
		// Reka Presence animates the exit — DismissableLayer can persist briefly
		// after the close. Assert via aria-expanded on the trigger rather than DOM
		// removal of the content.
		await waitFor(() => {
			expect(trigger).toHaveAttribute('aria-expanded', 'false');
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('[data-slot="select-trigger"]')).toBeInTheDocument();
		expect(canvasElement.querySelector('[data-slot="select-trigger-icon"]')).toBeInTheDocument();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup: () => ({ fruits }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="select-i-error">Pick</Label>
        <Select>
          <SelectTrigger id="select-i-error" error described-by="hint">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="select-trigger"]') as HTMLElement;
		expect(trigger).toHaveAttribute('aria-invalid', 'true');
		expect(trigger).toHaveAttribute('aria-describedby', 'hint');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="select-trigger"]') as HTMLElement;
		expect(trigger).toHaveAttribute('data-disabled');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup: () => ({ ALL_SIZES, fruits }),
		template: `
      <div data-test-root class="grid w-72 gap-3">
        <Select v-for="s in ALL_SIZES" :key="s">
          <SelectTrigger :size="s" :aria-label="'Size ' + s"><SelectValue :placeholder="s" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const triggers = canvasElement.querySelectorAll<HTMLElement>('[data-slot="select-trigger"]');
		expect(triggers.length).toBe(3);
		for (const t of triggers) expectMinTargetSize(t, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup: () => ({ fruits }),
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <Select>
          <SelectTrigger aria-label="Fruit"><SelectValue placeholder="Pick a fruit" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in fruits" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector('[data-slot="select-trigger"]') as HTMLElement;
			expectMinTargetSize(trigger, 24);
		});
	},
};
