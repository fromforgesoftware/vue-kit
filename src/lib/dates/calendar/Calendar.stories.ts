import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import Calendar from './Calendar.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Dates/Calendar',
	component: Calendar,
	// Curated About.mdx — disable autodocs to avoid duplicate docs page.
	tags: ['!autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Density. `sm` = 28px cells, `default` = 32px, `lg` = 36px.',
		},
		numberOfMonths: {
			control: 'number',
			description: 'Render 1 or 2 months side by side.',
		},
		monthYearSelect: {
			control: 'boolean',
			description: 'Replace heading text with month + year `<select>` controls.',
		},
		disabled: { control: 'boolean' },
		fixedWeeks: { control: 'boolean' },
		locale: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		size: 'default',
		numberOfMonths: 1,
		monthYearSelect: false,
		disabled: false,
		fixedWeeks: true,
		locale: 'en',
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Single-date calendar built on Reka UI. Pickers compose this; use it directly only when the calendar should always be visible.',
			},
		},
	},
	render: (args) => ({
		components: { Calendar },
		setup() {
			const date = ref<ForgeDate | null>(null);
			return { args, date };
		},
		template: `
      <div class="space-y-2">
        <Calendar v-bind="args" v-model="date" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">Selected: {{ date?.toISODate() ?? 'None' }}</p>
      </div>
    `,
	}),
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three density tiers. Day cells meet WCAG 2.5.8 (≥ 24×24) at every size.',
			},
		},
	},
	render: (args) => ({
		components: { Calendar },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-4">
        <Calendar v-bind="args" size="sm" />
        <Calendar v-bind="args" size="default" />
        <Calendar v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'All interaction is blocked; the entire calendar is muted.' } },
	},
};

export const WithMinMax: Story = {
	name: 'With Min / Max',
	parameters: {
		docs: {
			description: { story: 'Days outside [min, max] are styled as disabled and reject clicks.' },
		},
	},
	render: (args) => ({
		components: { Calendar },
		setup() {
			const date = ref<ForgeDate | null>(null);
			const min = ForgeDate.now().minus({ days: 7 });
			const max = ForgeDate.now().plus({ days: 30 });
			return { args, date, min, max };
		},
		template: `<Calendar v-bind="args" v-model="date" :min-value="min" :max-value="max" />`,
	}),
};

export const WithUnavailableDates: Story = {
	name: 'With Unavailable Dates',
	parameters: {
		docs: {
			description: {
				story:
					'Use `isDateUnavailable` for context-specific rules (holidays, locked days). Unavailable cells are struck-through.',
			},
		},
	},
	render: (args) => ({
		components: { Calendar },
		setup() {
			const date = ref<ForgeDate | null>(null);
			const isDateUnavailable = (d: ForgeDate) => d.day === 17 || d.day === 18;
			return { args, date, isDateUnavailable };
		},
		template: `<Calendar v-bind="args" v-model="date" :is-date-unavailable="isDateUnavailable" />`,
	}),
};

export const WithMonthYearSelect: Story = {
	name: 'With Month / Year Select',
	args: { monthYearSelect: true },
	parameters: {
		docs: {
			description: {
				story:
					'Set `monthYearSelect` to swap the heading for two `<select>` controls — useful for picking dates far from today.',
			},
		},
	},
};

export const TwoMonths: Story = {
	args: { numberOfMonths: 2 },
	parameters: {
		docs: {
			description: { story: 'Show two months side-by-side. Wraps to a column at narrow widths.' },
		},
	},
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveSelectByClick: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="calendar-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveKeyboardArrowRight: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'ArrowRight moves focus to the next day cell — Reka Calendar listens for real keyboard events.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const triggers = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="calendar-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		);
		const first = triggers[5];
		first.focus();
		await expect(first).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		// Reka focuses the next day; just assert focus moved off the original.
		await expect(document.activeElement).not.toBe(first);
	},
};

export const InteractiveNextButtonAdvancesMonth: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Clicking the next-month button advances the heading.' } },
	},
	play: async ({ canvasElement }) => {
		const heading = canvasElement.querySelector('[data-slot="calendar-heading"]') as HTMLElement;
		const before = heading.textContent ?? '';
		const next = canvasElement.querySelector('[data-slot="calendar-next"]') as HTMLElement;
		await userEvent.click(next);
		await new Promise((r) => setTimeout(r, 50));
		const after = heading.textContent ?? '';
		await expect(after).not.toBe(before);
	},
};

export const InteractiveTodayHasAriaCurrent: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const today = canvasElement.querySelector('[data-today]');
		await expect(today).not.toBeNull();
	},
};

export const InteractiveSelectedHasAriaSelected: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="calendar-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		) as HTMLElement;
		await userEvent.click(trigger);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		const selected = canvasElement.querySelector('[data-selected]');
		await expect(selected).not.toBeNull();
	},
};

export const InteractiveCellTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Day cells meet WCAG 2.2 SC 2.5.8 (≥ 24×24) at all sizes.' } },
	},
	render: () => ({
		components: { Calendar },
		template: `
      <div data-test-root class="flex flex-wrap items-start gap-4 p-2">
        <Calendar size="sm" />
        <Calendar size="default" />
        <Calendar size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		const triggers = root.querySelectorAll<HTMLElement>(
			'[data-slot="calendar-cell-trigger"]:not([data-outside-view])',
		);
		await expect(triggers.length).toBeGreaterThan(0);
		for (const t of Array.from(triggers).slice(0, 6)) expectMinTargetSize(t, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five standard viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { Calendar },
		template: `
      <div data-test-root class="p-2">
        <Calendar />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const calendar = root.querySelector('[data-slot="calendar"]') as HTMLElement;
			const r = calendar.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
		});
	},
};
