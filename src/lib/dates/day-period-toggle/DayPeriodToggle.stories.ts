import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import DayPeriodToggle from './DayPeriodToggle.vue';
import TimeField from '../time-field/TimeField.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

// ── Module-level fixtures ─────────────────────────────────────────────────
//
// `DayPeriodToggle` is a **renderless** behaviour helper. It has zero direct
// props/emits — its public surface is exposed via `defineExpose` and its only
// observable behaviour comes through the host `TimeField`'s 12-hour clock.
//
// The args below describe the host `TimeField`'s `hourCycle` so consumers can
// see the only context in which the helper is meaningful (12-hour clocks). All
// stories render a real `TimeField` so `injectTimeFieldRootContext()` resolves.

const HOUR_CYCLES = [12, 24] as const;

interface DayPeriodToggleStoryArgs {
	hourCycle?: 12 | 24;
	initialValue?: ForgeDate | null;
}

const meta = {
	title: 'Dates/DayPeriodToggle',
	component: DayPeriodToggle,
	tags: ['!autodocs'],
	argTypes: {
		hourCycle: {
			control: 'select',
			options: HOUR_CYCLES,
			description:
				'Host `TimeField` hour cycle. Only `12` exposes a `dayPeriod` segment for the toggle to drive.',
		},
		initialValue: {
			control: false,
			description:
				'Optional pre-set time bound to the host `TimeField`. `null` shows placeholders.',
		},
	},
	args: {
		hourCycle: 12,
		initialValue: null,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Renderless helper that drives the AM/PM segment of a `TimeField` without going through Reka's built-in ±12-hour keydown shift. Used internally by `TimeField` — exposed here so the behaviour and keyboard model are documented.",
			},
		},
	},
	render: (args: DayPeriodToggleStoryArgs) => ({
		components: { TimeField },
		setup() {
			const value = ref<ForgeDate | null>(args.initialValue ?? null);
			return { args, value };
		},
		template: `<TimeField v-model="value" :hour-cycle="args.hourCycle" />`,
	}),
} satisfies Meta<DayPeriodToggleStoryArgs>;

export default meta;
type Story = StoryObj<DayPeriodToggleStoryArgs>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Hosted inside a 12-hour `TimeField`. Clicking the AM/PM segment, pressing Arrow keys, or pressing `A` / `P` calls into `DayPeriodToggle` to flip the dayPeriod without touching the hour value.',
			},
		},
	},
};

// ── Interactive stories (Pattern B contract) ────────────────────────────────

export const InteractiveTypeAndEmit: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Clicking the AM/PM segment toggles its value — the segment label flips between AM and PM.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const dayPeriod = canvasElement.querySelector<HTMLElement>('[data-segment="dayPeriod"]');
		expect(dayPeriod).toBeInTheDocument();
		const initial = dayPeriod!.textContent?.trim();
		await userEvent.click(dayPeriod!);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(dayPeriod!.textContent?.trim()).not.toBe(initial);
	},
};

export const InteractiveKeyboardNav: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'ArrowUp, ArrowDown, and `A` / `P` shortcuts each drive the segment with focus restored on the dayPeriod field.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const dayPeriod = canvasElement.querySelector<HTMLElement>('[data-segment="dayPeriod"]');
		dayPeriod!.focus();
		expect(dayPeriod).toHaveFocus();
		const initial = dayPeriod!.textContent?.trim();
		await userEvent.keyboard('{ArrowUp}');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(dayPeriod!.textContent?.trim()).not.toBe(initial);

		const afterUp = dayPeriod!.textContent?.trim();
		await userEvent.keyboard('{ArrowDown}');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(dayPeriod!.textContent?.trim()).not.toBe(afterUp);

		// A/P shortcuts deterministically set AM / PM
		await userEvent.keyboard('a');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(dayPeriod!.textContent?.trim()).toMatch(/AM/i);
		await userEvent.keyboard('p');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(dayPeriod!.textContent?.trim()).toMatch(/PM/i);
	},
};

export const InteractiveDisabledBlocks: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'A 24-hour `TimeField` has no dayPeriod segment, so the toggle has nothing to drive — `setDayPeriod` and `toggle` become no-ops.',
			},
		},
	},
	args: { hourCycle: 24 },
	play: async ({ canvasElement }) => {
		const dayPeriod = canvasElement.querySelector<HTMLElement>('[data-segment="dayPeriod"]');
		expect(dayPeriod).toBeNull();
		// Hour segment is still operable — the field is functional in 24-hour mode.
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-field-segment"]',
		);
		expect(segments.length).toBeGreaterThan(0);
	},
};

export const InteractiveErrorState: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Toggling AM/PM on an empty (null hour) field must NOT shift the hour. This is the bug `DayPeriodToggle` exists to prevent.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-field-segment"]',
		);
		const hour = Array.from(segments).find(
			(s) => !s.hasAttribute('data-segment') || s.getAttribute('data-segment') !== 'dayPeriod',
		)!;
		const beforeHour = hour.textContent;
		const dayPeriod = canvasElement.querySelector<HTMLElement>('[data-segment="dayPeriod"]')!;
		await userEvent.click(dayPeriod);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		// hour was null → should remain null/placeholder, never shift to 12
		expect(hour.textContent).toBe(beforeHour);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Hosted inside a `TimeField` — verifies the AM/PM segment renders without horizontal overflow at every viewport and meets WCAG 2.5.8 target size.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.firstElementChild as HTMLElement;
			expectNoHorizontalOverflow(root);
			const dayPeriod = canvasElement.querySelector<HTMLElement>('[data-segment="dayPeriod"]');
			expect(dayPeriod).toBeInTheDocument();
			expectMinTargetSize(dayPeriod!, 24);
		});
	},
};
