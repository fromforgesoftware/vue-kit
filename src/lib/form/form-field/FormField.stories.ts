import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within } from 'storybook/test';
import { ref } from 'vue';
import FormField from './FormField.vue';
import Input from '../input/Input.vue';
import Switch from '../switch/Switch.vue';
import Textarea from '../textarea/Textarea.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Form/FormField',
	component: FormField,
	// Disable autodocs because this component has a curated `About.mdx`.
	tags: ['!autodocs'],
	argTypes: {
		label: { control: 'text', description: 'Visible label text. Always required.' },
		description: {
			control: 'text',
			description: 'Helper text shown below or beside the control. Hidden when an error is set.',
		},
		error: {
			control: 'text',
			description: 'Error message. When non-empty, replaces the description and tints the field.',
		},
		required: {
			control: 'boolean',
			description:
				'Renders the asterisk on the Label and asks the slotted control to set `required`.',
		},
		layout: {
			control: 'select',
			options: ['vertical', 'horizontal'],
			description:
				'Layout. `vertical` stacks; `horizontal` puts the label-and-description on the left, the control on the right at md+.',
		},
		variant: {
			control: 'select',
			options: ['panel', 'page'],
			description: 'Legacy alias for `layout` — `panel` = vertical, `page` = horizontal.',
		},
		for: { control: 'text', description: 'id of the slotted control. Auto-generated if omitted.' },
		srOnlyLabel: {
			control: 'boolean',
			description: 'Hide the label visually but keep it for assistive tech.',
		},
	},
	args: {
		label: 'Email',
		required: false,
		srOnlyLabel: false,
		layout: 'vertical',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Wraps a Label, control, helper text, and error in one accessible compound — id, aria-describedby, and required wiring are handled for you. Pass any control via the default slot; a scoped slot exposes the field id, error flag, and aria-describedby for the control to bind.',
			},
		},
	},
	render: (args) => ({
		components: { FormField, Input },
		setup: () => ({ args }),
		template: `
      <div class="w-80">
        <FormField v-bind="args">
          <template #default="{ id, error, required, ariaDescribedBy }">
            <Input :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" placeholder="you@example.com" />
          </template>
        </FormField>
      </div>
    `,
	}),
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithDescription: Story = {
	args: { description: "We'll never share your email." },
	parameters: {
		docs: {
			description: {
				story:
					'Helper text below the control. The control aria-describedby references the helper text id.',
			},
		},
	},
};

export const Required: Story = {
	args: { required: true, description: 'Required for billing notifications.' },
	parameters: {
		docs: {
			description: {
				story:
					'The asterisk on the Label is decorative; the slotted control receives `required` via the scoped slot for native form validation.',
			},
		},
	},
};

export const WithError: Story = {
	args: {
		error: 'Please enter a valid email address.',
		description: "We'll never share your email.",
	},
	parameters: {
		docs: {
			description: {
				story:
					'Error message replaces the description, tints the Label destructive, and sets `aria-invalid` on the control via the scoped slot.',
			},
		},
	},
};

export const HorizontalLayout: Story = {
	args: {
		layout: 'horizontal',
		label: 'Notifications',
		description: 'Receive an email when a teammate mentions you.',
	},
	render: (args) => ({
		components: { FormField, Switch },
		setup() {
			const checked = ref(true);
			return { args, checked };
		},
		template: `
      <div class="w-full max-w-2xl rounded-xl border border-border bg-card divide-y divide-border">
        <FormField v-bind="args">
          <template #default="{ id }">
            <Switch :id="id" :checked="checked" aria-label="Notifications" @update:checked="checked = $event" />
          </template>
        </FormField>
      </div>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Horizontal layout for settings rows — label-and-description on the left, control on the right at md+. Stacks at mobile.',
			},
		},
	},
};

export const PanelVariant: Story = {
	args: { variant: 'panel', description: 'Used inside drawers / embedded forms.' },
	parameters: {
		docs: {
			description: {
				story:
					'Legacy `variant="panel"` maps to `layout="vertical"`. Provided for backward compatibility — prefer `layout` in new code.',
			},
		},
	},
};

export const PageVariant: Story = {
	args: {
		variant: 'page',
		label: 'Email notifications',
		description: 'Receive a daily digest by email.',
	},
	render: (args) => ({
		components: { FormField, Switch },
		setup() {
			const checked = ref(false);
			return { args, checked };
		},
		template: `
      <div class="w-full max-w-2xl rounded-xl border border-border bg-card divide-y divide-border">
        <FormField v-bind="args">
          <template #default="{ id }">
            <Switch :id="id" :checked="checked" aria-label="Email notifications" @update:checked="checked = $event" />
          </template>
        </FormField>
      </div>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Legacy `variant="page"` maps to `layout="horizontal"`. Provided for backward compatibility — prefer `layout` in new code.',
			},
		},
	},
};

