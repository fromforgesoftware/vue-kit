import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent } from 'storybook/test';
import InputChip from './InputChip.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;
const ALL_CHIP_VARIANTS = [
	'default',
	'secondary',
	'destructive',
	'outline',
	'soft-destructive',
] as const;

const meta = {
	title: 'Form/Tags Input',
	component: InputChip,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		placeholder: { control: 'text', description: 'Placeholder shown when no chips.' },
		removable: { control: 'boolean', description: 'Allow per-chip removal.' },
		clearable: { control: 'boolean', description: 'Show a trailing clear-all button.' },
		disabled: { control: 'boolean', description: 'Disabled state.' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` and applies error border.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px (min height).',
		},
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Wrapper style. Prefer the `error` boolean prop for validation errors.',
		},
		chipVariant: {
			control: 'select',
			options: ALL_CHIP_VARIANTS,
			description: 'Visual style applied to each chip. Mirrors a subset of Badge variants.',
		},
		maxChips: {
			control: 'number',
			description: 'Maximum number of chips. Beyond this, input is disabled.',
		},
		describedBy: { control: 'text', description: 'id of helper / error text.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onAdd: { action: 'add' },
		onRemove: { action: 'remove' },
		onClear: { action: 'clear' },
	},
	args: {
		placeholder: 'Type and press Enter...',
		removable: true,
		clearable: false,
		disabled: false,
		error: false,
		size: 'default',
		variant: 'default',
		chipVariant: 'secondary',
		'onUpdate:modelValue': fn(),
		onAdd: fn(),
		onRemove: fn(),
		onClear: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Multi-value chip input. Type a value and press Enter (or comma) to add it as a chip; backspace on an empty input removes the last chip. Chip styling mirrors Badge variants.',
			},
		},
	},
	render: (args) => ({
		components: { InputChip, Label },
		setup() {
			const tags = ref<string[]>([]);
			return { args, tags };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="chip-default">Tags</Label>
        <InputChip
          id="chip-default"
          v-model="tags"
          v-bind="args"
          @update:model-value="args['onUpdate:modelValue']"
          @add="args.onAdd"
          @remove="args.onRemove"
          @clear="args.onClear"
        />
      </div>
    `,
	}),
} satisfies Meta<typeof InputChip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three density tiers. Min-height grows with size.' } },
	},
	render: () => ({
		components: { InputChip },
		setup() {
			const a = ref<string[]>(['one', 'two']);
			const b = ref<string[]>(['one', 'two']);
			const c = ref<string[]>(['one', 'two']);
			return { a, b, c };
		},
		template: `
      <div class="grid w-72 gap-3">
        <InputChip v-model="a" size="sm" aria-label="Small tags" />
        <InputChip v-model="b" size="default" aria-label="Default tags" />
        <InputChip v-model="c" size="lg" aria-label="Large tags" />
      </div>
    `,
	}),
};

export const ChipVariants: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Chip variants mirror a subset of Badge variants. Set `chipVariant` on the input.',
			},
		},
	},
	render: () => ({
		components: { InputChip },
		setup() {
			const a = ref<string[]>(['one', 'two']);
			const b = ref<string[]>(['one', 'two']);
			const c = ref<string[]>(['one', 'two']);
			const d = ref<string[]>(['one', 'two']);
			const e = ref<string[]>(['one', 'two']);
			return { a, b, c, d, e };
		},
		template: `
      <div class="grid w-72 gap-3">
        <InputChip v-model="a" chip-variant="default" aria-label="Default tags" />
        <InputChip v-model="b" chip-variant="secondary" aria-label="Secondary tags" />
        <InputChip v-model="c" chip-variant="outline" aria-label="Outline tags" />
        <InputChip v-model="d" chip-variant="destructive" aria-label="Destructive tags" />
        <InputChip v-model="e" chip-variant="soft-destructive" aria-label="Soft destructive tags" />
      </div>
    `,
	}),
};

