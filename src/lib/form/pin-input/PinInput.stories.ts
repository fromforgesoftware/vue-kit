import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, userEvent } from 'storybook/test';
import PinInput from './PinInput.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Form/Pin Input',
	component: PinInput,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		length: { control: 'number', description: 'Number of cells.' },
		type: {
			control: 'select',
			options: ['text', 'number'],
			description: 'Restricts input to numeric characters when `number`.',
		},
		otp: {
			control: 'boolean',
			description: 'Enables `autocomplete="one-time-code"` for OTP autofill.',
		},
		mask: { control: 'boolean', description: 'Masks values like a password.' },
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px.',
		},
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Visual style. Prefer the `error` boolean prop for validation errors.',
		},
		disabled: { control: 'boolean', description: 'Disabled state.' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` and applies error border to all cells.',
		},
		placeholder: { control: 'text', description: 'Per-cell placeholder character.' },
		describedBy: { control: 'text', description: 'id of helper / error text.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onComplete: { action: 'complete' },
	},
	args: {
		length: 4,
		type: 'text',
		otp: false,
		mask: false,
		size: 'default',
		variant: 'default',
		disabled: false,
		error: false,
		placeholder: 'O',
		'onUpdate:modelValue': fn(),
		onComplete: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Sequence of single-character cells for entering PINs, OTP codes, or other fixed-length values. Built on Reka PinInput with auto-advance focus, backspace handling, and paste support.',
			},
		},
	},
	render: (args) => ({
		components: { PinInput },
		setup() {
			const value = ref<string[]>([]);
			return { args, value };
		},
		template: `
      <PinInput
        v-model="value"
        v-bind="args"
        @update:model-value="args['onUpdate:modelValue']"
        @complete="args.onComplete"
      />
    `,
	}),
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three density tiers. Each cell is square; even `sm` (28×28) meets WCAG 2.2 SC 2.5.8.',
			},
		},
	},
	render: () => ({
		components: { PinInput },
		setup() {
			const a = ref<string[]>([]);
			const b = ref<string[]>([]);
			const c = ref<string[]>([]);
			return { a, b, c };
		},
		template: `
      <div class="flex flex-col items-start gap-3">
        <PinInput v-model="a" size="sm" />
        <PinInput v-model="b" size="default" />
        <PinInput v-model="c" size="lg" />
      </div>
    `,
	}),
};

export const OTP: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Six-digit numeric OTP. Enables `autocomplete="one-time-code"` so iOS / Android can offer SMS autofill.',
			},
		},
	},
	render: (args) => ({
		components: { PinInput },
		setup() {
			const value = ref<string[]>([]);
			return { args, value };
		},
		template: `
      <div class="flex flex-col items-start gap-3">
        <p class="text-xs text-muted-foreground">Enter the 6-digit code sent to your phone</p>
        <PinInput
          v-model="value"
          :length="6"
          type="number"
          :otp="true"
          @update:model-value="args['onUpdate:modelValue']"
          @complete="args.onComplete"
        />
      </div>
    `,
	}),
};

export const Masked: Story = {
	args: { mask: true, type: 'number', length: 4 },
	parameters: {
		docs: { description: { story: 'Masked entry hides the typed digits — use for PINs.' } },
	},
	render: (args) => ({
		components: { PinInput },
		setup() {
			const value = ref<string[]>([]);
			return { args, value };
		},
		template: `
      <div class="flex flex-col items-start gap-3">
        <p class="text-xs text-muted-foreground">Enter your PIN</p>
        <PinInput v-model="value" v-bind="args" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'Disabled state. Cells are non-interactive.' } },
	},
	render: (args) => ({
		components: { PinInput },
		setup() {
			const value = ref(['1', '2', '3', '4']);
			return { args, value };
		},
		template: `<PinInput v-model="value" v-bind="args" />`,
	}),
};

