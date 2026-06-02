import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ref } from 'vue';
import ColorField from './ColorField.vue';
import Label from '../../form/label/Label.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const meta = {
	title: 'Color/Color Field',
	component: ColorField,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: 'text' },
		defaultValue: { control: 'text' },
		colorSpace: { control: 'select', options: ['rgb', 'hsl', 'hsb'] },
		channel: {
			control: 'select',
			options: [
				undefined,
				'hue',
				'saturation',
				'lightness',
				'brightness',
				'alpha',
				'red',
				'green',
				'blue',
			],
		},
		variant: { control: 'select', options: ['default', 'error'] },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		error: { control: 'boolean' },
		hideSwatch: { control: 'boolean' },
		ariaLabel: { control: 'text' },
		placeholder: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		defaultValue: '#3b82f6',
		colorSpace: 'rgb',
		variant: 'default',
		size: 'default',
		disabled: false,
		readonly: false,
		error: false,
		hideSwatch: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Text input for hex/channel colour values with a leading swatch preview. Mirrors the standard Input visually so it stacks cleanly with other form fields.',
			},
		},
	},
	render: (args) => ({
		components: { ColorField, Label },
		setup: () => ({ args }),
		template: `
      <div class="grid w-64 gap-1.5">
        <Label for="cf">Color</Label>
        <ColorField id="cf" v-bind="args" @update:modelValue="args['onUpdate:modelValue']" />
      </div>
    `,
	}),
} satisfies Meta<typeof ColorField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {
	render: () => ({
		components: { ColorField, Label },
		setup() {
			const color = ref('#3b82f6');
			return { color };
		},
		template: `
      <div class="grid w-64 gap-1.5">
        <Label for="default-cf">Color</Label>
        <ColorField id="default-cf" v-model="color" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { ColorField, Label },
		setup() {
			const a = ref('#22c55e');
			const b = ref('#3b82f6');
			const c = ref('#a855f7');
			return { a, b, c };
		},
		template: `
      <div class="grid w-64 gap-3">
        <div class="grid gap-1.5">
          <Label for="cf-sm">Small</Label>
          <ColorField id="cf-sm" v-model="a" size="sm" />
        </div>
        <div class="grid gap-1.5">
          <Label for="cf-d">Default</Label>
          <ColorField id="cf-d" v-model="b" size="default" />
        </div>
        <div class="grid gap-1.5">
          <Label for="cf-lg">Large</Label>
          <ColorField id="cf-lg" v-model="c" size="lg" />
        </div>
      </div>
    `,
	}),
};

export const ChannelMode: Story = {
	parameters: {
		docs: {
			description: { story: 'Set `channel` to edit a single numeric component (e.g. hue 0–360).' },
		},
	},
	render: () => ({
		components: { ColorField, Label },
		setup() {
			const color = ref('#3b82f6');
			return { color };
		},
		template: `
      <div class="grid w-64 gap-3">
        <div class="grid gap-1.5">
          <Label for="cf-h">Hue</Label>
          <ColorField id="cf-h" v-model="color" channel="hue" colorSpace="hsl" />
        </div>
        <div class="grid gap-1.5">
          <Label for="cf-s">Saturation</Label>
          <ColorField id="cf-s" v-model="color" channel="saturation" colorSpace="hsl" />
        </div>
      </div>
    `,
	}),
};

export const HideSwatch: Story = {
	args: { hideSwatch: true },
	parameters: {
		docs: {
			description: {
				story: 'Set `hideSwatch` when the field appears next to an external preview.',
			},
		},
	},
};

export const WithError: Story = {
	args: { error: true, defaultValue: '#3b82f6', describedBy: 'cf-err' },
	render: () => ({
		components: { ColorField, Label },
		template: `
      <div class="grid w-64 gap-1.5">
        <Label for="err-cf" variant="error">Color</Label>
        <ColorField id="err-cf" default-value="#3b82f6" error described-by="cf-err" />
        <p id="cf-err" class="text-xs text-destructive">This colour is reserved.</p>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: '#ef4444' },
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="color-field"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="color-field-input"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="color-field-swatch"]')).not.toBeNull();
	},
};

export const InteractiveLabelAssociation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ColorField, Label },
		setup() {
			const color = ref('#3b82f6');
			return { color };
		},
		template: `
      <div class="grid w-64 gap-1.5">
        <Label for="la-cf">Brand colour</Label>
        <ColorField id="la-cf" v-model="color" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText('Brand colour');
		await expect(input).toBeInTheDocument();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'cf-msg' },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector(
			'[data-slot="color-field-input"]',
		) as HTMLInputElement;
		await expect(input.getAttribute('aria-invalid')).toBe('true');
		await expect(input.getAttribute('aria-describedby')).toBe('cf-msg');
	},
};

export const InteractiveKeyboardArrows: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'ArrowUp/Down adjust the value (channel mode increments by step; hex mode by 1).',
			},
		},
	},
	args: { channel: 'hue', colorSpace: 'hsl', defaultValue: '#3b82f6' },
	play: async ({ args, canvasElement }) => {
		const input = canvasElement.querySelector(
			'[data-slot="color-field-input"]',
		) as HTMLInputElement;
		input.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector(
			'[data-slot="color-field-input"]',
		) as HTMLInputElement;
		await expect(input.disabled).toBe(true);
		await expect(input.getAttribute('data-disabled')).not.toBeNull();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { ColorField, Label },
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <div class="grid gap-1.5">
          <Label for="rsp-cf">Color</Label>
          <ColorField id="rsp-cf" default-value="#3b82f6" />
        </div>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const field = root.querySelector('[data-slot="color-field"]') as HTMLElement;
			const r = field.getBoundingClientRect();
			await expect(r.height).toBeGreaterThan(0);
		});
	},
};
