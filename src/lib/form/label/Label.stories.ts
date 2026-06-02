import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import Label from './Label.vue';
import Input from '../input/Input.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Form/Label',
	component: Label,
	tags: ['!autodocs'],
	argTypes: {
		for: { control: 'text', description: 'id of the form control this label labels.' },
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description:
				'Visual style. `error` flips colour to destructive — use when the labelled field is invalid.',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Density. `default` matches Input.',
		},
		required: {
			control: 'boolean',
			description: 'Render a `*` indicator with sr-only `(required)` text.',
		},
		requiredIndicator: { control: 'text' },
		requiredLabel: { control: 'text' },
	},
	args: {
		variant: 'default',
		size: 'default',
		required: false,
		requiredIndicator: '*',
		requiredLabel: '(required)',
	},
	parameters: {
		docs: {
			description: {
				component:
					"Programmatic label for form controls. Always pair with `for` matching the control's `id` — this is what makes the field have an accessible name.",
			},
		},
	},
	render: (args) => ({
		components: { Label },
		setup: () => ({ args }),
		template: `<Label v-bind="args">Email</Label>`,
	}),
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`error` tones the text destructive — typically synced with the labelled field's validation state.",
			},
		},
	},
	render: (args) => ({
		components: { Label },
		setup: () => ({ args }),
		template: `
      <div class="grid gap-2">
        <Label v-bind="args" variant="default">Default label</Label>
        <Label v-bind="args" variant="error">Error label</Label>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three densities. `default` matches Input.' } },
	},
	render: (args) => ({
		components: { Label },
		setup: () => ({ args }),
		template: `
      <div class="grid gap-2">
        <Label v-bind="args" size="sm">Small label</Label>
        <Label v-bind="args" size="default">Default label</Label>
        <Label v-bind="args" size="lg">Large label</Label>
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
					'Visual `*` paired with sr-only `(required)` text — assistive tech announces it correctly.',
			},
		},
	},
};

export const WithInput: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Use `for` matching the input's `id` to associate label and control. This is the only way to give the input an accessible name.",
			},
		},
	},
	render: (args) => ({
		components: { Label, Input },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label v-bind="args" for="email-with-label">Email</Label>
        <Input id="email-with-label" type="email" placeholder="you@example.com" />
      </div>
    `,
	}),
};

export const RequiredWithError: Story = {
	args: { required: true, variant: 'error' },
	parameters: {
		docs: {
			description: {
				story:
					"When the labelled field is invalid, sync the label's variant to `error` so the colour matches the field border.",
			},
		},
	},
	render: (args) => ({
		components: { Label, Input },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label v-bind="args" for="email-with-error">Email</Label>
        <Input id="email-with-error" type="email" placeholder="you@example.com" error described-by="email-with-error-msg" />
        <p id="email-with-error-msg" class="text-xs text-destructive">Please enter a valid email address.</p>
      </div>
    `,
	}),
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveAssociatesViaFor: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: '`for` makes `getByLabelText` find the input.' } },
	},
	render: () => ({
		components: { Label, Input },
		template: `
      <div class="grid w-72 gap-2">
        <Label for="lbl-test">Username</Label>
        <Input id="lbl-test" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText('Username');
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe('INPUT');
	},
};

export const InteractiveRequiredAnnouncesAria: Story = {
	tags: ['!autodocs', 'test'],
	args: { required: true },
	render: (args) => ({
		components: { Label },
		setup: () => ({ args }),
		template: `<Label v-bind="args">Email</Label>`,
	}),
	play: async ({ canvasElement }) => {
		const indicator = canvasElement.querySelector('[data-slot="label-required"]');
		expect(indicator).not.toBeNull();
		expect(indicator?.getAttribute('aria-hidden')).toBe('true');
		// sr-only text exists for assistive tech
		expect(canvasElement.textContent).toContain('(required)');
	},
};

export const InteractiveErrorVariantTone: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'error' },
	render: (args) => ({
		components: { Label },
		setup: () => ({ args }),
		template: `<Label data-test-target v-bind="args">Email</Label>`,
	}),
	play: async ({ canvasElement }) => {
		const lbl = canvasElement.querySelector('[data-test-target]') as HTMLElement;
		expect(lbl.className).toContain('text-destructive');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Label, Input },
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <div class="grid gap-2">
          <Label for="r1" required>Email</Label>
          <Input id="r1" />
        </div>
        <div class="grid gap-2">
          <Label for="r2" variant="error">Password</Label>
          <Input id="r2" error />
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const labels = root.querySelectorAll('label');
			expect(labels.length).toBe(2);
			for (const l of labels) {
				const r = l.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThan(0);
			}
		});
	},
};
