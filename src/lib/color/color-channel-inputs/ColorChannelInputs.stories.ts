import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import ColorChannelInputs from './ColorChannelInputs.vue';

const meta = {
	title: 'Color/Color Channel Inputs',
	component: ColorChannelInputs,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: 'text' },
		defaultValue: { control: 'text' },
		showAlpha: { control: 'boolean' },
		defaultTab: { control: 'select', options: ['hex', 'rgb', 'hsl', 'hsb'] },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		disabled: { control: 'boolean' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		'onUpdate:tab': { action: 'update:tab' },
	},
	args: {
		defaultValue: '#3b82f6',
		showAlpha: false,
		defaultTab: 'hex',
		size: 'sm',
		disabled: false,
		'onUpdate:modelValue': fn(),
		'onUpdate:tab': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Tabbed numeric/text inputs for editing a colour as Hex, RGB, HSL, or HSB. All tabs share the same v-model (hex). Designed to live inside the Color Picker popover, but works standalone.',
			},
		},
	},
	render: (args) => ({
		components: { ColorChannelInputs },
		setup: () => ({ args }),
		template: `
      <div class="w-72">
        <ColorChannelInputs v-bind="args" @update:modelValue="args['onUpdate:modelValue']" @update:tab="args['onUpdate:tab']" />
      </div>
    `,
	}),
} satisfies Meta<typeof ColorChannelInputs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		components: { ColorChannelInputs },
		setup() {
			const color = ref('#3b82f6');
			return { color };
		},
		template: `
      <div class="grid w-72 gap-3">
        <ColorChannelInputs v-model="color" />
        <div class="flex items-center gap-2">
          <span class="size-5 rounded-sm ring-1 ring-foreground/15" :style="{ backgroundColor: color }" />
          <span class="text-sm tabular-nums">{{ color }}</span>
        </div>
      </div>
    `,
	}),
};

export const WithAlpha: Story = {
	args: { showAlpha: true },
};

export const StartOnRgb: Story = {
	args: { defaultTab: 'rgb' },
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: '#ef4444' },
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="color-channel-inputs"]')).not.toBeNull();
		await expect(
			canvasElement.querySelector('[data-slot="color-channel-inputs-pane-hex"]'),
		).not.toBeNull();
	},
};

export const InteractiveSwitchTab: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const rgb = canvas.getByRole('tab', { name: /rgb/i });
		await userEvent.click(rgb);
		await expect(args['onUpdate:tab']).toHaveBeenCalledWith('rgb');
	},
};
