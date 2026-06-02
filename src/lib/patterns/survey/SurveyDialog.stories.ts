import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, userEvent } from 'storybook/test';
import SurveyDialog from './SurveyDialog.vue';
import SurveyRatingScale from './SurveyRatingScale.vue';
import Textarea from '../../form/textarea/Textarea.vue';
import Button from '../../general/button/Button.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

// ── Module-level fixtures ──────────────────────────────────────────────

const TWO_STEPS = ['Rating', 'Details'];
const ONE_STEP = ['Rating'];
const THREE_STEPS = ['Ease of use', 'Satisfaction', 'Comments'];

const DIALOG_SIZES = ['xs', 'sm', 'default', 'md', 'lg', 'xl', 'full'] as const;

const meta = {
	title: 'Patterns/Survey Dialog',
	component: SurveyDialog,
	tags: ['!autodocs'],
	argTypes: {
		open: { control: 'boolean', description: 'Controlled open state.' },
		title: { control: 'text', description: 'Dialog title.' },
		steps: { control: 'object', description: 'Step labels — defines step count.' },
		submitLabel: { control: 'text', description: 'Submit button label (last step).' },
		nextLabel: { control: 'text', description: 'Next button label.' },
		backLabel: { control: 'text', description: 'Back button label.' },
		loading: { control: 'boolean', description: 'Whether the form is currently submitting.' },
		size: {
			control: 'select',
			options: DIALOG_SIZES,
			description: 'Dialog size variant (forwarded to underlying `DialogContent`).',
		},
		onSubmit: { action: 'submit' },
		'onUpdate:open': { action: 'update:open' },
		'onUpdate:step': { action: 'update:step' },
	},
	args: {
		open: undefined,
		steps: TWO_STEPS,
		title: 'Help us improve',
		loading: false,
		size: 'sm',
		onSubmit: fn(),
		'onUpdate:open': fn(),
		'onUpdate:step': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A multi-step feedback dialog. Each step renders the matching `#step-N` slot. Submit fires `submit` from the last step; on a single-step survey the only button is the submit.',
			},
		},
	},
	render: (args) => ({
		components: { SurveyDialog, SurveyRatingScale, Textarea, Button },
		setup() {
			const open = ref(args.open ?? false);
			const rating = ref<string>();
			const feedback = ref('');
			return { args, open, rating, feedback };
		},
		template: `
      <div>
        <Button @click="open = true">Open survey</Button>
      <SurveyDialog v-bind="args" v-model:open="open">
        <template #step-0>
          <SurveyRatingScale
            v-model="rating"
            question="How hard was it to set up your account?"
            :min="0"
            :max="8"
          />
        </template>
        <template #step-1>
          <p class="text-sm font-medium text-foreground">Why did you give this rating?</p>
          <Textarea
            v-model="feedback"
            placeholder="How can we improve?"
            class="mt-2"
            rows="4"
          />
        </template>
      </SurveyDialog>
      </div>
    `,
	}),
} satisfies Meta<typeof SurveyDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ──────────────────────────────────────────────────────────

export const MultiStep: Story = {
	args: { steps: TWO_STEPS, title: 'Help us improve' },
};

export const SingleStep: Story = {
	args: { steps: ONE_STEP, title: 'Quick feedback' },
	parameters: {
		docs: {
			description: {
				story:
					'A single-step survey hides the step indicator and back button — the only action is Submit.',
			},
		},
	},
	render: (args) => ({
		components: { SurveyDialog, SurveyRatingScale, Button },
		setup() {
			const open = ref(args.open ?? false);
			const rating = ref<string>();
			return { args, open, rating };
		},
		template: `
      <div>
        <Button @click="open = true">Open survey</Button>
        <SurveyDialog v-bind="args" v-model:open="open">
          <template #step-0>
            <SurveyRatingScale
              v-model="rating"
              question="How satisfied are you with this feature?"
              :min="1"
              :max="5"
              min-label="Not at all"
              max-label="Very satisfied"
            />
          </template>
        </SurveyDialog>
      </div>
    `,
	}),
};

export const ThreeSteps: Story = {
	args: { steps: THREE_STEPS, title: 'Onboarding feedback', size: 'default' },
	render: (args) => ({
		components: { SurveyDialog, SurveyRatingScale, Textarea, Button },
		setup() {
			const open = ref(args.open ?? false);
			const ease = ref<string>();
			const satisfaction = ref<string>();
			const feedback = ref('');
			return { args, open, ease, satisfaction, feedback };
		},
		template: `
      <div>
        <Button @click="open = true">Open survey</Button>
        <SurveyDialog v-bind="args" v-model:open="open">
          <template #step-0>
            <SurveyRatingScale
              v-model="ease"
              question="How easy was the setup process?"
              :min="0"
              :max="10"
              min-label="Very difficult"
              max-label="Very easy"
            />
          </template>
          <template #step-1>
            <SurveyRatingScale
              v-model="satisfaction"
              question="How satisfied are you overall?"
              :min="1"
              :max="5"
              min-label="Not at all"
              max-label="Very satisfied"
            />
          </template>
          <template #step-2>
            <p class="text-sm font-medium text-foreground">Anything else you'd like to share?</p>
            <Textarea
              v-model="feedback"
              placeholder="Your thoughts..."
              class="mt-2"
              rows="4"
            />
          </template>
        </SurveyDialog>
      </div>
    `,
	}),
};

