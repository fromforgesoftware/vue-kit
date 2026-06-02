import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { Bold, Italic, Underline, Bell } from '@lucide/vue';
import Toggle from './Toggle.vue';
import Icon from '../../general/icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'outline'] as const;
const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Form/Toggle',
	component: Toggle,
	// Disable autodocs because this component has a curated `About.mdx`.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual style. `outline` keeps a border so unpressed toggles read as buttons.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density. Tracks the form ramp — `sm` 28 px, `default` 32 px, `lg` 40 px.',
		},
		disabled: { control: 'boolean', description: 'Disabled state.' },
		modelValue: { control: 'boolean', description: 'Controlled pressed state.' },
		defaultValue: { control: 'boolean', description: 'Uncontrolled initial pressed state.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		variant: 'default',
		size: 'default',
		disabled: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A two-state press button. Reflects state via `aria-pressed` and `data-state="on|off"`. Built on Reka `Toggle`.',
			},
		},
	},
	render: (args) => ({
		components: { Toggle, Icon },
		setup: () => ({ args, Bold }),
		template: `
      <Toggle v-bind="args" aria-label="Bold" @update:modelValue="args['onUpdate:modelValue']">
        <Icon :icon="Bold" />
      </Toggle>
    `,
	}),
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story: '`default` for toolbar density; `outline` for standalone press buttons.',
			},
		},
	},
	render: (args) => ({
		components: { Toggle, Icon },
		setup: () => ({ args, Bold }),
		template: `
      <div class="flex items-center gap-3">
        <Toggle v-bind="args" variant="default" aria-label="Default"><Icon :icon="Bold" /></Toggle>
        <Toggle v-bind="args" variant="outline" aria-label="Outline"><Icon :icon="Bold" /></Toggle>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Three densities. Heights match the Input ramp so toolbars line up.' },
		},
	},
	render: (args) => ({
		components: { Toggle, Icon },
		setup: () => ({ args, Bold }),
		template: `
      <div class="flex items-center gap-3">
        <Toggle v-bind="args" size="sm" aria-label="Small"><Icon :icon="Bold" /></Toggle>
        <Toggle v-bind="args" size="default" aria-label="Default"><Icon :icon="Bold" /></Toggle>
        <Toggle v-bind="args" size="lg" aria-label="Large"><Icon :icon="Bold" /></Toggle>
      </div>
    `,
	}),
};

export const WithText: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Compose icon + text via the default slot. Icons inherit `currentColor`.',
			},
		},
	},
	render: (args) => ({
		components: { Toggle, Icon },
		setup: () => ({ args, Bell }),
		template: `
      <Toggle v-bind="args" aria-label="Toggle notifications">
        <Icon :icon="Bell" />
        Notifications
      </Toggle>
    `,
	}),
};

export const Pressed: Story = {
	args: { defaultValue: true },
	parameters: {
		docs: {
			description: {
				story:
					'Pressed state shown via `bg-accent`. Reka exposes the state via `data-state="on"` and `aria-pressed="true"`.',
			},
		},
	},
};

export const Disabled: Story = {
	parameters: {
		docs: {
			description: { story: 'Disabled toggles ignore pointer/keyboard input and lower opacity.' },
		},
	},
	render: (args) => ({
		components: { Toggle, Icon },
		setup: () => ({ args, Bold }),
		template: `
      <div class="flex items-center gap-3">
        <Toggle v-bind="args" disabled aria-label="Disabled off"><Icon :icon="Bold" /></Toggle>
        <Toggle v-bind="args" disabled :default-value="true" aria-label="Disabled on"><Icon :icon="Bold" /></Toggle>
      </div>
    `,
	}),
};

export const Toolbar: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Cluster of independent toggles. Use `outline` so unpressed buttons are still discoverable.',
			},
		},
	},
	render: () => ({
		components: { Toggle, Icon },
		setup: () => ({ Bold, Italic, Underline }),
		template: `
      <div class="flex gap-1 rounded-md border border-border p-1">
        <Toggle variant="outline" size="sm" aria-label="Bold"><Icon :icon="Bold" /></Toggle>
        <Toggle variant="outline" size="sm" aria-label="Italic"><Icon :icon="Italic" /></Toggle>
        <Toggle variant="outline" size="sm" aria-label="Underline"><Icon :icon="Underline" /></Toggle>
      </div>
    `,
	}),
};

export const Controlled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Bind via `v-model`. The component emits `update:modelValue` on press / Space / Enter.',
			},
		},
	},
	render: () => ({
		components: { Toggle, Icon },
		setup() {
			const pressed = ref(false);
			return { pressed, Bold };
		},
		template: `
      <div class="flex flex-col items-start gap-2">
        <Toggle v-model="pressed" aria-label="Controlled bold"><Icon :icon="Bold" /> Bold</Toggle>
        <p class="text-xs text-muted-foreground">State: {{ pressed ? 'on' : 'off' }}</p>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveClickToggles: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Toggle, Icon },
		setup() {
			const pressed = ref(false);
			return { pressed, Bold };
		},
		template: `
      <Toggle v-model="pressed" aria-label="Bold"><Icon :icon="Bold" /></Toggle>
    `,
	}),
	play: async ({ canvasElement }) => {
		const toggle = canvasElement.querySelector('[data-slot="toggle"]') as HTMLButtonElement;
		expect(toggle).toBeInTheDocument();
		expect(toggle).toHaveAttribute('data-state', 'off');
		await userEvent.click(toggle);
		expect(toggle).toHaveAttribute('data-state', 'on');
		await userEvent.click(toggle);
		expect(toggle).toHaveAttribute('data-state', 'off');
	},
};

