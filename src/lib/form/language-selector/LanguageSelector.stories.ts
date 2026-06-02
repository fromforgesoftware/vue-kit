import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import LanguageSelector from './LanguageSelector.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const allLocales = [
	'de',
	'de_DE',
	'en',
	'en_GB',
	'en_US',
	'es',
	'es_ES',
	'fr',
	'fr_CA',
	'fr_FR',
	'it',
	'it_IT',
	'pl',
	'pl_PL',
	'pt',
	'pt_BR',
	'pt_PT',
];

const meta = {
	title: 'Form/LanguageSelector',
	component: LanguageSelector,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Composite locale picker with two variants — <code>inline</code> (compact globe button used in nav / footer, built on DropdownMenu) and <code>select</code> (full bordered Select used in settings forms).',
			},
		},
	},
	argTypes: {
		variant: { control: 'select', options: ['inline', 'select'] },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		tone: { control: 'select', options: ['muted', 'foreground'] },
		density: { control: 'select', options: ['compact', 'default'] },
		disabled: { control: 'boolean' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		modelValue: 'en_GB',
		locales: allLocales,
		variant: 'inline',
		size: 'default',
		tone: 'muted',
		density: 'compact',
		disabled: false,
		side: 'bottom',
		'onUpdate:modelValue': fn(),
	},
	render: (args) => ({
		components: { LanguageSelector },
		setup() {
			const locale = ref(args.modelValue);
			return { args, locale };
		},
		template: `
      <div class="flex flex-col items-start gap-3 p-4">
        <p class="text-xs text-muted-foreground">Selected: {{ locale }}</p>
        <LanguageSelector v-bind="args" v-model="locale" />
      </div>
    `,
	}),
} satisfies Meta<typeof LanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const SelectVariant: Story = {
	args: { variant: 'select' },
	parameters: {
		docs: {
			description: {
				story:
					'The <code>select</code> variant uses the form Select component — fits naturally in settings forms alongside other inputs.',
			},
		},
	},
};

export const InlineTones: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Inline trigger tone — switch between muted (footer / nav) and foreground (header).',
			},
		},
	},
	render: () => ({
		components: { LanguageSelector },
		setup() {
			const a = ref('en_GB');
			const b = ref('en_GB');
			return { a, b, allLocales };
		},
		template: `
      <div class="flex gap-6 p-4">
        <LanguageSelector v-model="a" :locales="allLocales" tone="muted" />
        <LanguageSelector v-model="b" :locales="allLocales" tone="foreground" />
      </div>
    `,
	}),
};

export const FewLocales: Story = {
	args: {
		modelValue: 'en_GB',
		locales: ['en_GB', 'es_ES', 'fr_FR'],
	},
};

export const Disabled: Story = {
	args: { disabled: true },
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpensOnTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		// When the dropdown opens, Reka places aria-hidden on the Storybook
		// canvas root for focus-trap; that root contains other test stories'
		// residual focusable content, which axe flags as aria-hidden-focus —
		// an artifact of the Storybook iframe, not the component. The same
		// overlay is also flagged as scrollable-region-focusable because Reka
		// renders an overflow:auto wrapper without tabindex; that wrapper is
		// entirely keyboard-reachable via the inner menuitem buttons.
		a11y: {
			config: {
				rules: [
					{ id: 'aria-hidden-focus', enabled: false },
					{ id: 'scrollable-region-focusable', enabled: false },
				],
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /select language/i });
		await userEvent.click(trigger);
		await waitFor(() => {
			const el = document.body.querySelector('[data-slot="dropdown-menu-content"]');
			if (!el) throw new Error('content not found');
			return el;
		});
	},
};

export const InteractiveSelectEmits: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		// Same Storybook iframe artifact as InteractiveOpensOnTrigger — Reka
		// applies aria-hidden to the canvas root while the menu is open, and
		// the Reka menu wrapper has overflow:auto without an extra tabindex.
		a11y: {
			config: {
				rules: [
					{ id: 'aria-hidden-focus', enabled: false },
					{ id: 'scrollable-region-focusable', enabled: false },
				],
			},
		},
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /select language/i });
		await userEvent.click(trigger);
		const items = await inBody().findAllByRole('menuitemradio');
		expect(items.length).toBeGreaterThan(0);
		// Pick a different option from the current value
		const target = items.find((it) => it.textContent?.includes('English (US)'));
		if (!target) throw new Error('English (US) option not found');
		await userEvent.click(target);
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="language-selector-trigger"]',
		) as HTMLElement;
		expect(trigger).toBeInTheDocument();
		expect(trigger).toHaveAttribute('data-variant', 'inline');
	},
};

export const InteractiveSelectVariantTrigger: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'select' },
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="language-selector-trigger"]',
		) as HTMLElement;
		expect(trigger).toBeInTheDocument();
		expect(trigger.tagName).toBe('BUTTON');
	},
};

export const InteractiveResolveBareCode: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: 'en' },
	play: async ({ args }) => {
		// mounted watch immediately resolves bare → regional
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('en_GB');
		});
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="language-selector-trigger"]',
		) as HTMLElement;
		expectMinTargetSize(trigger, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { LanguageSelector },
		setup() {
			const locale = ref('en_GB');
			return { locale, allLocales };
		},
		template: `
      <div data-test-root class="p-2">
        <LanguageSelector v-model="locale" :locales="allLocales" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector('[data-slot="language-selector-trigger"]') as HTMLElement;
			expectMinTargetSize(trigger, 24);
		});
	},
};
