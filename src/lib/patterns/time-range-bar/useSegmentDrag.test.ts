import { describe, it, expect, vi, afterEach } from 'vitest';
import { ref } from 'vue';
import { useSegmentDrag, type UseSegmentDragOptions } from './useSegmentDrag';
import type { Segment, SegmentUpdateEvent } from './time-range-bar';

function createSegment(overrides: Partial<Segment> = {}): Segment {
	return {
		id: 'seg-1',
		offsetSec: 3600,
		durationSec: 900,
		variant: 'amber',
		...overrides,
	};
}

function createOptions(overrides: Partial<UseSegmentDragOptions> = {}): UseSegmentDragOptions {
	return {
		containerRef: ref(null) as any,
		durationSec: ref(28800),
		segments: ref<Segment[]>([]),
		snapSec: ref(300),
		minSegmentSec: ref(300),
		onUpdate: vi.fn(),
		onEnd: vi.fn(),
		...overrides,
	};
}

describe('useSegmentDrag', () => {
	// ── Initial state ──────────────────────────────────────────────────────

	describe('initial state', () => {
		it('returns isDragging as false', () => {
			const { isDragging } = useSegmentDrag(createOptions());
			expect(isDragging.value).toBe(false);
		});

		it('returns dragPreview as null', () => {
			const { dragPreview } = useSegmentDrag(createOptions());
			expect(dragPreview.value).toBeNull();
		});
	});

	// ── getEffectivePosition ───────────────────────────────────────────────

	describe('getEffectivePosition', () => {
		it('returns original position when not dragging', () => {
			const { getEffectivePosition } = useSegmentDrag(createOptions());
			const segment = createSegment({ offsetSec: 3600, durationSec: 900 });
			const pos = getEffectivePosition(segment, 0);
			expect(pos).toEqual({ offsetSec: 3600, durationSec: 900 });
		});
	});

	// ── startMove ──────────────────────────────────────────────────────────

	describe('startMove', () => {
		let cleanup: (() => void) | undefined;

		afterEach(() => {
			cleanup?.();
			cleanup = undefined;
		});

		it('registers document event listeners on pointerdown', () => {
			const addSpy = vi.spyOn(document, 'addEventListener');
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const options = createOptions({ containerRef: ref(containerEl) as any });
			const { startMove } = useSegmentDrag(options);

			const event = new PointerEvent('pointerdown', { clientX: 100 });
			startMove(event, createSegment(), 0);

			expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
			expect(addSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

			// Clean up by dispatching pointerup
			document.dispatchEvent(new PointerEvent('pointerup'));
			addSpy.mockRestore();
		});

		it('calls onUpdate with new position after move+release', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800), // 8h
				snapSec: ref(300), // 5min
				onUpdate,
			});
			const { startMove } = useSegmentDrag(options);

			const segment = createSegment({ id: 'seg-1', offsetSec: 3600, durationSec: 900 });

			// Start drag at x=100
			startMove(new PointerEvent('pointerdown', { clientX: 100 }), segment, 0);

			// Move right by 60px → deltaSec = (60/600) * 28800 = 2880s, snapped to 3000s (50min)
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 160 }));

			// Release
			document.dispatchEvent(new PointerEvent('pointerup'));

			expect(onUpdate).toHaveBeenCalledWith({
				segmentId: 'seg-1',
				offsetSec: 6600, // 3600 + 3000
				durationSec: 900,
			});
		});

		it('does not call onUpdate when position unchanged', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const onEnd = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				onUpdate,
				onEnd,
			});
			const { startMove } = useSegmentDrag(options);

			startMove(new PointerEvent('pointerdown', { clientX: 100 }), createSegment(), 0);

			// Release without moving
			document.dispatchEvent(new PointerEvent('pointerup'));

			expect(onUpdate).not.toHaveBeenCalled();
			expect(onEnd).toHaveBeenCalled();
		});

		it('clamps offset to not go below 0', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800),
				snapSec: ref(300),
				onUpdate,
			});
			const { startMove } = useSegmentDrag(options);

			// Segment near start
			const segment = createSegment({ offsetSec: 300, durationSec: 900 });

			startMove(new PointerEvent('pointerdown', { clientX: 100 }), segment, 0);
			// Move far left
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 0 }));
			document.dispatchEvent(new PointerEvent('pointerup'));

			if (onUpdate.mock.calls.length > 0) {
				const event = onUpdate.mock.calls[0][0] as SegmentUpdateEvent;
				expect(event.offsetSec).toBeGreaterThanOrEqual(0);
			}
		});

		it('clamps offset to not exceed parent duration minus segment duration', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800),
				snapSec: ref(300),
				onUpdate,
			});
			const { startMove } = useSegmentDrag(options);

			// Segment near end
			const segment = createSegment({ offsetSec: 27000, durationSec: 900 });

			startMove(new PointerEvent('pointerdown', { clientX: 500 }), segment, 0);
			// Move far right
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 700 }));
			document.dispatchEvent(new PointerEvent('pointerup'));

			if (onUpdate.mock.calls.length > 0) {
				const event = onUpdate.mock.calls[0][0] as SegmentUpdateEvent;
				expect(event.offsetSec + event.durationSec).toBeLessThanOrEqual(28800);
			}
		});

		it('respects overlap="block" during move — snaps to neighbour edge instead of overlapping', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			// seg-1 at offset 3600 (15 min wide); seg-2 at offset 7200 (30 min
			// wide). Dragging seg-1 right by ~100px would land it inside seg-2's
			// range (7200..9000). With overlap="block", clampMoveOffset should
			// snap to one of seg-2's edges (left: 6300, or right: 9000).
			const seg1: Segment = { id: 'seg-1', offsetSec: 3600, durationSec: 900, variant: 'amber' };
			const seg2: Segment = { id: 'seg-2', offsetSec: 7200, durationSec: 1800, variant: 'green' };
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800),
				snapSec: ref(300),
				segments: ref<Segment[]>([seg1, seg2]),
				overlap: ref<'allow' | 'block'>('block'),
				onUpdate,
			});
			const { startMove } = useSegmentDrag(options);

			startMove(new PointerEvent('pointerdown', { clientX: 100 }), seg1, 0);
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 200 }));
			document.dispatchEvent(new PointerEvent('pointerup'));

			expect(onUpdate).toHaveBeenCalled();
			const event = onUpdate.mock.calls[0][0] as SegmentUpdateEvent;
			expect(event.segmentId).toBe('seg-1');
			expect([6300, 9000]).toContain(event.offsetSec);
			const end = event.offsetSec + event.durationSec;
			expect(event.offsetSec >= 9000 || end <= 7200).toBe(true);
		});
	});

	// ── startResize ────────────────────────────────────────────────────────

	describe('startResize', () => {
		it('resizes from right edge — increases duration', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800),
				snapSec: ref(300),
				onUpdate,
			});
			const { startResize } = useSegmentDrag(options);

			const segment = createSegment({ id: 'seg-1', offsetSec: 3600, durationSec: 900 });

			startResize(new PointerEvent('pointerdown', { clientX: 200 }), segment, 0, 'right');
			// Drag right by 30px → deltaSec = (30/600) * 28800 = 1440, snapped to 1500
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 230 }));
			document.dispatchEvent(new PointerEvent('pointerup'));

			expect(onUpdate).toHaveBeenCalledWith({
				segmentId: 'seg-1',
				offsetSec: 3600,
				durationSec: 2400, // 900 + 1500
			});
		});

		it('resizes from left edge — adjusts offset and duration', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800),
				snapSec: ref(300),
				onUpdate,
			});
			const { startResize } = useSegmentDrag(options);

			const segment = createSegment({ id: 'seg-1', offsetSec: 3600, durationSec: 1800 });

			startResize(new PointerEvent('pointerdown', { clientX: 200 }), segment, 0, 'left');
			// Drag right by 30px → deltaSec = 1500, offset increases, duration decreases
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 230 }));
			document.dispatchEvent(new PointerEvent('pointerup'));

			expect(onUpdate).toHaveBeenCalledWith({
				segmentId: 'seg-1',
				offsetSec: 5100, // 3600 + 1500
				durationSec: 300, // 1800 - 1500
			});
		});

		it('enforces minimum segment duration on right resize', () => {
			const containerEl = { getBoundingClientRect: () => ({ width: 600 }) };
			const onUpdate = vi.fn();
			const options = createOptions({
				containerRef: ref(containerEl) as any,
				durationSec: ref(28800),
				snapSec: ref(300),
				minSegmentSec: ref(300),
				onUpdate,
			});
			const { startResize } = useSegmentDrag(options);

			const segment = createSegment({ id: 'seg-1', offsetSec: 3600, durationSec: 900 });

			startResize(new PointerEvent('pointerdown', { clientX: 200 }), segment, 0, 'right');
			// Drag far left to try to make it very small
			document.dispatchEvent(new PointerEvent('pointermove', { clientX: 100 }));
			document.dispatchEvent(new PointerEvent('pointerup'));

			if (onUpdate.mock.calls.length > 0) {
				const event = onUpdate.mock.calls[0][0] as SegmentUpdateEvent;
				expect(event.durationSec).toBeGreaterThanOrEqual(300);
			}
		});
	});
});
