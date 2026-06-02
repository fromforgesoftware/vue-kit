import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import Stepper from './Stepper.vue';
import type { Step } from './stepper';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers';

const baseSteps: Step[] = [
	{ id: '1', title: 'Personal Info', description: 'Enter your details' },
	{ id: '2', title: 'Account', description: 'Setup account' },
	{ id: '3', title: 'Confirmation', description: 'Review' },
];

const meta = {
	title: 'General/Stepper',
	component: Stepper,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A horizontal or vertical step indicator for multi-step flows (forms, wizards). Shows progress, marks completed steps with a check, and optionally lets users jump to past steps.',
			},
		},
	},
	argTypes: {
		showNavigation: { control: 'boolean', description: 'Render Previous / Next buttons.' },
		loading: {
			control: 'boolean',
			description: 'Show spinner on the active step and disable nav.',
		},
		interactive: {
			control: 'select',
			options: [false, true, 'any'],
			description:
				'Allow clicking step indicators. `false` (default): none clickable. `true`: only completed/past steps. `"any"`: every non-disabled step.',
		},
		orientation: {
			control: 'select',
			options: ['horizontal', 'vertical'],
			description: 'Layout axis of the step row.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onStepComplete: { action: 'stepComplete' },
		onFinish: { action: 'finish' },
	},
	args: {
		steps: baseSteps,
		showNavigation: true,
		loading: false,
		interactive: false,
		orientation: 'horizontal',
		'onUpdate:modelValue': fn(),
		onStepComplete: fn(),
		onFinish: fn(),
	},
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(0);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" v-bind="args">
        <template #default="{ currentStep: step, stepIndex }">
          <div class="p-4 border rounded-md">
            <h3 class="text-sm font-semibold">Step {{ stepIndex + 1 }}: {{ step?.title }}</h3>
            <p class="text-xs text-muted-foreground mt-1">{{ step?.description }}</p>
          </div>
        </template>
      </Stepper>
    `,
	}),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Loading: Story = {
	args: { loading: true },
	parameters: {
		docs: {
			description: {
				story:
					'Loading replaces the active step number with a spinner and disables the Next button.',
			},
		},
	},
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(1);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" v-bind="args">
        <template #default="{ currentStep: step, stepIndex }">
          <div class="p-4 border rounded-md">
            <h3 class="text-sm font-semibold">Step {{ stepIndex + 1 }}: {{ step?.title }}</h3>
            <p class="text-xs text-muted-foreground mt-1">Processing…</p>
          </div>
        </template>
      </Stepper>
    `,
	}),
};

export const Completed: Story = {
	args: {
		steps: [
			{ id: '1', title: 'Personal Info', description: 'Enter your details', completed: true },
			{ id: '2', title: 'Account', description: 'Setup account', completed: true },
			{ id: '3', title: 'Confirmation', description: 'Review', completed: true },
		] as Step[],
	},
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(2);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" v-bind="args">
        <template #default="{ currentStep: step, stepIndex }">
          <div class="p-4 border rounded-md">
            <h3 class="text-sm font-semibold">All done · {{ step?.title }}</h3>
          </div>
        </template>
      </Stepper>
    `,
	}),
};

export const Interactive: Story = {
	args: { interactive: true },
	parameters: {
		docs: {
			description: {
				story:
					'With `interactive`, completed steps become clickable so users can jump back. Future steps remain disabled.',
			},
		},
	},
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(2);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" v-bind="args">
        <template #default="{ currentStep: step, stepIndex }">
          <div class="p-4 border rounded-md">
            <h3 class="text-sm font-semibold">Step {{ stepIndex + 1 }}: {{ step?.title }}</h3>
          </div>
        </template>
      </Stepper>
    `,
	}),
};