export const WithError: Story = {
	args: { error: true },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid="true"` on the root and tints every cell border. Pair with helper text via `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: { PinInput, Label },
		setup() {
			const value = ref(['1', '2', '3', '4']);
			return { args, value };
		},
		template: `
      <div class="grid gap-2">
        <Label>Verification code</Label>
        <PinInput v-model="value" v-bind="args" described-by="pin-error-msg" />
        <p id="pin-error-msg" class="text-xs text-destructive">Invalid code. Please try again.</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: { description: { story: 'Compose with `<Label>` for accessible names.' } },
	},
	render: () => ({
		components: { PinInput, Label },
		setup() {
			const value = ref<string[]>([]);
			return { value };
		},
		template: `
      <div class="grid gap-2">
        <Label>Access code</Label>
        <PinInput v-model="value" :length="4" />
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveTypeAdvances: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const cells = canvasElement.querySelectorAll<HTMLInputElement>('[data-slot="pin-input-cell"]');
		expect(cells.length).toBe(4);
		cells[0].focus();
		await userEvent.keyboard('1');
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		// After typing in first cell, focus should auto-advance to second
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		expect(document.activeElement).toBe(cells[1]);
	},
};

export const InteractiveBackspaceMovesBack: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const cells = canvasElement.querySelectorAll<HTMLInputElement>('[data-slot="pin-input-cell"]');
		cells[0].focus();
		await userEvent.keyboard('12');
		// Now in cell 2 (index 2 since auto-advanced twice)
		await userEvent.keyboard('{Backspace}');
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		// Backspace should clear current and move focus back
		expect(document.activeElement === cells[1] || document.activeElement === cells[0]).toBe(true);
	},
};

export const InteractivePasteFillsAll: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const cells = canvasElement.querySelectorAll<HTMLInputElement>('[data-slot="pin-input-cell"]');
		cells[0].focus();
		// Reka PinInput accepts paste via the clipboard API in the focused cell
		await userEvent.paste('1234');
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		const last = calls[calls.length - 1][0];
		expect(last).toEqual(['1', '2', '3', '4']);
	},
};

export const InteractiveCompleteFires: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const cells = canvasElement.querySelectorAll<HTMLInputElement>('[data-slot="pin-input-cell"]');
		cells[0].focus();
		await userEvent.paste('9876');
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		expect(args.onComplete).toHaveBeenCalled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="pin-input"]') as HTMLElement;
		expect(root).toHaveAttribute('aria-invalid', 'true');
		expect(root).toHaveAttribute('aria-describedby', 'msg');
		const cells = canvasElement.querySelectorAll<HTMLElement>('[data-slot="pin-input-cell"]');
		for (const c of cells) expect(c).toHaveAttribute('aria-invalid', 'true');
	},
};

export const InteractiveDisabledBlocksInput: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const cells = canvasElement.querySelectorAll<HTMLInputElement>('[data-slot="pin-input-cell"]');
		for (const c of cells) expect(c).toBeDisabled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Each cell meets WCAG 2.2 SC 2.5.8 (≥ 24×24 px) at every size.',
			},
		},
	},
	render: () => ({
		components: { PinInput },
		setup() {
			const a = ref<string[]>([]);
			const b = ref<string[]>([]);
			const c = ref<string[]>([]);
			return { a, b, c };
		},
		template: `
      <div data-test-root class="flex flex-col items-start gap-3">
        <PinInput v-model="a" size="sm" />
        <PinInput v-model="b" size="default" />
        <PinInput v-model="c" size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const cells = canvasElement.querySelectorAll<HTMLElement>('[data-slot="pin-input-cell"]');
		expect(cells.length).toBe(12);
		for (const c of cells) expectMinTargetSize(c, 24);
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
		components: { PinInput },
		setup() {
			const value = ref<string[]>([]);
			return { value };
		},
		template: `
      <div data-test-root class="p-2">
        <PinInput v-model="value" :length="6" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cells = root.querySelectorAll<HTMLElement>('[data-slot="pin-input-cell"]');
			expect(cells.length).toBe(6);
			for (const c of cells) {
				const r = c.getBoundingClientRect();
				expect(r.width).toBeGreaterThanOrEqual(24);
				expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
