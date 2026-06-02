import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import CardTitle from './CardTitle.vue';
import CardDescription from './CardDescription.vue';
import CardContent from './CardContent.vue';
import CardFooter from './CardFooter.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const ALL_VARIANTS = ['default', 'muted', 'ghost', 'accent'] as const;
const ALL_PADDINGS = ['none', 'sm', 'default', 'lg'] as const;

const meta = {
	title: 'General/Card',
	component: Card,
	tags: ['!autodocs'],
	argTypes: {
		variant: { control: 'select', options: ALL_VARIANTS, description: 'Surface style.' },
		padding: { control: 'select', options: ALL_PADDINGS, description: 'Inner spacing.' },
		interactive: {
			control: 'boolean',
			description: 'Add hover/focus styling for clickable cards.',
		},
		accentColor: {
			control: 'color',
			description: 'Top accent line color (variant="accent" only). Defaults to grey.',
		},
	},
	args: {
		variant: 'default',
		padding: 'default',
		interactive: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Surface used to group related content. Compose with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.',
			},
		},
	},
	render: (args) => ({
		components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter },
		setup: () => ({ args }),
		template: `
      <Card v-bind="args" class="w-80">
        <CardHeader>
          <CardTitle>Project status</CardTitle>
          <CardDescription>Updated 2 minutes ago.</CardDescription>
        </CardHeader>
        <CardContent spacing="default">
          <p class="text-sm">Three of four milestones are complete. The last one is on track.</p>
        </CardContent>
        <CardFooter align="end" spacing="default">
          <p class="text-xs text-muted-foreground">Footer information</p>
        </CardFooter>
      </Card>
    `,
	}),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Three surface styles. `default` for primary content; `muted` for secondary surfaces; `ghost` for embedded sections that share their parent's background.",
			},
		},
	},
	render: () => ({
		components: { Card, CardHeader, CardTitle, CardDescription },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div class="flex flex-col gap-3 w-80">
        <Card v-for="v in ALL_VARIANTS" :key="v" :variant="v">
          <CardHeader>
            <CardTitle size="sm">{{ v }}</CardTitle>
            <CardDescription>Card surface variant.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    `,
	}),
};

export const Accent: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The `accent` variant adds a colored top line. Pass `accentColor` (any CSS color) to set its color — defaults to grey when omitted.',
			},
		},
	},
	render: () => ({
		components: { Card, CardHeader, CardTitle, CardDescription },
		template: `
      <div class="flex flex-col gap-3 w-80">
        <Card variant="accent">
          <CardHeader>
            <CardTitle size="sm">Default (grey)</CardTitle>
            <CardDescription>No accentColor passed.</CardDescription>
          </CardHeader>
        </Card>
        <Card variant="accent" accentColor="#3b82f6">
          <CardHeader>
            <CardTitle size="sm">Custom blue</CardTitle>
            <CardDescription>accentColor="#3b82f6"</CardDescription>
          </CardHeader>
        </Card>
        <Card variant="accent" accentColor="#10b981">
          <CardHeader>
            <CardTitle size="sm">Custom green</CardTitle>
            <CardDescription>accentColor="#10b981"</CardDescription>
          </CardHeader>
        </Card>
      </div>
    `,
	}),
};

export const Padding: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Four padding tokens. Use `none` when the card hosts a flush layout (e.g. table); `default` for general content.',
			},
		},
	},
	render: () => ({
		components: { Card },
		setup: () => ({ ALL_PADDINGS }),
		template: `
      <div class="flex flex-col gap-3 w-80">
        <Card v-for="p in ALL_PADDINGS" :key="p" :padding="p">
          <p class="text-sm text-muted-foreground">padding: {{ p }}</p>
        </Card>
      </div>
    `,
	}),
};

export const Interactive: Story = {
	args: { interactive: true },
	parameters: {
		docs: {
			description: {
				story:
					'Set `interactive` for clickable or focusable cards. Adds a hover border and a focus ring.',
			},
		},
	},
	render: (args) => ({
		components: { Card, CardHeader, CardTitle, CardDescription },
		setup: () => ({ args }),
		template: `
      <Card v-bind="args" class="w-80" tabindex="0" role="button">
        <CardHeader>
          <CardTitle>Clickable card</CardTitle>
          <CardDescription>Hover and tab to see the focus ring.</CardDescription>
        </CardHeader>
      </Card>
    `,
	}),
};

export const TitleSizes: Story = {
	parameters: {
		docs: { description: { story: 'Title sizes scale independently of the card padding.' } },
	},
	render: () => ({
		components: { Card, CardHeader, CardTitle, CardDescription },
		template: `
      <div class="flex flex-col gap-3 w-80">
        <Card>
          <CardHeader>
            <CardTitle size="sm">Small title</CardTitle>
            <CardDescription size="sm">Compact description</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Default title</CardTitle>
            <CardDescription>Standard description</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle size="lg">Large title</CardTitle>
            <CardDescription size="lg">Prominent description</CardDescription>
          </CardHeader>
        </Card>
      </div>
    `,
	}),
};

export const FooterAlignment: Story = {
	parameters: {
		docs: {
			description: { story: 'CardFooter `align` controls horizontal placement of action rows.' },
		},
	},
	render: () => ({
		components: { Card, CardHeader, CardTitle, CardContent, CardFooter },
		template: `
      <div class="flex flex-col gap-3 w-80">
        <Card>
          <CardHeader><CardTitle size="sm">align: start</CardTitle></CardHeader>
          <CardFooter align="start" spacing="default"><span class="text-xs text-muted-foreground">action</span></CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle size="sm">align: between</CardTitle></CardHeader>
          <CardFooter align="between" spacing="default">
            <span class="text-xs text-muted-foreground">left</span>
            <span class="text-xs text-muted-foreground">right</span>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle size="sm">align: end</CardTitle></CardHeader>
          <CardFooter align="end" spacing="default"><span class="text-xs text-muted-foreground">action</span></CardFooter>
        </Card>
      </div>
    `,
	}),
};

export const Simple: Story = {
	parameters: {
		docs: { description: { story: 'Minimal example with only a content block.' } },
	},
	render: () => ({
		components: { Card, CardContent },
		template: `
      <Card class="w-80">
        <CardContent>
          <p class="text-sm">A simple card with just content.</p>
        </CardContent>
      </Card>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="card"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
		await expect(canvasElement.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
	},
};

export const InteractiveTitleSemantic: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const title = canvasElement.querySelector('[data-slot="card-title"]') as HTMLElement;
		await expect(title.tagName).toBe('H3');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Card, CardHeader, CardTitle, CardDescription, CardContent },
		setup: () => ({ ALL_VARIANTS }),
		template: `
      <div data-test-root class="flex flex-col gap-3 p-2">
        <Card v-for="v in ALL_VARIANTS" :key="v" :variant="v">
          <CardHeader>
            <CardTitle>{{ v }}</CardTitle>
            <CardDescription>The quick brown fox jumps over the lazy dog.</CardDescription>
          </CardHeader>
          <CardContent spacing="default">Card content area sample.</CardContent>
        </Card>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cards = root.querySelectorAll('[data-slot="card"]');
			await expect(cards.length).toBe(3);
		});
	},
};
