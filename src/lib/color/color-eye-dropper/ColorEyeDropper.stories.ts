import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import ColorEyeDropper from './ColorEyeDropper.vue';

const meta = {
	title: 'Color/Color Eye Dropper',
	component: ColorEyeDropper,
	tags: ['!autodocs'],
	argTypes: {
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		disabled: { control: 'boolean' },
		ariaLabel: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onPick: { action: 'pick' },
	},
	args: {
		size: 'default',
		disabled: false,
		ariaLabel: 'Pick colour from screen',
		'onUpdate:modelValue': fn(),
		onPick: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Icon button that opens the native screen colour-picker (`window.EyeDropper`). Renders nothing on browsers that lack the API (Firefox, Safari at time of writing).',
			},
		},
	},
} satisfies Meta<typeof ColorEyeDropper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		components: { ColorEyeDropper },
		setup() {
			const color = ref<string>('—');
			return { color };
		},
		template: `
      <div class="flex items-center gap-3">
        <ColorEyeDropper @update:modelValue="(v) => (color = v)" />
        <span class="text-sm tabular-nums">{{ color }}</span>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: () => ({
		components: { ColorEyeDropper },
		template: `
      <div class="flex items-center gap-3">
        <ColorEyeDropper size="sm" />
        <ColorEyeDropper size="default" />
        <ColorEyeDropper size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};
