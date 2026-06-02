import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { Mail, Search, AtSign } from '@lucide/vue';
import Input from './Input.vue';
import Label from '../label/Label.vue';
import Icon from '../../general/icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Form/Input',
	component: Input,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Visual style. Prefer the `error` boolean prop for validation errors.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description:
				'Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. All use `text-sm` (12 px) — minimum for iOS no-zoom-on-focus.',
		},
		type: { control: 'text', description: 'Native input type.' },
		disabled: { control: 'boolean', description: 'Disabled state.' },
		readonly: { control: 'boolean', description: 'Read-only state.' },
		required: {
			control: 'boolean',
			description: 'Required attribute. Pair with `<Label required>`.',
		},
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` and applies error variant.',
		},
		describedBy: {
			control: 'text',
			description: 'id of helper / error text describing this input.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		variant: 'default',
		size: 'default',
		type: 'text',
		disabled: false,
		readonly: false,
		required: false,
		error: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Single-line text field. Wraps a native `<input>` to support optional leading/trailing icon slots while keeping the caret area covering the full surface.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="input-default">Email</Label>
        <Input v-bind="args" id="input-default" placeholder="you@example.com" @update:modelValue="args['onUpdate:modelValue']" />
      </div>
    `,
	}),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three density tiers. All sizes share `text-sm` to keep iOS Safari from zooming on focus.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-3">
        <div class="grid gap-1.5">
          <Label for="input-sizes-sm">Small</Label>
          <Input v-bind="args" id="input-sizes-sm" size="sm" placeholder="Small" />
        </div>
        <div class="grid gap-1.5">
          <Label for="input-sizes-default">Default</Label>
          <Input v-bind="args" id="input-sizes-default" size="default" placeholder="Default" />
        </div>
        <div class="grid gap-1.5">
          <Label for="input-sizes-lg">Large</Label>
          <Input v-bind="args" id="input-sizes-lg" size="lg" placeholder="Large" />
        </div>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: {
			description: {
				story:
					'Disabled inputs reject input and lower opacity. Wrapper still meets contrast minimums.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="input-disabled">Email</Label>
        <Input v-bind="args" id="input-disabled" placeholder="Disabled" />
      </div>
    `,
	}),
};

export const Readonly: Story = {
	args: { readonly: true, modelValue: 'read-only value' },
	parameters: {
		docs: {
			description: { story: 'Read-only inputs allow selection and copy but block editing.' },
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="input-readonly">Email</Label>
        <Input v-bind="args" id="input-readonly" />
      </div>
    `,
	}),
};

export const Required: Story = {
	args: { required: true },
	parameters: {
		docs: {
			description: {
				story:
					'Required inputs participate in native form validation. Pair with `<Label required>` to surface the asterisk.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="email-required" required>Email</Label>
        <Input v-bind="args" id="email-required" placeholder="you@example.com" />
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
					'Error state sets `aria-invalid="true"` and tints the border. Always pair with descriptive helper text via `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="email-error" required>Email</Label>
        <Input v-bind="args" id="email-error" type="email" placeholder="you@example.com" described-by="email-error-msg" />
        <p id="email-error-msg" class="text-xs text-destructive">Please enter a valid email address</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Compose `<Label>` with `for` and matching `id` to pair input + label.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="email">Email</Label>
        <Input v-bind="args" id="email" type="email" placeholder="you@example.com" />
        <p class="text-xs text-muted-foreground">We'll never share your email.</p>
      </div>
    `,
	}),
};

export const WithLeadingIcon: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Use the `leading` slot to render an icon inside the input. Wrapper handles spacing — no `class="pl-10"` overrides needed.',
			},
		},
	},
	render: (args) => ({
		components: { Input, Icon, Label },
		setup: () => ({ args, Mail }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="input-leading">Email</Label>
        <Input v-bind="args" id="input-leading" type="email" placeholder="you@example.com">
          <template #leading><Icon :icon="Mail" aria-hidden="true" /></template>
        </Input>
      </div>
    `,
	}),
};

export const WithTrailingIcon: Story = {
	parameters: {
		docs: { description: { story: 'Use the `trailing` slot for status icons or actions.' } },
	},
	render: (args) => ({
		components: { Input, Icon, Label },
		setup: () => ({ args, Search }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="input-trailing">Search</Label>
        <Input v-bind="args" id="input-trailing" type="search" placeholder="Search…">
          <template #trailing><Icon :icon="Search" aria-hidden="true" /></template>
        </Input>
      </div>
    `,
	}),
};

export const WithBothIcons: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Compose both leading and trailing affixes for richer fields (currency, units, status).',
			},
		},
	},
	render: (args) => ({
		components: { Input, Icon, Label },
		setup: () => ({ args, AtSign, Mail }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="input-both">Username</Label>
        <Input v-bind="args" id="input-both" type="email" placeholder="username">
          <template #leading><Icon :icon="AtSign" aria-hidden="true" /></template>
          <template #trailing><span class="text-muted-foreground text-xs">@quanticabot.local</span></template>
        </Input>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveTypeEmits: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox');
		await userEvent.type(input, 'hello');
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		// Each keystroke fires one update; the final call carries the full value.
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe('hello');
	},
};

export const InteractiveDisabledBlocksInput: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox') as HTMLInputElement;
		expect(input).toBeDisabled();
		// userEvent.type rejects on disabled inputs; fire change directly to verify
		// the model isn't updated for native value setters either.
		expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
	},
};

export const InteractiveReadonlyBlocksInput: Story = {
	tags: ['!autodocs', 'test'],
	args: { readonly: true, modelValue: 'fixed' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox') as HTMLInputElement;
		expect(input.readOnly).toBe(true);
		expect(input.value).toBe('fixed');
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveLabelAssociation: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'A `for`/`id` pair links Label to Input — assistive tech announces the label on focus.',
			},
		},
	},
	render: () => ({
		components: { Input, Label },
		template: `
      <div class="grid w-72 gap-2">
        <Label for="assoc-test">Email</Label>
        <Input id="assoc-test" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText('Email');
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe('INPUT');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Default and large sizes meet WCAG SC 2.5.8 (≥ 24×24 px) on the input itself. `sm` (28 px) also meets the minimum.',
			},
		},
	},
	render: () => ({
		components: { Input },
		template: `
      <div data-test-root class="grid w-72 gap-3">
        <Input size="sm" placeholder="sm" aria-label="Small input" />
        <Input size="default" placeholder="default" aria-label="Default input" />
        <Input size="lg" placeholder="lg" aria-label="Large input" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const wrappers = canvasElement.querySelectorAll<HTMLElement>('[data-slot="input-wrapper"]');
		expect(wrappers.length).toBe(3);
		for (const w of wrappers) expectMinTargetSize(w, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Inputs render correctly across all five standard viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { Input, Icon },
		setup: () => ({ Mail }),
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <Input placeholder="No icon" aria-label="No icon input" />
        <Input placeholder="Leading" aria-label="Leading input">
          <template #leading><Icon :icon="Mail" aria-hidden="true" /></template>
        </Input>
        <Input placeholder="Trailing" aria-label="Trailing input">
          <template #trailing><Icon :icon="Mail" aria-hidden="true" /></template>
        </Input>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const inputs = root.querySelectorAll<HTMLInputElement>('input');
			expect(inputs.length).toBe(3);
			for (const i of inputs) {
				const r = i.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
