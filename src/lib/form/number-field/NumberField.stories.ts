import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent } from 'storybook/test';
import NumberField from './NumberField.vue';
import NumberFieldInput from './NumberFieldInput.vue';
import NumberFieldDecrement from './NumberFieldDecrement.vue';
import NumberFieldIncrement from './NumberFieldIncrement.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Form/Number Field',
	component: NumberField,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ALL_SIZES,
			description:
				'Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. All sizes meet WCAG 2.2 SC 2.5.8 (≥ 24×24) on +/- buttons.',
		},
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Visual style. Prefer the `error` boolean prop for validation errors.',
		},
		step: { control: 'number', description: 'Increment / decrement amount per step.' },
		min: { control: 'number', description: 'Minimum allowed value.' },
		max: { control: 'number', description: 'Maximum allowed value.' },
		disabled: { control: 'boolean', description: 'Disabled state.' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` on the input and applies error border.',
		},
		describedBy: {
			control: 'text',
			description: 'id of helper / error text describing this input.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		size: 'default',
		variant: 'default',
		step: 1,
		disabled: false,
		error: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Numeric input with inline +/- buttons. Built on Reka NumberField. Supports min/max/step, `Intl.NumberFormat` formatting, keyboard arrows, and Home/End to jump to bounds.',
			},
		},
	},
	render: (args) => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(0);
			return { args, value };
		},
		template: `
      <div class="grid w-36 gap-1.5">
        <Label for="numberfield-default">Quantity</Label>
        <NumberField
          v-model="value"
          v-bind="args"
          @update:model-value="args['onUpdate:modelValue']"
        >
          <NumberFieldDecrement />
          <NumberFieldInput id="numberfield-default" />
          <NumberFieldIncrement />
        </NumberField>
      </div>
    `,
	}),
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three density tiers. The +/- buttons grow with the input — even `sm` (28×28) meets WCAG 2.2 SC 2.5.8.',
			},
		},
	},
	render: () => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const sm = ref(0);
			const md = ref(0);
			const lg = ref(0);
			return { sm, md, lg };
		},
		template: `
      <div class="flex flex-col items-start gap-3">
        <div class="grid gap-1.5">
          <Label for="nf-sizes-sm">Small</Label>
          <NumberField v-model="sm" size="sm" class="w-36">
            <NumberFieldDecrement />
            <NumberFieldInput id="nf-sizes-sm" />
            <NumberFieldIncrement />
          </NumberField>
        </div>
        <div class="grid gap-1.5">
          <Label for="nf-sizes-default">Default</Label>
          <NumberField v-model="md" size="default" class="w-36">
            <NumberFieldDecrement />
            <NumberFieldInput id="nf-sizes-default" />
            <NumberFieldIncrement />
          </NumberField>
        </div>
        <div class="grid gap-1.5">
          <Label for="nf-sizes-lg">Large</Label>
          <NumberField v-model="lg" size="lg" class="w-36">
            <NumberFieldDecrement />
            <NumberFieldInput id="nf-sizes-lg" />
            <NumberFieldIncrement />
          </NumberField>
        </div>
      </div>
    `,
	}),
};

export const WithMinMax: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Range bounds. Home/End keys jump directly to `min` / `max`.',
			},
		},
	},
	render: () => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(5);
			return { value };
		},
		template: `
      <div class="flex flex-col items-start gap-2">
        <Label for="nf-minmax">Quantity (0–10)</Label>
        <NumberField v-model="value" :min="0" :max="10" class="w-36">
          <NumberFieldDecrement />
          <NumberFieldInput id="nf-minmax" />
          <NumberFieldIncrement />
        </NumberField>
        <p class="text-xs text-muted-foreground">Range: 0-10 (current: {{ value }})</p>
      </div>
    `,
	}),
};

export const WithStep: Story = {
	parameters: {
		docs: {
			description: { story: 'Custom step amount. Each +/- click moves the value by `step`.' },
		},
	},
	render: () => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(0);
			return { value };
		},
		template: `
      <div class="flex flex-col items-start gap-2">
        <Label for="nf-step">Quantity (step 5)</Label>
        <NumberField v-model="value" :step="5" class="w-36">
          <NumberFieldDecrement />
          <NumberFieldInput id="nf-step" />
          <NumberFieldIncrement />
        </NumberField>
        <p class="text-xs text-muted-foreground">Step: 5</p>
      </div>
    `,
	}),
};

export const Currency: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Pass `formatOptions` for currency, percentage, or unit display. The underlying value remains a plain number.',
			},
		},
	},
	render: () => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(1500);
			const formatOptions = { style: 'currency', currency: 'USD' };
			return { value, formatOptions };
		},
		template: `
      <div class="flex flex-col items-start gap-2">
        <Label for="nf-currency">Amount (USD)</Label>
        <NumberField v-model="value" :format-options="formatOptions" :step="100" :min="0" class="w-40">
          <NumberFieldDecrement />
          <NumberFieldInput id="nf-currency" />
          <NumberFieldIncrement />
        </NumberField>
        <p class="text-xs text-muted-foreground">Value: {{ value }}</p>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'Disabled state. +/- buttons and input are non-interactive.' } },
	},
	render: (args) => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(42);
			return { args, value };
		},
		template: `
      <div class="grid w-36 gap-1.5">
        <Label for="nf-disabled">Quantity</Label>
        <NumberField v-model="value" v-bind="args">
          <NumberFieldDecrement />
          <NumberFieldInput id="nf-disabled" />
          <NumberFieldIncrement />
        </NumberField>
      </div>
    `,
	}),
};

