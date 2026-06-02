import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, userEvent } from 'storybook/test';
import Tour from './Tour.vue';
import type { TourStep } from './tour';
import { expectMinTargetSize, inBody } from '../../../test-utils/playHelpers';

// ── Module-level fixtures ──────────────────────────────────────────────

const demoSteps: TourStep[] = [
	{
		target: '[data-tour="nav"]',
		title: 'Navigation',
		description:
			'This is your main navigation. Browse your projects, recent activities, settings, and more.',
		placement: 'right',
	},
	{
		target: '[data-tour="search"]',
		title: 'Search',
		description:
			'Press Cmd+K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
		placement: 'bottom',
	},
	{
		target: '[data-tour="profile"]',
		title: 'Your Profile',
		description: 'Manage your account settings, preferences, and notification options.',
		placement: 'left',
	},
	{
		target: '[data-tour="content"]',
		title: 'Main Content',
		description:
			'This is where your workspace content appears. Create, edit, and manage your work here.',
		placement: 'top',
	},
];

const cardSteps: TourStep[] = [
	{
		target: '[data-tour="card-1"]',
		title: 'Projects',
		description: 'View and manage all your active projects.',
		placement: 'bottom',
	},
	{
		target: '[data-tour="card-2"]',
		title: 'Analytics',
		description: 'Track your performance metrics and KPIs.',
		placement: 'bottom',
	},
	{
		target: '[data-tour="card-3"]',
		title: 'Team',
		description: 'Collaborate with your team members.',
		placement: 'bottom',
	},
];

const meta = {
	title: 'Patterns/Tour',
	component: Tour,
	tags: ['!autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		steps: demoSteps,
		onComplete: fn(),
	},
} satisfies Meta<typeof Tour>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { Tour },
		setup() {
			const tourRef = ref<InstanceType<typeof Tour> | null>(null);
			function startTour() {
				tourRef.value?.start();
			}
			return { args, tourRef, startTour };
		},
		template: `
      <div class="flex h-[600px] bg-background">
        <div data-tour="nav" class="flex w-56 flex-col gap-2 border-r border-border bg-muted/30 p-4">
          <div class="mb-4 flex items-center gap-2">
            <div class="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span class="text-sm font-bold text-primary-foreground">W</span>
            </div>
            <span class="text-sm font-semibold">Workspace</span>
          </div>
          <div class="rounded-md bg-accent px-3 py-2 text-sm">Dashboard</div>
          <div class="px-3 py-2 text-sm text-muted-foreground">Projects</div>
          <div class="px-3 py-2 text-sm text-muted-foreground">Team</div>
          <div class="px-3 py-2 text-sm text-muted-foreground">Settings</div>
        </div>
        <div class="flex flex-1 flex-col">
          <div class="flex items-center justify-between border-b border-border px-6 py-3">
            <h1 class="text-lg font-semibold">Dashboard</h1>
            <div class="flex items-center gap-3">
              <div data-tour="search" class="flex h-8 w-48 items-center rounded-md border border-border bg-muted/50 px-3 text-xs text-muted-foreground">
                Search...
              </div>
              <div data-tour="profile" class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                DS
              </div>
            </div>
          </div>
          <div class="flex-1 p-6">
            <div data-tour="content" class="rounded-lg border border-border p-8 text-center">
              <h2 class="mb-2 text-xl font-semibold">Welcome to your workspace</h2>
              <p class="mb-6 text-sm text-muted-foreground">Get started by taking a quick tour of the interface.</p>
              <button
                class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                @click="startTour"
              >
                Start tour
              </button>
            </div>
          </div>
        </div>
        <Tour ref="tourRef" v-bind="args" />
      </div>
    `,
	}),
};

export const AutoStart: Story = {
	name: 'Auto Start',
	args: { steps: cardSteps },
	render: (args) => ({
		components: { Tour },
		setup() {
			const tourRef = ref<InstanceType<typeof Tour> | null>(null);
			function startTour() {
				tourRef.value?.start();
			}
			return { args, tourRef, startTour };
		},
		template: `
      <div class="flex min-h-[400px] flex-col items-center gap-6 bg-background p-12">
        <button
          class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
          @click="startTour"
        >
          Start tour
        </button>
        <div class="flex items-start justify-center gap-4">
          <div data-tour="card-1" class="w-48 rounded-lg border border-border p-4">
            <h3 class="font-semibold">Projects</h3>
            <p class="mt-1 text-sm text-muted-foreground">12 active</p>
          </div>
          <div data-tour="card-2" class="w-48 rounded-lg border border-border p-4">
            <h3 class="font-semibold">Analytics</h3>
            <p class="mt-1 text-sm text-muted-foreground">View reports</p>
          </div>
          <div data-tour="card-3" class="w-48 rounded-lg border border-border p-4">
            <h3 class="font-semibold">Team</h3>
            <p class="mt-1 text-sm text-muted-foreground">8 members</p>
          </div>
        </div>
        <Tour ref="tourRef" v-bind="args" />
      </div>
    `,
	}),
};

