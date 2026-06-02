import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import DayPeriodRangeToggle from './DayPeriodRangeToggle.vue';
import TimeRangeField from '../time-range-field/TimeRangeField.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

// ── Module-level fixtures ─────────────────────────────────────────────────
//
// `DayPeriodRangeToggle` is a **renderless** behaviour helper. It has zero
// direct props/emits — its public surface is exposed via `defineExpose` and
// its only observable behaviour comes through the host `TimeRangeField`'s
// 12-hour clock segments.
//
// Args mirror what would be set on the host `TimeRangeField` so consumers can
// see the only context in which this helper is meaningful (12-hour clocks).

const HOUR_CYCLES = [12, 24] as const;

type RangeValue = { start: ForgeDate; end: ForgeDate } | null;

interface DayPeriodRangeToggleStoryArgs {
	hourCycle?: 12 | 24;
	initialValue?: RangeValue;
}

const meta = {
	title: 'Dates/DayPeriodRangeToggle',
	component: DayPeriodRangeToggle,
	tags: ['!autodocs'],
	argTypes: {
		hourCycle: {
			control: 'select',
			options: HOUR_CYCLES,
			description:
				'Host `TimeRangeField` hour cycle. Only `12` exposes `dayPeriod` segments for the toggle to drive.',
		},
		initialValue: {
			control: false,
			description:
				'Optional pre-set range bound to the host `TimeRangeField`. `null` shows placeholders.',
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
					"Renderless helper that drives the AM/PM segments on both sides of a `TimeRangeField` without going through Reka's built-in ±12-hour keydown shift. Used internally by `TimeRangeField` — exposed here so the behaviour and keyboard model are documented.",
			},
		},
	},
	render: (args: DayPeriodRangeToggleStoryArgs) => ({
		components: { TimeRangeField },
		setup() {
			const value = ref<RangeValue>(args.initialValue ?? null);
			return { args, value };
		},
		template: `<TimeRangeField v-model="value" :hour-cycle="args.hourCycle" />`,
	}),
} satisfies Meta<DayPeriodRangeToggleStoryArgs>;

export default meta;
type Story = StoryObj<DayPeriodRangeToggleStoryArgs>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Hosted inside a 12-hour `TimeRangeField`. Each side has its own AM/PM segment — clicking, ArrowUp/ArrowDown, and `A` / `P` shortcuts each call into `DayPeriodRangeToggle` with the matching `start` or `end` argument.',
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
				story: 'Both start and end dayPeriod segments toggle independently when clicked.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const startDp = canvasElement.querySelector<HTMLElement>(
			'[data-range-side="start"][data-segment="dayPeriod"]',
		)!;
		const endDp = canvasElement.querySelector<HTMLElement>(
			'[data-range-side="end"][data-segment="dayPeriod"]',
		)!;
		expect(startDp).toBeInTheDocument();
		expect(endDp).toBeInTheDocument();

		const startInitial = startDp.textContent?.trim();
		await userEvent.click(startDp);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(startDp.textContent?.trim()).not.toBe(startInitial);

		const endInitial = endDp.textContent?.trim();
		await userEvent.click(endDp);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(endDp.textContent?.trim()).not.toBe(endInitial);

		// Sides remain independent — toggling start does not change end after re-querying.
		const endAfterEndClick = endDp.textContent?.trim();
		await userEvent.click(startDp);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(endDp.textContent?.trim()).toBe(endAfterEndClick);
	},
};

export const InteractiveKeyboardNav: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: '`A` / `P` keys deterministically set AM / PM on whichever side has focus.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const startDp = canvasElement.querySelector<HTMLElement>(
			'[data-range-side="start"][data-segment="dayPeriod"]',
		)!;
		startDp.focus();
		await userEvent.keyboard('a');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(startDp.textContent?.trim()).toMatch(/AM/i);

		await userEvent.keyboard('p');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(startDp.textContent?.trim()).toMatch(/PM/i);
	},
};

export const InteractiveDisabledBlocks: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'A 24-hour `TimeRangeField` has no dayPeriod segments, so the toggle has nothing to drive — `setDayPeriod` and `toggle` become no-ops on both sides.',
			},
		},
	},
	args: { hourCycle: 24 },
	play: async ({ canvasElement }) => {
		const dayPeriods = canvasElement.querySelectorAll<HTMLElement>('[data-segment="dayPeriod"]');
		expect(dayPeriods.length).toBe(0);
		// Both sides are still functional in 24-hour mode.
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-range-field-segment"]',
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
					'Toggling AM/PM with a null hour must not silently shift the displayed hour. This is the bug `DayPeriodRangeToggle` exists to prevent.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const startSegments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-range-field-segment"][data-range-side="start"]',
		);
		const startHour = Array.from(startSegments).find(
			(s) => s.getAttribute('data-segment') !== 'dayPeriod',
		)!;
		const beforeHour = startHour.textContent;
		const startDp = canvasElement.querySelector<HTMLElement>(
			'[data-range-side="start"][data-segment="dayPeriod"]',
		)!;
		await userEvent.click(startDp);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(startHour.textContent).toBe(beforeHour);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Hosted inside a `TimeRangeField` — verifies both AM/PM segments render without horizontal overflow at every viewport and meet WCAG 2.5.8 target size.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.firstElementChild as HTMLElement;
			expectNoHorizontalOverflow(root);
			const dayPeriods = canvasElement.querySelectorAll<HTMLElement>('[data-segment="dayPeriod"]');
			expect(dayPeriods.length).toBe(2);
			for (const dp of dayPeriods) {
				expectMinTargetSize(dp, 24);
			}
		});
	},
};
