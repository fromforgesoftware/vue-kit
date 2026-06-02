import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TimeRangeBar from './TimeRangeBar.vue';
import type { Segment } from './time-range-bar.js';

function createSegments(): Segment[] {
	return [
		{ id: 'break-1', label: 'Break', offsetSec: 3600, durationSec: 900, variant: 'amber' },
		{ id: 'lunch-1', label: 'Lunch', offsetSec: 14400, durationSec: 1800, variant: 'green' },
	];
}

describe('TimeRangeBar', () => {
	// ── Rendering ──────────────────────────────────────────────────────────

	describe('rendering', () => {
		it('renders without crashing', () => {
			const wrapper = mount(TimeRangeBar, {
				props: { durationSec: 28800 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('renders segments in editable mode', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const segmentEls = wrapper.findAll('[data-segment]');
			expect(segmentEls).toHaveLength(2);
		});

		it('renders segments in readonly mode', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					readonly: true,
				},
			});
			// Readonly segments don't have data-segment attribute
			const segmentEls = wrapper.findAll('[data-segment]');
			expect(segmentEls).toHaveLength(0);
			// But they should still render as positioned divs
			expect(wrapper.exists()).toBe(true);
		});

		it('renders time labels when showLabels is true', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					startTimeSec: 32400,
					showLabels: true,
					editable: true,
				},
			});
			expect(wrapper.text()).toContain('09:00');
			expect(wrapper.text()).toContain('17:00');
		});

		it('renders labels when readonly', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					startTimeSec: 32400,
					showLabels: true,
					readonly: true,
				},
			});
			expect(wrapper.text()).toContain('09:00');
			expect(wrapper.text()).toContain('17:00');
		});

		it('renders ruler when showRuler is true', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					startTimeSec: 32400,
					showRuler: true,
				},
			});
			// Ruler should contain hour marks
			expect(wrapper.text()).toMatch(/\d{2}:\d{2}/);
		});

		it('does not render ruler when showRuler is false (the default)', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					startTimeSec: 32400,
				},
			});
			// No `showRuler` prop → ruler is off by default. Tick markers shouldn't
			// render anywhere in the tree.
			const ticks = wrapper.findAll('[data-slot="time-range-bar-ruler-tick"]');
			expect(ticks).toHaveLength(0);
		});
	});

	// ── Segment positioning ────────────────────────────────────────────────

	describe('segment positioning', () => {
		it('positions segments based on offset and duration ratios', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800, // 8h
					segments: [
						{ id: 's1', offsetSec: 0, durationSec: 7200, variant: 'amber' as const }, // first 25%
					],
				},
			});
			const segment = wrapper.find('[data-segment]');
			expect(segment.exists()).toBe(true);
			const style = segment.attributes('style') ?? '';
			expect(style).toContain('left: 0%');
			expect(style).toContain('width: 25%');
		});

		it('positions segment at 50% for middle offset', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: [
						{ id: 's1', offsetSec: 14400, durationSec: 3600, variant: 'green' as const }, // 50% offset, 12.5% width
					],
				},
			});
			const segment = wrapper.find('[data-segment]');
			const style = segment.attributes('style') ?? '';
			expect(style).toContain('left: 50%');
			expect(style).toContain('width: 12.5%');
		});
	});

	// ── Props ──────────────────────────────────────────────────────────────

	describe('props', () => {
		it('accepts all variant types for variant', () => {
			const variants = ['green', 'purple', 'blue', 'amber', 'red', 'gray'] as const;
			for (const v of variants) {
				const wrapper = mount(TimeRangeBar, {
					props: { durationSec: 14400, variant: v },
				});
				expect(wrapper.exists()).toBe(true);
			}
		});

		it('defaults to editable mode', () => {
			const wrapper = mount(TimeRangeBar, {
				props: { durationSec: 28800, segments: createSegments() },
			});
			// Editable segments have data-segment
			expect(wrapper.findAll('[data-segment]').length).toBe(2);
		});

		it('renders empty bar with no segments', () => {
			const wrapper = mount(TimeRangeBar, {
				props: { durationSec: 28800, segments: [] },
			});
			expect(wrapper.findAll('[data-segment]').length).toBe(0);
		});
	});

	// ── Active segment ─────────────────────────────────────────────────────

	describe('active segment', () => {
		it('applies ring class to active segment', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					activeSegmentId: 'break-1',
				},
			});
			const segments = wrapper.findAll('[data-segment]');
			const activeSegment = segments.find((s) => s.attributes('data-segment-id') === 'break-1');
			expect(activeSegment?.classes()).toContain('outline-2');
		});

		it('does not apply ring class to inactive segments', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					activeSegmentId: 'break-1',
				},
			});
			const segments = wrapper.findAll('[data-segment]');
			const inactiveSegment = segments.find((s) => s.attributes('data-segment-id') === 'lunch-1');
			expect(inactiveSegment?.classes()).not.toContain('outline-2');
		});

		it('clicking a segment selects it visually when activeSegmentId prop is omitted', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('click');
			expect(seg.classes()).toContain('outline-2');
		});

		it('clicking the bar surface deselects the segment when activeSegmentId prop is omitted', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('click');
			expect(seg.classes()).toContain('outline-2');
			const bar = wrapper.find('[class*="rounded-md"]');
			const el = bar.element as HTMLElement;
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 600,
				top: 0,
				bottom: 40,
				width: 600,
				height: 40,
				x: 0,
				y: 0,
				toJSON: () => {},
			});
			await bar.trigger('click', { clientX: 500 });
			expect(wrapper.find('[data-segment-id="break-1"]').classes()).not.toContain('outline-2');
		});

		it('activeSegmentId prop overrides internal state', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
					activeSegmentId: null,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('click');
			expect(seg.classes()).not.toContain('outline-2');
		});
	});

	// ── Bar selection ─────────────────────────────────────────────────────

	describe('bar selection', () => {
		it('clicking the bar surface selects it visually when selected prop is omitted', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const bar = wrapper.find('[data-slot="time-range-bar-container"]');
			const el = bar.element as HTMLElement;
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 600,
				top: 0,
				bottom: 40,
				width: 600,
				height: 40,
				x: 0,
				y: 0,
				toJSON: () => {},
			});
			await bar.trigger('click', { clientX: 500 });
			expect(wrapper.find('[data-slot="time-range-bar-container"]').classes()).toContain(
				'outline-2',
			);
			expect(wrapper.emitted('bar-select')).toBeDefined();
			expect(wrapper.emitted('bar-select')?.[0]).toEqual([true]);
		});

		it('clicking a segment deselects the bar when selected prop is omitted', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const bar = wrapper.find('[data-slot="time-range-bar-container"]');
			const el = bar.element as HTMLElement;
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 600,
				top: 0,
				bottom: 40,
				width: 600,
				height: 40,
				x: 0,
				y: 0,
				toJSON: () => {},
			});
			await bar.trigger('click', { clientX: 500 });
			expect(wrapper.find('[data-slot="time-range-bar-container"]').classes()).toContain(
				'outline-2',
			);

			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('click');
			expect(wrapper.find('[data-slot="time-range-bar-container"]').classes()).not.toContain(
				'outline-2',
			);
			const events = wrapper.emitted('bar-select') ?? [];
			expect(events[events.length - 1]).toEqual([false]);
		});

		it('selected prop overrides internal state', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
					selected: false,
				},
			});
			const bar = wrapper.find('[data-slot="time-range-bar-container"]');
			const el = bar.element as HTMLElement;
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 600,
				top: 0,
				bottom: 40,
				width: 600,
				height: 40,
				x: 0,
				y: 0,
				toJSON: () => {},
			});
			await bar.trigger('click', { clientX: 500 });
			expect(wrapper.find('[data-slot="time-range-bar-container"]').classes()).not.toContain(
				'outline-2',
			);
		});

		it('clicking outside the bar deselects', async () => {
			const wrapper = mount(TimeRangeBar, {
				attachTo: document.body,
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('click');
			expect(seg.classes()).toContain('outline-2');

			const outside = document.createElement('div');
			document.body.appendChild(outside);
			outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			await wrapper.vm.$nextTick();

			expect(wrapper.find('[data-segment-id="break-1"]').classes()).not.toContain('outline-2');
			document.body.removeChild(outside);
			wrapper.unmount();
		});
	});

	// ── Events ─────────────────────────────────────────────────────────────

	describe('events', () => {
		it('emits segment-click on segment click', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const segment = wrapper.find('[data-segment-id="break-1"]');
			await segment.trigger('click');
			expect(wrapper.emitted('segment-click')).toBeDefined();
			expect(wrapper.emitted('segment-select')).toBeDefined();
		});

		it('emits click on empty bar click', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: [],
					editable: true,
				},
			});

			const bar = wrapper.find('[class*="rounded-md"]');
			// Mock getBoundingClientRect
			const el = bar.element as HTMLElement;
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 600,
				top: 0,
				bottom: 40,
				width: 600,
				height: 40,
				x: 0,
				y: 0,
				toJSON: () => {},
			});

			await bar.trigger('click', { clientX: 300 });
			expect(wrapper.emitted('click')).toBeDefined();
		});

		it('does not emit events in readonly mode', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					readonly: true,
				},
			});
			const bar = wrapper.find('[class*="rounded-md"]');
			await bar.trigger('click');
			expect(wrapper.emitted('click')).toBeUndefined();
			expect(wrapper.emitted('segment-click')).toBeUndefined();
		});
	});

	// ── Chrome-less mode ──────────────────────────────────────────────────
	// Reproduces the former `TimeRangeBarBase` surface: pass
	// `:show-labels="false" :show-ruler="false" :resizable="false"` and omit
	// the optional slots. This is how the timeline grid uses it.

	describe('chrome-less mode', () => {
		it('renders without ruler or edge time labels when chrome props are off', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					startTimeSec: 32400,
					segments: createSegments(),
					showLabels: false,
					showRuler: false,
				},
			});
			// No ruler ticks at all.
			expect(wrapper.findAll('[data-slot="time-range-bar-ruler-tick"]')).toHaveLength(0);
			// No "09:00" / "17:00" labels at the bar edges.
			expect(wrapper.text()).not.toMatch(/\d{2}:\d{2}/);
		});

		it('does not render bar-resize highlights when resizable is false', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
					resizable: false,
					showLabels: false,
					showRuler: false,
				},
			});
			expect(wrapper.findAll('[data-slot="time-range-bar-resize-left"]')).toHaveLength(0);
			expect(wrapper.findAll('[data-slot="time-range-bar-resize-right"]')).toHaveLength(0);
		});

		it('renders bar-resize highlights when resizable is true', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
					resizable: true,
					showLabels: false,
					showRuler: false,
				},
			});
			expect(wrapper.findAll('[data-slot="time-range-bar-resize-left"]').length).toBeGreaterThan(0);
			expect(wrapper.findAll('[data-slot="time-range-bar-resize-right"]').length).toBeGreaterThan(
				0,
			);
		});

		it('readonly chrome-less mode drops data-segment markers but keeps data-segment-id', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					readonly: true,
					showLabels: false,
					showRuler: false,
				},
			});
			expect(wrapper.findAll('[data-segment]')).toHaveLength(0);
			expect(wrapper.findAll('[data-segment-id]')).toHaveLength(2);
		});

		it('keyboard "+" grows segment duration', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('keydown', { key: '+' });
			const events = wrapper.emitted('segment-update') as Array<
				[{ segmentId: string; offsetSec: number; durationSec: number }]
			>;
			expect(events).toBeDefined();
			const last = events[events.length - 1][0];
			expect(last.durationSec).toBeGreaterThan(900);
		});

		it('keyboard Escape emits segment-select(null)', async () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			await seg.trigger('keydown', { key: 'Escape' });
			const selects = wrapper.emitted('segment-select') as Array<[string | null]>;
			expect(selects[selects.length - 1][0]).toBeNull();
		});

		it('exposes role="slider" with aria-value* on each editable segment', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: createSegments(),
					editable: true,
					showLabels: false,
				},
			});
			const seg = wrapper.find('[data-segment-id="break-1"]');
			expect(seg.attributes('role')).toBe('slider');
			expect(seg.attributes('aria-valuemin')).toBe('0');
			expect(seg.attributes('aria-valuemax')).toBe('28800');
			expect(seg.attributes('aria-valuenow')).toBe('3600');
			expect(seg.attributes('tabindex')).toBe('0');
		});
	});

	// ── Edge cases ─────────────────────────────────────────────────────────

	describe('edge cases', () => {
		it('handles very short duration', () => {
			const wrapper = mount(TimeRangeBar, {
				props: { durationSec: 300 }, // 5 min
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('handles very long duration (24h)', () => {
			const wrapper = mount(TimeRangeBar, {
				props: { durationSec: 86400 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('handles segment at the end boundary', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: [{ id: 's1', offsetSec: 27900, durationSec: 900, variant: 'amber' as const }],
				},
			});
			const segment = wrapper.find('[data-segment]');
			expect(segment.exists()).toBe(true);
		});

		it('handles multiple segments at same position', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: [
						{ id: 's1', offsetSec: 3600, durationSec: 900, variant: 'amber' as const },
						{ id: 's2', offsetSec: 3600, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			expect(wrapper.findAll('[data-segment]')).toHaveLength(2);
		});
	});

	// ── Overlap rules ──────────────────────────────────────────────────────
	// The drag-time enforcement of overlap rules is exercised at the
	// composable level (see useSegmentDrag.test.ts → "respects overlap rules
	// during move") and end-to-end via the play tests in the .stories.ts
	// file. The component-level tests below just verify that the surface
	// accepts the props and renders in each mode.

	describe('overlap rules', () => {
		it('default "allow" mode lets two segments share a position', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					segments: [
						{ id: 's1', offsetSec: 3600, durationSec: 900, variant: 'amber' as const },
						{ id: 's2', offsetSec: 3600, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			// Both segments render
			expect(wrapper.findAll('[data-segment]')).toHaveLength(2);
		});

		it('default "allow" mode renders single lane when stackOverlaps is off', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					stackOverlaps: false,
					segments: [
						{ id: 's1', offsetSec: 3600, durationSec: 900, variant: 'amber' as const },
						{ id: 's2', offsetSec: 3600, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			const segs = wrapper.findAll('[data-segment]');
			// No lane top offsets when stackOverlaps is off — segments render on
			// top of each other.
			for (const s of segs) {
				const style = s.attributes('style') ?? '';
				expect(style).not.toMatch(/top:\s*\d+(?:\.\d+)?%/);
			}
		});

		it('stackOverlaps splits overlapping segments into separate lanes', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					stackOverlaps: true,
					segments: [
						{ id: 's1', offsetSec: 3600, durationSec: 900, variant: 'amber' as const },
						{ id: 's2', offsetSec: 3600, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			const segs = wrapper.findAll('[data-segment]');
			expect(segs).toHaveLength(2);
			const tops = segs.map((s) => {
				const m = (s.attributes('style') ?? '').match(/top:\s*([\d.]+)%/);
				return m ? Number(m[1]) : null;
			});
			// Two distinct top offsets ⇒ two lanes.
			expect(new Set(tops).size).toBe(2);
		});

		it('overlap="block" with non-overlapping segments renders both', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					overlap: 'block' as const,
					segments: [
						{ id: 's1', offsetSec: 0, durationSec: 900, variant: 'amber' as const },
						{ id: 's2', offsetSec: 14400, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			expect(wrapper.findAll('[data-segment]')).toHaveLength(2);
		});

		it('accepts canOverlap on a segment without TS errors and renders', () => {
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					overlap: 'block' as const,
					segments: [
						{
							id: 's1',
							offsetSec: 3600,
							durationSec: 900,
							variant: 'amber' as const,
							canOverlap: true,
						},
						{ id: 's2', offsetSec: 7200, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			expect(wrapper.findAll('[data-segment]')).toHaveLength(2);
		});

		it('accepts a function predicate for overlap and renders', () => {
			const allowAll = () => true;
			const wrapper = mount(TimeRangeBar, {
				props: {
					durationSec: 28800,
					overlap: allowAll,
					segments: [
						{ id: 's1', offsetSec: 3600, durationSec: 900, variant: 'amber' as const },
						{ id: 's2', offsetSec: 3600, durationSec: 900, variant: 'green' as const },
					],
				},
			});
			expect(wrapper.findAll('[data-segment]')).toHaveLength(2);
		});
	});
});