export const TopPlacement: Story = {
	name: 'Top Placement',
	args: {
		steps: [
			{
				target: '[data-tour="top-target"]',
				title: 'Top Placement',
				description: 'This card appears above the target element.',
				placement: 'top',
			},
		],
	},
	render: (args) => ({
		components: { Tour },
		setup() {
			const tourRef = ref<InstanceType<typeof Tour> | null>(null);
			function startTour() {
				tourRef.value?.start();
			}
			return { args, tourRef, startTour };
		},
		template: `
      <div class="flex min-h-[400px] flex-col items-center justify-center gap-6 bg-background p-12">
        <button
          class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
          @click="startTour"
        >
          Start tour
        </button>
        <div data-tour="top-target" class="rounded-lg border border-border p-6 text-center">
          <p class="text-sm text-muted-foreground">The tour card will appear above this element</p>
        </div>
        <Tour ref="tourRef" v-bind="args" />
      </div>
    `,
	}),
};

// ── Interactive tests ──────────────────────────────────────────────────

export const InteractiveNext: Story = {
	tags: ['!autodocs', 'test'],
	args: { steps: cardSteps, autoStart: true },
	render: (args) => ({
		components: { Tour },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-[400px] items-start justify-center gap-4 bg-background p-12">
        <div data-tour="card-1" class="w-48 rounded-lg border border-border p-4">
          <h3 class="font-semibold">Projects</h3>
        </div>
        <div data-tour="card-2" class="w-48 rounded-lg border border-border p-4">
          <h3 class="font-semibold">Analytics</h3>
        </div>
        <div data-tour="card-3" class="w-48 rounded-lg border border-border p-4">
          <h3 class="font-semibold">Team</h3>
        </div>
        <Tour v-bind="args" />
      </div>
    `,
	}),
	play: async () => {
		await new Promise((r) => setTimeout(r, 200));
		const body = inBody();
		// First step title should be visible
		await expect(document.body.textContent).toContain('Projects');
		const nextBtn = document.body.querySelector('[data-slot="tour-card-next"]') as HTMLElement;
		await expect(nextBtn).toBeInTheDocument();
		await userEvent.click(nextBtn);
		await new Promise((r) => setTimeout(r, 200));
		// Second step title (Analytics) should be visible
		const card = document.body.querySelector('[data-slot="tour-card"]');
		await expect(card?.textContent ?? '').toContain('Analytics');
		void body;
	},
};

export const InteractiveSkip: Story = {
	tags: ['!autodocs', 'test'],
	args: { steps: cardSteps, autoStart: true, onComplete: fn() },
	render: (args) => ({
		components: { Tour },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-[400px] items-start justify-center gap-4 bg-background p-12">
        <div data-tour="card-1" class="w-48 rounded-lg border border-border p-4">Card 1</div>
        <div data-tour="card-2" class="w-48 rounded-lg border border-border p-4">Card 2</div>
        <div data-tour="card-3" class="w-48 rounded-lg border border-border p-4">Card 3</div>
        <Tour v-bind="args" />
      </div>
    `,
	}),
	play: async ({ args }) => {
		await new Promise((r) => setTimeout(r, 200));
		const skipBtn = document.body.querySelector('[data-slot="tour-card-skip"]') as HTMLElement;
		await expect(skipBtn).toBeInTheDocument();
		await userEvent.click(skipBtn);
		await new Promise((r) => setTimeout(r, 100));
		await expect(args.onComplete).toHaveBeenCalledWith('skip');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	args: { steps: cardSteps, autoStart: true },
	render: (args) => ({
		components: { Tour },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-[400px] items-start justify-center gap-4 bg-background p-12">
        <div data-tour="card-1" class="w-48 rounded-lg border border-border p-4">Card 1</div>
        <div data-tour="card-2" class="w-48 rounded-lg border border-border p-4">Card 2</div>
        <div data-tour="card-3" class="w-48 rounded-lg border border-border p-4">Card 3</div>
        <Tour v-bind="args" />
      </div>
    `,
	}),
	play: async () => {
		await new Promise((r) => setTimeout(r, 200));
		const card = document.body.querySelector('[data-slot="tour-card"]') as HTMLElement;
		await expect(card).toBeInTheDocument();
		const buttons = card.querySelectorAll('button');
		for (const b of buttons) {
			const r = (b as HTMLElement).getBoundingClientRect();
			if (r.width === 0 && r.height === 0) continue;
			expectMinTargetSize(b as HTMLElement, 24);
		}
	},
};