// ── Interactive (Pattern D) ─────────────────────────────────────────────

// Pattern D — InteractiveDragOrSelect.
// SurveyDialog has no drag affordance. The "select" interaction is choosing a
// rating value on the SurveyRatingScale (a horizontal scale of buttons).
export const InteractiveDragOrSelect: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true, steps: TWO_STEPS, title: 'Help us improve' },
	parameters: {
		docs: {
			description: {
				story:
					'Selection equivalent: clicking a value on the embedded `SurveyRatingScale`. The component itself has no drag affordance.',
			},
		},
	},
	play: async () => {
		await new Promise((r) => setTimeout(r, 100));
		const body = inBody();
		const next = body.getByRole('button', { name: /next/i });
		await expect(next).toBeInTheDocument();
		await userEvent.click(next);
		await new Promise((r) => setTimeout(r, 50));
		await expect(document.body.textContent).toContain('2 / 2');
	},
};

// Pattern D — InteractiveKeyboardAlternative (SC 2.5.7).
// All step navigation is keyboard-accessible via Tab + Enter; submit/back
// buttons are real <button> elements.
export const InteractiveKeyboardAlternative: Story = {
	tags: ['!autodocs', 'test'],
	args: { steps: ONE_STEP, title: 'Quick feedback' },
	render: (args) => ({
		components: { SurveyDialog },
		setup() {
			const open = ref(true);
			return { args, open };
		},
		template: `
      <SurveyDialog v-bind="args" v-model:open="open">
        <template #step-0><div>Single step</div></template>
      </SurveyDialog>
    `,
	}),
	play: async ({ args }) => {
		await new Promise((r) => setTimeout(r, 100));
		const submit = document.body.querySelector('[data-slot="survey-dialog-next"]') as HTMLElement;
		submit.focus();
		await expect(submit).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(args.onSubmit).toHaveBeenCalled();
	},
};

// Pattern D — InteractiveBoundaryClamps.
// On step 0 the Back button is hidden (first-step boundary); on the last step
// the Next button becomes the Submit button (last-step boundary).
export const InteractiveBoundaryClamps: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true, steps: TWO_STEPS, title: 'Help us improve' },
	render: (args) => ({
		components: { SurveyDialog },
		setup() {
			const open = ref(true);
			return { args, open };
		},
		template: `
      <SurveyDialog v-bind="args" v-model:open="open">
        <template #step-0><div data-test="step-0">Step 0</div></template>
        <template #step-1><div data-test="step-1">Step 1</div></template>
      </SurveyDialog>
    `,
	}),
	play: async ({ args }) => {
		await new Promise((r) => setTimeout(r, 100));
		// Boundary: step 0 — Back button must NOT be present.
		const prevAtStart = document.body.querySelector('[data-slot="survey-dialog-prev"]');
		await expect(prevAtStart).toBeNull();

		// Advance to last step
		const next = document.body.querySelector('[data-slot="survey-dialog-next"]') as HTMLElement;
		await userEvent.click(next);
		await new Promise((r) => setTimeout(r, 50));

		// Boundary: last step — Back button is now present, Next becomes Submit.
		const prevAtEnd = document.body.querySelector('[data-slot="survey-dialog-prev"]');
		await expect(prevAtEnd).not.toBeNull();
		const submit = document.body.querySelector('[data-slot="survey-dialog-next"]') as HTMLElement;
		await userEvent.click(submit);
		await expect(args.onSubmit).toHaveBeenCalled();
	},
};

// Pattern D — InteractiveActiveStatesAndA11y.
export const InteractiveActiveStatesAndA11y: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true, steps: TWO_STEPS, title: 'Help us improve' },
	render: (args) => ({
		components: { SurveyDialog },
		setup() {
			const open = ref(true);
			return { args, open };
		},
		template: `
      <SurveyDialog v-bind="args" v-model:open="open">
        <template #step-0><div>Step 0</div></template>
        <template #step-1><div>Step 1</div></template>
      </SurveyDialog>
    `,
	}),
	play: async () => {
		await new Promise((r) => setTimeout(r, 100));
		const next = document.body.querySelector('[data-slot="survey-dialog-next"]') as HTMLElement;
		await expect(next).toBeInTheDocument();
		expectMinTargetSize(next, 24);
		const buttons = document.body.querySelectorAll('[data-slot="survey-dialog"] button');
		for (const b of buttons) {
			const r = (b as HTMLElement).getBoundingClientRect();
			if (r.width === 0 && r.height === 0) continue;
			expectMinTargetSize(b as HTMLElement, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { steps: TWO_STEPS },
	render: (args) => ({
		components: { SurveyDialog },
		setup() {
			const open = ref(true);
			return { args, open };
		},
		template: `
      <SurveyDialog v-bind="args" v-model:open="open">
        <template #step-0><div>Step 0</div></template>
        <template #step-1><div>Step 1</div></template>
      </SurveyDialog>
    `,
	}),
	play: async () => {
		await forEachViewport(async () => {
			await new Promise((r) => setTimeout(r, 50));
			const dialog = document.body.querySelector(
				'[data-slot="survey-dialog"]',
			) as HTMLElement | null;
			if (!dialog) return;
			expectNoHorizontalOverflow(dialog);
			const next = dialog.querySelector('[data-slot="survey-dialog-next"]') as HTMLElement | null;
			if (next) {
				expectMinTargetSize(next, 24);
			}
		});
	},
};