export const SrOnlyLabel: Story = {
	args: { srOnlyLabel: true, label: 'Search', description: 'Search for anything.' },
	parameters: {
		docs: {
			description: {
				story:
					'Hide the label visually for icon-only or contextual fields. The label remains in the accessibility tree.',
			},
		},
	},
};

export const WithTextarea: Story = {
	args: {
		label: 'Description',
		description: 'Up to 500 characters.',
	},
	render: (args) => ({
		components: { FormField, Textarea },
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-96">
        <FormField v-bind="args">
          <template #default="{ id, error, required, ariaDescribedBy }">
            <Textarea :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" :rows="4" />
          </template>
        </FormField>
      </div>
    `,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'FormField wraps any control — Input, Textarea, Switch, Select, custom. Bind the scoped-slot props for accessibility wiring.',
			},
		},
	},
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveLabelAssociation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { FormField, Input },
		template: `
      <FormField label="Email">
        <template #default="{ id, error, required, ariaDescribedBy }">
          <Input :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" />
        </template>
      </FormField>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText('Email') as HTMLInputElement;
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe('INPUT');
		const label = canvasElement.querySelector('[data-slot="form-field-label"]') as HTMLLabelElement;
		expect(label.htmlFor).toBe(input.id);
		expect(input.id).toBeTruthy();
	},
};

export const InteractiveErrorWiring: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { FormField, Input },
		template: `
      <FormField label="Email" error="Please enter a valid email address.">
        <template #default="{ id, error, required, ariaDescribedBy }">
          <Input :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" />
        </template>
      </FormField>
    `,
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('[data-slot="input"]') as HTMLInputElement;
		const errorMsg = canvasElement.querySelector('[data-slot="form-field-error"]') as HTMLElement;
		expect(errorMsg).toBeInTheDocument();
		expect(errorMsg.id).toBeTruthy();
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input.getAttribute('aria-describedby')).toBe(errorMsg.id);
		const label = canvasElement.querySelector('[data-slot="form-field-label"]') as HTMLLabelElement;
		expect(label.className).toContain('text-destructive');
	},
};

export const InteractiveDescriptionWiring: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { FormField, Input },
		template: `
      <FormField label="Email" description="We'll never share your email.">
        <template #default="{ id, error, required, ariaDescribedBy }">
          <Input :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" />
        </template>
      </FormField>
    `,
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('[data-slot="input"]') as HTMLInputElement;
		const desc = canvasElement.querySelector('[data-slot="form-field-description"]') as HTMLElement;
		expect(desc).toBeInTheDocument();
		expect(desc.id).toBeTruthy();
		expect(input.getAttribute('aria-describedby')).toBe(desc.id);
		expect(input).not.toHaveAttribute('aria-invalid');
	},
};

export const InteractiveRequiredIndicator: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { FormField, Input },
		template: `
      <FormField label="Email" required>
        <template #default="{ id, error, required, ariaDescribedBy }">
          <Input :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" />
        </template>
      </FormField>
    `,
	}),
	play: async ({ canvasElement }) => {
		const indicator = canvasElement.querySelector('[data-slot="label-required"]') as HTMLElement;
		expect(indicator).toBeInTheDocument();
		expect(indicator.textContent).toBe('*');
		const input = canvasElement.querySelector('[data-slot="input"]') as HTMLInputElement;
		expect(input).toBeRequired();
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
		components: { FormField, Input, Switch },
		setup() {
			const checked = ref(true);
			return { checked, fn };
		},
		template: `
      <div data-test-root class="w-full max-w-2xl space-y-4 p-2">
        <FormField label="Email" description="We'll never share your email.">
          <template #default="{ id, error, required, ariaDescribedBy }">
            <Input :id="id" :error="error" :required="required" :described-by="ariaDescribedBy" />
          </template>
        </FormField>
        <div class="rounded-xl border border-border bg-card divide-y divide-border">
          <FormField layout="horizontal" label="Notifications" description="Email digest">
            <template #default="{ id }">
              <Switch :id="id" :checked="checked" aria-label="Notifications" @update:checked="checked = $event" />
            </template>
          </FormField>
          <FormField layout="horizontal" label="Disabled" description="Hide on the page">
            <template #default="{ id }">
              <Switch :id="id" :checked="false" aria-label="Disabled" />
            </template>
          </FormField>
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const fields = root.querySelectorAll<HTMLElement>('[data-slot="form-field"]');
			expect(fields.length).toBe(3);
		});
	},
};