export const WithError: Story = {
	args: { error: true },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid="true"` on the input and tints the border. Always pair with descriptive helper text via `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(11);
			return { args, value };
		},
		template: `
      <div class="grid w-40 gap-2">
        <Label for="qty-error">Quantity</Label>
        <NumberField
          v-model="value"
          v-bind="args"
          described-by="qty-error-msg"
          :max="10"
        >
          <NumberFieldDecrement />
          <NumberFieldInput id="qty-error" />
          <NumberFieldIncrement />
        </NumberField>
        <p id="qty-error-msg" class="text-xs text-destructive">Maximum 10 units per order</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: { description: { story: 'Compose with `<Label>` for accessible names.' } },
	},
	render: () => ({
		components: {
			NumberField,
			NumberFieldInput,
			NumberFieldDecrement,
			NumberFieldIncrement,
			Label,
		},
		setup() {
			const value = ref(1);
			return { value };
		},
		template: `
      <div class="grid w-36 gap-2">
        <Label for="qty">Quantity</Label>
        <NumberField v-model="value" :min="0" :max="99">
          <NumberFieldDecrement />
          <NumberFieldInput id="qty" />
          <NumberFieldIncrement />
        </NumberField>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveIncrementClick: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const inc = canvas.getByRole('button', { name: /increase/i });
		await userEvent.click(inc);
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe(1);
	},
};

export const InteractiveDecrementClick: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const dec = canvas.getByRole('button', { name: /decrease/i });
		await userEvent.click(dec);
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe(-1);
	},
};

export const InteractiveArrowUpAdjusts: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('spinbutton') as HTMLInputElement;
		input.focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe(1);
	},
};

export const InteractiveRespectsMax: Story = {
	tags: ['!autodocs', 'test'],
	args: { max: 2 },
	render: (args) => ({
		components: { NumberField, NumberFieldInput, NumberFieldDecrement, NumberFieldIncrement },
		setup() {
			const value = ref(2);
			return { args, value };
		},
		template: `
      <NumberField
        v-model="value"
        v-bind="args"
        class="w-36"
        @update:model-value="args['onUpdate:modelValue']"
      >
        <NumberFieldDecrement />
        <NumberFieldInput aria-label="Quantity" />
        <NumberFieldIncrement />
      </NumberField>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const inc = canvas.getByRole('button', { name: /increase/i }) as HTMLButtonElement;
		// At max, button is disabled by Reka
		expect(inc).toBeDisabled();
	},
};

export const InteractiveRespectsMin: Story = {
	tags: ['!autodocs', 'test'],
	args: { min: 0 },
	render: (args) => ({
		components: { NumberField, NumberFieldInput, NumberFieldDecrement, NumberFieldIncrement },
		setup() {
			const value = ref(0);
			return { args, value };
		},
		template: `
      <NumberField
        v-model="value"
        v-bind="args"
        class="w-36"
        @update:model-value="args['onUpdate:modelValue']"
      >
        <NumberFieldDecrement />
        <NumberFieldInput aria-label="Quantity" />
        <NumberFieldIncrement />
      </NumberField>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const dec = canvas.getByRole('button', { name: /decrease/i }) as HTMLButtonElement;
		// At min, button is disabled by Reka
		expect(dec).toBeDisabled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('[data-slot="number-field-input"]') as HTMLElement;
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: '+/- buttons meet WCAG 2.2 SC 2.5.8 (≥ 24×24 px) at every size.',
			},
		},
	},
	render: () => ({
		components: { NumberField, NumberFieldInput, NumberFieldDecrement, NumberFieldIncrement },
		setup() {
			const a = ref(0);
			const b = ref(0);
			const c = ref(0);
			return { a, b, c };
		},
		template: `
      <div data-test-root class="flex flex-col items-start gap-3">
        <NumberField v-model="a" size="sm" class="w-36">
          <NumberFieldDecrement />
          <NumberFieldInput aria-label="Small quantity" />
          <NumberFieldIncrement />
        </NumberField>
        <NumberField v-model="b" size="default" class="w-36">
          <NumberFieldDecrement />
          <NumberFieldInput aria-label="Default quantity" />
          <NumberFieldIncrement />
        </NumberField>
        <NumberField v-model="c" size="lg" class="w-36">
          <NumberFieldDecrement />
          <NumberFieldInput aria-label="Large quantity" />
          <NumberFieldIncrement />
        </NumberField>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="number-field-decrement"], [data-slot="number-field-increment"]',
		);
		expect(buttons.length).toBe(6);
		for (const b of buttons) expectMinTargetSize(b, 24);
	},
};

export const InteractiveDisabledBlocksClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const inc = canvas.getByRole('button', { name: /increase/i }) as HTMLButtonElement;
		const dec = canvas.getByRole('button', { name: /decrease/i }) as HTMLButtonElement;
		expect(inc).toBeDisabled();
		expect(dec).toBeDisabled();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { NumberField, NumberFieldInput, NumberFieldDecrement, NumberFieldIncrement },
		setup() {
			const value = ref(0);
			return { value };
		},
		template: `
      <div data-test-root class="flex flex-col gap-3 p-2">
        <NumberField v-model="value" class="w-36">
          <NumberFieldDecrement />
          <NumberFieldInput aria-label="Quantity" />
          <NumberFieldIncrement />
        </NumberField>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const wrapper = root.querySelector('[data-slot="number-field"]') as HTMLElement;
			expect(wrapper).toBeTruthy();
			const r = wrapper.getBoundingClientRect();
			expect(r.width).toBeGreaterThan(0);
			expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
