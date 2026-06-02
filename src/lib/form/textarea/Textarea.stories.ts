import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ref } from 'vue';
import Textarea from './Textarea.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Form/Textarea',
	component: Textarea,
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Visual style. Prefer the `error` boolean prop.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description:
				'Density. Controls min-height. All use `text-sm` (12 px) — minimum for iOS no-zoom-on-focus.',
		},
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		required: { control: 'boolean' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` and applies error variant.',
		},
		autoResize: {
			control: 'boolean',
			description: 'Grow vertically with content. Disables manual resize.',
		},
		rows: { control: 'number' },
		describedBy: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		variant: 'default',
		size: 'default',
		disabled: false,
		readonly: false,
		required: false,
		error: false,
		autoResize: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Multi-line text field. Mirrors Input tokens for visual consistency, with optional auto-resize that grows the textarea as the user types.',
			},
		},
	},
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="textarea-default">Message</Label>
        <Textarea v-bind="args" id="textarea-default" placeholder="Type something…" @update:modelValue="args['onUpdate:modelValue']" />
      </div>
    `,
	}),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Three densities. `lg` doubles the visible rows for long-form notes.' },
		},
	},
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-3">
        <div class="grid gap-1.5">
          <Label for="textarea-sizes-sm">Small</Label>
          <Textarea v-bind="args" id="textarea-sizes-sm" size="sm" placeholder="Small" />
        </div>
        <div class="grid gap-1.5">
          <Label for="textarea-sizes-default">Default</Label>
          <Textarea v-bind="args" id="textarea-sizes-default" size="default" placeholder="Default" />
        </div>
        <div class="grid gap-1.5">
          <Label for="textarea-sizes-lg">Large</Label>
          <Textarea v-bind="args" id="textarea-sizes-lg" size="lg" placeholder="Large" />
        </div>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="textarea-disabled">Message</Label>
        <Textarea v-bind="args" id="textarea-disabled" placeholder="Disabled" />
      </div>
    `,
	}),
};

export const Readonly: Story = {
	args: { readonly: true, modelValue: 'Read-only content. You can copy but not edit.' },
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="textarea-readonly">Message</Label>
        <Textarea v-bind="args" id="textarea-readonly" />
      </div>
    `,
	}),
};

export const Required: Story = {
	args: { required: true },
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="bio-required" required>Bio</Label>
        <Textarea v-bind="args" id="bio-required" placeholder="Tell us about yourself" />
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: { description: { story: 'Compose Label and helper text via `aria-describedby`.' } },
	},
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="message">Your message</Label>
        <Textarea v-bind="args" id="message" placeholder="Leave a comment…" described-by="message-help" />
        <p id="message-help" class="text-xs text-muted-foreground">Your message will be sent to the support team.</p>
      </div>
    `,
	}),
};

export const WithError: Story = {
	args: { error: true, modelValue: 'too short' },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid` and tints the border. Always pair with referenced helper text.',
			},
		},
	},
	render: (args) => ({
		components: { Textarea, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="bio-error" required>Bio</Label>
        <Textarea v-bind="args" id="bio-error" described-by="bio-error-msg" />
        <p id="bio-error-msg" class="text-xs text-destructive">Bio must be at least 20 characters.</p>
      </div>
    `,
	}),
};

export const AutoResize: Story = {
	args: { autoResize: true },
	parameters: {
		docs: {
			description: {
				story:
					'`autoResize` grows the textarea with content. Useful for chat composers and rich notes.',
			},
		},
	},
	render: () => ({
		components: { Textarea, Label },
		setup() {
			const value = ref('');
			return { value };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="textarea-auto">Message</Label>
        <Textarea id="textarea-auto" v-model="value" auto-resize placeholder="Press Enter — I grow with you." />
      </div>
    `,
	}),
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveTypeEmits: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const ta = canvas.getByRole('textbox');
		await userEvent.type(ta, 'hello');
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe('hello');
	},
};

export const InteractiveDisabledBlocksInput: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const ta = canvas.getByRole('textbox') as HTMLTextAreaElement;
		expect(ta).toBeDisabled();
		expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const ta = canvas.getByRole('textbox');
		expect(ta).toHaveAttribute('aria-invalid', 'true');
		expect(ta).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveLabelAssociation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Textarea, Label },
		template: `
      <div class="grid w-72 gap-2">
        <Label for="ta-assoc">Bio</Label>
        <Textarea id="ta-assoc" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const ta = canvas.getByLabelText('Bio');
		expect(ta).toBeInTheDocument();
		expect(ta.tagName).toBe('TEXTAREA');
	},
};

export const InteractiveAutoResizeGrows: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Typing multi-line content with `autoResize` increases the rendered height beyond the initial min-height.',
			},
		},
	},
	render: () => ({
		components: { Textarea },
		setup() {
			const value = ref('');
			return { value };
		},
		template: `
      <div class="w-72">
        <Textarea data-test-target v-model="value" auto-resize placeholder="grow" aria-label="Auto-resize textarea" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const ta = canvasElement.querySelector('[data-test-target]') as HTMLTextAreaElement;
		const initialHeight = ta.getBoundingClientRect().height;
		ta.focus();
		await userEvent.type(ta, 'one\ntwo\nthree\nfour\nfive\nsix');
		const grownHeight = ta.getBoundingClientRect().height;
		expect(grownHeight).toBeGreaterThan(initialHeight);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Textarea },
		template: `
      <div data-test-root class="grid w-72 gap-3">
        <Textarea size="sm" placeholder="sm" aria-label="Small textarea" />
        <Textarea size="default" placeholder="default" aria-label="Default textarea" />
        <Textarea size="lg" placeholder="lg" aria-label="Large textarea" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const tas = canvasElement.querySelectorAll<HTMLTextAreaElement>('[data-slot="textarea"]');
		expect(tas.length).toBe(3);
		for (const t of tas) expectMinTargetSize(t, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Textarea },
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <Textarea size="sm" placeholder="sm" aria-label="Small textarea" />
        <Textarea size="default" placeholder="default" aria-label="Default textarea" />
        <Textarea size="lg" placeholder="lg" aria-label="Large textarea" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const tas = root.querySelectorAll<HTMLTextAreaElement>('textarea');
			expect(tas.length).toBe(3);
			for (const t of tas) {
				const r = t.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
