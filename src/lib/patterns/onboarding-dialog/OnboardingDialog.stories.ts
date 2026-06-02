import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import OnboardingDialog from './OnboardingDialog.vue';
import Button from '../../general/button/Button.vue';
import { inBody, expectMinTargetSize, forEachViewport } from '../../../test-utils/playHelpers.js';
import type { OnboardingStep } from './onboarding-dialog.js';

// ── Module-level fixtures ───────────────────────────────────────────────────

const STEPS: OnboardingStep[] = [
	{ id: 'welcome', title: 'Welcome', description: 'Get started with our platform.' },
	{ id: 'schedule', title: 'Scheduling', description: 'Create and manage schedules easily.' },
	{ id: 'ready', title: "You're All Set!", description: 'Explore the app now.' },
];

// ── Meta ────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/OnboardingDialog',
	component: OnboardingDialog,
	tags: ['!autodocs'],
	argTypes: {
		open: { control: 'boolean', description: 'Whether the dialog is open.' },
		steps: { control: 'object', description: 'Array of onboarding step definitions.' },
		skipLabel: { control: 'text', description: 'Label for the skip button.' },
		nextLabel: { control: 'text', description: 'Label for the next button.' },
		finishLabel: { control: 'text', description: 'Label for the finish button (last step).' },
		hideCloseButton: { control: 'boolean', description: 'Hide the close (X) button.' },
		onComplete: { action: 'complete' },
		onSkip: { action: 'skip' },
		onNext: { action: 'next' },
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		open: undefined,
		steps: STEPS,
		onComplete: fn(),
		onSkip: fn(),
		onNext: fn(),
		'onUpdate:open': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A multi-step onboarding dialog with step indicators, forward/skip navigation, and optional media slots per step.',
			},
		},
	},
	render: (args) => ({
		components: { OnboardingDialog, Button },
		setup() {
			const open = ref(args.open ?? false);
			function onUpdateOpen(v: boolean) {
				open.value = v;
				args['onUpdate:open']?.(v);
			}
			return { args, open, onUpdateOpen };
		},
		template: `
      <div>
        <Button @click="open = true">Open onboarding</Button>
        <OnboardingDialog
          v-bind="args"
          :open="open"
          @complete="args.onComplete"
          @skip="args.onSkip"
          @next="args.onNext"
          @update:open="onUpdateOpen"
        />
      </div>
    `,
	}),
} satisfies Meta<typeof OnboardingDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────────

export const Default: Story = {};

export const SingleStep: Story = {
	args: {
		steps: [STEPS[0]],
	},
};

export const CustomFinishLabel: Story = {
	args: {
		finishLabel: "Let's Go",
		steps: [STEPS[2]],
	},
};

export const HideCloseButton: Story = {
	args: {
		hideCloseButton: true,
	},
};

// ── Interactive stories ───────────────────────────────────────────────────────

export const InteractiveNext: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async ({ args }) => {
		const body = inBody();
		// Reka mirrors the step title into a VisuallyHidden DialogTitle, so the
		// step text appears twice in the accessibility tree. Use the
		// `data-slot="onboarding-dialog-title"` selector to target the visible h2.
		const titleEl = () =>
			document.querySelector('[data-slot="onboarding-dialog-title"]') as HTMLElement | null;
		await expect(titleEl()?.textContent?.trim()).toBe('Welcome');
		const nextBtn = body.getByRole('button', { name: /next/i });
		await userEvent.click(nextBtn);
		await expect(titleEl()?.textContent?.trim()).toBe('Scheduling');
		await expect(args.onNext).toHaveBeenCalledOnce();
	},
};

export const InteractiveFinish: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		open: true,
		steps: [STEPS[2]], // Only last step so Next = Finish
	},
	play: async ({ args }) => {
		const body = inBody();
		const finishBtn = body.getByRole('button', { name: /get started/i });
		await expect(finishBtn).toBeInTheDocument();
		await userEvent.click(finishBtn);
		await expect(args.onComplete).toHaveBeenCalled();
	},
};

export const InteractiveSkip: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async ({ args }) => {
		const body = inBody();
		const skipBtn = body.getByRole('button', { name: /skip/i });
		await userEvent.click(skipBtn);
		await expect(args.onSkip).toHaveBeenCalled();
	},
};

export const InteractiveClose: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async ({ args }) => {
		const body = inBody();
		const dialog = body.getByRole('dialog');
		await expect(dialog).toBeInTheDocument();
		// The X close button is `max-sm:hidden` (mobile uses the drag handle / overlay
		// click). Pressing Escape works in every viewport and is the keyboard
		// alternative we want to assert anyway.
		await userEvent.keyboard('{Escape}');
		await expect(args['onUpdate:open']).toHaveBeenCalledWith(false);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async () => {
		const body = inBody();
		const buttons = body.getAllByRole('button');
		for (const btn of buttons) {
			expectMinTargetSize(btn, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async () => {
		await forEachViewport(async () => {
			const body = inBody();
			const dialog = body.getByRole('dialog');
			await expect(dialog).toBeInTheDocument();
		});
	},
};