export const WithClearAll: Story = {
	args: { clearable: true },
	parameters: {
		docs: {
			description: { story: 'Trailing clear-all button. Useful when chip lists grow long.' },
		},
	},
	render: (args) => ({
		components: { InputChip, Label },
		setup() {
			const emails = ref<string[]>(['alice@quanticabot.local', 'bob@quanticabot.local']);
			return { args, emails };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="chip-clearall">Email addresses</Label>
        <InputChip
          id="chip-clearall"
          v-model="emails"
          v-bind="args"
          @update:model-value="args['onUpdate:modelValue']"
        />
      </div>
    `,
	}),
};

export const NonRemovable: Story = {
	args: { removable: false },
	parameters: {
		docs: { description: { story: 'Read-only chips. Useful for displaying existing values.' } },
	},
	render: (args) => ({
		components: { InputChip, Label },
		setup() {
			const tags = ref(['fixed-1', 'fixed-2']);
			return { args, tags };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="chip-nonremovable">Tags</Label>
        <InputChip id="chip-nonremovable" v-model="tags" v-bind="args" />
      </div>
    `,
	}),
};

export const WithMaxChips: Story = {
	args: { maxChips: 3 },
	parameters: {
		docs: {
			description: {
				story: 'Bound the number of chips. The input is disabled once the limit is reached.',
			},
		},
	},
	render: (args) => ({
		components: { InputChip, Label },
		setup() {
			const tags = ref(['one', 'two']);
			return { args, tags };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="chip-max">Tags</Label>
        <InputChip id="chip-max" v-model="tags" v-bind="args" />
        <p class="text-xs text-muted-foreground">{{ tags.length }} / 3 chips</p>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: {
			description: { story: 'Disabled state. Input and remove buttons are non-interactive.' },
		},
		// WCAG 1.4.3 exempts disabled controls from contrast. The wrapper
		// applies `opacity-50` while disabled which fades chip text below 4.5:1.
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
	},
	render: (args) => ({
		components: { InputChip, Label },
		setup() {
			const tags = ref(['one', 'two']);
			return { args, tags };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="chip-disabled">Tags</Label>
        <InputChip id="chip-disabled" v-model="tags" v-bind="args" />
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
					'Error state sets `aria-invalid="true"` on wrapper + input and tints the border. Pair with `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: { InputChip, Label },
		setup() {
			const tags = ref<string[]>([]);
			return { args, tags };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="chip-error-input">Skills (required)</Label>
        <InputChip id="chip-error-input" v-model="tags" v-bind="args" described-by="chip-error-msg" />
        <p id="chip-error-msg" class="text-xs text-destructive">Please add at least one skill</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: { description: { story: 'Compose with `<Label>` for accessible names.' } },
	},
	render: () => ({
		components: { InputChip, Label },
		setup() {
			const tags = ref<string[]>([]);
			return { tags };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="chip-tags">Tags</Label>
        <InputChip
          id="chip-tags"
          v-model="tags"
          placeholder="Add a tag..."
        />
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveAddOnEnter: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox') as HTMLInputElement;
		await userEvent.type(input, 'apple');
		await userEvent.keyboard('{Enter}');
		expect(args.onAdd).toHaveBeenCalledWith('apple');
		expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(['apple']);
	},
};

export const InteractiveAddOnComma: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox') as HTMLInputElement;
		await userEvent.type(input, 'banana,');
		expect(args.onAdd).toHaveBeenCalledWith('banana');
	},
};

export const InteractiveBackspaceRemovesLast: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { InputChip },
		setup() {
			const tags = ref(['one', 'two']);
			return { args, tags };
		},
		template: `
      <div class="w-72">
        <InputChip
          v-model="tags"
          v-bind="args"
          aria-label="Tags"
          @update:model-value="args['onUpdate:modelValue']"
          @remove="args.onRemove"
        />
      </div>
    `,
	}),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox') as HTMLInputElement;
		input.focus();
		await userEvent.keyboard('{Backspace}');
		expect(args.onRemove).toHaveBeenCalled();
		const calls = (args.onRemove as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe('two');
	},
};

export const InteractiveClickRemove: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { InputChip },
		setup() {
			const tags = ref(['alpha', 'beta']);
			return { args, tags };
		},
		template: `
      <div class="w-72">
        <InputChip
          v-model="tags"
          v-bind="args"
          aria-label="Tags"
          @update:model-value="args['onUpdate:modelValue']"
          @remove="args.onRemove"
        />
      </div>
    `,
	}),
	play: async ({ args, canvasElement }) => {
		const remove = canvasElement.querySelector(
			'[data-slot="input-chip-remove"]',
		) as HTMLButtonElement;
		expect(remove).toBeInTheDocument();
		expectMinTargetSize(remove, 24);
		await userEvent.click(remove);
		expect(args.onRemove).toHaveBeenCalled();
		const calls = (args.onRemove as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe('alpha');
	},
};

export const InteractiveClearAll: Story = {
	tags: ['!autodocs', 'test'],
	args: { clearable: true },
	render: (args) => ({
		components: { InputChip },
		setup() {
			const tags = ref(['one', 'two', 'three']);
			return { args, tags };
		},
		template: `
      <div class="w-72">
        <InputChip
          v-model="tags"
          v-bind="args"
          aria-label="Tags"
          @update:model-value="args['onUpdate:modelValue']"
          @clear="args.onClear"
        />
      </div>
    `,
	}),
	play: async ({ args, canvasElement }) => {
		const clear = canvasElement.querySelector(
			'[data-slot="input-chip-clear"]',
		) as HTMLButtonElement;
		expect(clear).toBeInTheDocument();
		await userEvent.click(clear);
		expect(args.onClear).toHaveBeenCalled();
		expect(args['onUpdate:modelValue']).toHaveBeenCalledWith([]);
	},
};

export const InteractiveMaxChips: Story = {
	tags: ['!autodocs', 'test'],
	args: { maxChips: 2 },
	parameters: {
		// Reaching maxChips disables the input which fades the wrapper —
		// WCAG 1.4.3 exempts disabled controls.
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
	},
	render: (args) => ({
		components: { InputChip },
		setup() {
			const tags = ref(['one', 'two']);
			return { args, tags };
		},
		template: `
      <div class="w-72">
        <InputChip
          v-model="tags"
          v-bind="args"
          aria-label="Tags"
          @update:model-value="args['onUpdate:modelValue']"
          @add="args.onAdd"
        />
      </div>
    `,
	}),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox') as HTMLInputElement;
		expect(input).toBeDisabled();
		expect(args.onAdd).not.toHaveBeenCalled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const wrapper = canvasElement.querySelector('[data-slot="input-chip-wrapper"]') as HTMLElement;
		expect(wrapper).toHaveAttribute('aria-invalid', 'true');
		expect(wrapper).toHaveAttribute('aria-describedby', 'msg');
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	parameters: {
		// WCAG 1.4.3 exempts disabled controls from color-contrast.
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
	},
	render: (args) => ({
		components: { InputChip },
		setup() {
			const tags = ref(['one', 'two']);
			return { args, tags };
		},
		template: `
      <div class="w-72">
        <InputChip v-model="tags" v-bind="args" aria-label="Tags" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox');
		expect(input).toBeDisabled();
		const removes = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="input-chip-remove"]',
		);
		for (const r of removes) expect(r).toBeDisabled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Per-chip remove button meets WCAG 2.2 SC 2.5.8 (≥ 24×24 px) at every size.',
			},
		},
	},
	render: () => ({
		components: { InputChip },
		setup() {
			const a = ref(['x']);
			const b = ref(['x']);
			const c = ref(['x']);
			return { a, b, c };
		},
		template: `
      <div data-test-root class="grid w-72 gap-3">
        <InputChip v-model="a" size="sm" aria-label="Small tags" />
        <InputChip v-model="b" size="default" aria-label="Default tags" />
        <InputChip v-model="c" size="lg" aria-label="Large tags" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const removes = canvasElement.querySelectorAll<HTMLElement>('[data-slot="input-chip-remove"]');
		expect(removes.length).toBe(3);
		for (const r of removes) expectMinTargetSize(r, 24);
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
		components: { InputChip },
		setup() {
			const tags = ref(['one', 'two', 'three']);
			return { tags };
		},
		template: `
      <div data-test-root class="p-2">
        <InputChip v-model="tags" aria-label="Tags" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const wrapper = root.querySelector('[data-slot="input-chip-wrapper"]') as HTMLElement;
			expect(wrapper).toBeTruthy();
			const r = wrapper.getBoundingClientRect();
			expect(r.width).toBeGreaterThan(0);
			expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