export const Orientations: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`vertical` lays steps top-to-bottom — useful for narrow side-panels or long descriptions.',
			},
		},
	},
	render: () => ({
		components: { Stepper },
		setup() {
			const horizontal = ref(1);
			const vertical = ref(1);
			return { horizontal, vertical, baseSteps };
		},
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div class="text-xs font-medium text-muted-foreground mb-2">horizontal (default)</div>
          <Stepper v-model="horizontal" :steps="baseSteps" :show-navigation="false">
            <template #default="{ currentStep: step }">
              <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
            </template>
          </Stepper>
        </div>
        <div>
          <div class="text-xs font-medium text-muted-foreground mb-2">vertical</div>
          <Stepper v-model="vertical" :steps="baseSteps" orientation="vertical" :show-navigation="false">
            <template #default="{ currentStep: step }">
              <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
            </template>
          </Stepper>
        </div>
      </div>
    `,
	}),
};

export const WithOptionalStep: Story = {
	args: {
		steps: [
			{ id: '1', title: 'Required', description: 'First' },
			{ id: '2', title: 'Optional', description: 'Skip if you like', optional: true },
			{ id: '3', title: 'Finish', description: 'Last' },
		] as Step[],
	},
	parameters: {
		docs: {
			description: {
				story:
					'Optional steps render with a dashed indicator and a small "Optional" hint underneath.',
			},
		},
	},
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="stepper"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="stepper-list"]')).not.toBeNull();
		const indicators = canvasElement.querySelectorAll('[data-slot="stepper-indicator"]');
		await expect(indicators.length).toBe(3);
		await expect(canvasElement.querySelector('[data-slot="stepper-content"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="stepper-actions"]')).not.toBeNull();
	},
};

export const InteractiveAriaCurrent: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'The active step indicator carries `aria-current="step"`; others do not.',
			},
		},
	},
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(1);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" :steps="args.steps">
        <template #default="{ currentStep: step }">
          <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
        </template>
      </Stepper>
    `,
	}),
	play: async ({ canvasElement }) => {
		const indicators = canvasElement.querySelectorAll('[data-slot="stepper-indicator"]');
		await expect(indicators.length).toBe(3);
		await expect(indicators[0].getAttribute('aria-current')).toBeNull();
		await expect(indicators[1].getAttribute('aria-current')).toBe('step');
		await expect(indicators[2].getAttribute('aria-current')).toBeNull();
	},
};

export const InteractiveCompletedShowsCheck: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(2);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" :steps="args.steps">
        <template #default="{ currentStep: step }">
          <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
        </template>
      </Stepper>
    `,
	}),
	play: async ({ canvasElement }) => {
		// Steps 0 and 1 are completed; step 2 is active.
		const checks = canvasElement.querySelectorAll('[data-slot="stepper-check"]');
		await expect(checks.length).toBe(2);
	},
};

export const InteractiveClickableStepEmits: Story = {
	tags: ['!autodocs', 'test'],
	args: { interactive: true },
	parameters: {
		docs: {
			description: {
				story:
					'Clicking a completed step indicator emits `update:modelValue` with the target index.',
			},
		},
	},
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(2);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" v-bind="args">
        <template #default="{ currentStep: step }">
          <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
        </template>
      </Stepper>
    `,
	}),
	play: async ({ args, canvasElement }) => {
		const indicators = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="stepper-indicator"]',
		);
		await expect(indicators.length).toBe(3);
		// First indicator is a button (completed + clickable).
		await expect(indicators[0].tagName).toBe('BUTTON');
		await userEvent.click(indicators[0]);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(0);
	},
};

export const InteractiveNonInteractiveIndicatorsAreDivs: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'When `interactive` is unset, indicators render as `<div>` — no fake buttons in the tab order.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const indicators = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="stepper-indicator"]',
		);
		for (const ind of indicators) {
			await expect(ind.tagName).toBe('DIV');
		}
	},
};

export const InteractiveFocusVisible: Story = {
	tags: ['!autodocs', 'test'],
	args: { interactive: 'any' },
	render: (args) => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(0);
			return { args, currentStep };
		},
		template: `
      <Stepper v-model="currentStep" v-bind="args">
        <template #default="{ currentStep: step }">
          <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
        </template>
      </Stepper>
    `,
	}),
	play: async ({ canvasElement }) => {
		// With interactive='any', non-current steps become buttons.
		const indicators = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="stepper-indicator"]',
		);
		const buttons = Array.from(indicators).filter((i) => i.tagName === 'BUTTON');
		await expect(buttons.length).toBeGreaterThan(0);
		buttons[0].focus();
		await expect(buttons[0]).toHaveFocus();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Stepper renders without horizontal overflow at every viewport.' },
		},
	},
	render: () => ({
		components: { Stepper },
		setup() {
			const currentStep = ref(1);
			return { currentStep, baseSteps };
		},
		template: `
      <div data-test-root class="p-2">
        <Stepper v-model="currentStep" :steps="baseSteps" :show-navigation="false">
          <template #default="{ currentStep: step }">
            <div class="p-3 border rounded-md text-sm">{{ step?.title }}</div>
          </template>
        </Stepper>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const indicators = root.querySelectorAll<HTMLElement>('[data-slot="stepper-indicator"]');
			await expect(indicators.length).toBe(3);
			for (const ind of indicators) {
				const r = ind.getBoundingClientRect();
				await expect(r.width).toBeGreaterThanOrEqual(24);
				await expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