export const InteractiveKeyboardToggles: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Toggle, Icon },
		setup() {
			const pressed = ref(false);
			return { pressed, Bold };
		},
		template: `
      <Toggle v-model="pressed" aria-label="Bold"><Icon :icon="Bold" /></Toggle>
    `,
	}),
	play: async ({ canvasElement }) => {
		const toggle = canvasElement.querySelector('[data-slot="toggle"]') as HTMLButtonElement;
		toggle.focus();
		expect(toggle).toHaveFocus();
		await userEvent.keyboard(' ');
		expect(toggle).toHaveAttribute('data-state', 'on');
		await userEvent.keyboard('{Enter}');
		expect(toggle).toHaveAttribute('data-state', 'off');
	},
};

export const InteractiveAriaPressed: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Toggle, Icon },
		setup() {
			const pressed = ref(true);
			return { pressed, Bold };
		},
		template: `
      <Toggle v-model="pressed" aria-label="Bold"><Icon :icon="Bold" /></Toggle>
    `,
	}),
	play: async ({ canvasElement }) => {
		const toggle = canvasElement.querySelector('[data-slot="toggle"]') as HTMLButtonElement;
		expect(toggle).toHaveAttribute('data-state', 'on');
		expect(toggle).toHaveAttribute('aria-pressed', 'true');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const toggle = canvasElement.querySelector('[data-slot="toggle"]') as HTMLButtonElement;
		expect(toggle).toBeDisabled();
		expect(toggle).toHaveAttribute('data-disabled');
		expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Every size meets WCAG 2.2 SC 2.5.8 (≥ 24×24 px) on the painted hit area.',
			},
		},
	},
	render: () => ({
		components: { Toggle, Icon },
		setup: () => ({ Bold }),
		template: `
      <div data-test-root class="flex items-center gap-2 p-2">
        <Toggle size="sm" aria-label="sm"><Icon :icon="Bold" /></Toggle>
        <Toggle size="default" aria-label="default"><Icon :icon="Bold" /></Toggle>
        <Toggle size="lg" aria-label="lg"><Icon :icon="Bold" /></Toggle>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const toggles = canvasElement.querySelectorAll<HTMLElement>('[data-slot="toggle"]');
		expect(toggles.length).toBe(3);
		for (const t of toggles) expectMinTargetSize(t, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Toggles render correctly across all five standard viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { Toggle, Icon },
		setup: () => ({ Bold, Italic, Underline }),
		template: `
      <div data-test-root class="flex flex-wrap items-center gap-2 p-2">
        <Toggle aria-label="Bold"><Icon :icon="Bold" /></Toggle>
        <Toggle aria-label="Italic"><Icon :icon="Italic" /></Toggle>
        <Toggle aria-label="Underline"><Icon :icon="Underline" /></Toggle>
        <Toggle variant="outline" aria-label="Bold outline"><Icon :icon="Bold" /></Toggle>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const toggles = root.querySelectorAll<HTMLElement>('[data-slot="toggle"]');
			expect(toggles.length).toBe(4);
			for (const t of toggles) expectMinTargetSize(t, 24);
		});
	},
};
