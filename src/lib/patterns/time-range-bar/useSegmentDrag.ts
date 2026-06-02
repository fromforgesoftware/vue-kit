import { ref, type Ref } from 'vue';
import type { Segment, SegmentUpdateEvent } from './time-range-bar';

interface DragState {
	segmentId: string;
	segmentIndex: number;
	mode: 'move' | 'resize-left' | 'resize-right';
	parentDurationSec: number;
	/** Container size along the time axis — width for horizontal, height for vertical */
	parentSizePx: number;
	originalOffsetSec: number;
	originalDurationSec: number;
	/** Pointer coordinate along the time axis at drag start */
	startCoord: number;
}

export interface UseSegmentDragOptions {
	containerRef: Ref<HTMLElement | null>;
	durationSec: Ref<number>;
	segments: Ref<Segment[]>;
	snapSec: Ref<number>;
	minSegmentSec: Ref<number>;
	/**
	 * Overlap rule between segments during drag/resize.
	 * - `'allow'` (default): every pair can overlap.
	 * - `'block'`: no pair can overlap, unless one of the segments has
	 *   `canOverlap: true` set on the segment itself.
	 * - `function`: custom predicate. Return `true` to allow the overlap.
	 */
	overlap?: Ref<'allow' | 'block' | ((dragged: Segment, other: Segment) => boolean)>;
	/**
	 * Bar orientation. Defaults to `'horizontal'`. When `'vertical'`, drag math
	 * uses `clientY` and the container's height instead of `clientX`/width.
	 */
	orientation?: Ref<'horizontal' | 'vertical'>;

	onUpdate: (event: SegmentUpdateEvent) => void;
	/** Called when a drag ends, even if no change occurred */
	onEnd?: () => void;
}

export interface DragPreview {
	segmentId: string;
	segmentIndex: number;
	offsetSec: number;
	durationSec: number;
}

export function useSegmentDrag(options: UseSegmentDragOptions) {
	const {
		containerRef,
		durationSec,
		segments,
		snapSec,
		minSegmentSec,
		overlap,
		orientation,
		onUpdate,
		onEnd,
	} = options;

	function isVertical(): boolean {
		return orientation?.value === 'vertical';
	}

	function resolveOverlap(dragged: Segment, other: Segment): boolean {
		const mode = overlap?.value ?? 'allow';
		if (typeof mode === 'function') return mode(dragged, other);
		if (mode === 'allow') return true;
		return dragged.canOverlap === true || other.canOverlap === true;
	}

	const dragState = ref<DragState | null>(null);
	const dragPreview = ref<DragPreview | null>(null);
	const isDragging = ref(false);

	function getContainerSize(): number {
		const rect = containerRef.value?.getBoundingClientRect();
		if (!rect) return 1;
		return isVertical() ? rect.height : rect.width;
	}

	function pointerCoord(e: PointerEvent | { clientX: number; clientY: number }): number {
		return isVertical() ? e.clientY : e.clientX;
	}

	/** Get the segments that the dragged segment is NOT allowed to overlap with. */
	function getBlockingSegments(draggedId: string): Segment[] {
		const dragged = segments.value.find((s) => s.id === draggedId);
		if (!dragged) return [];
		return segments.value.filter((s) => s.id !== draggedId && !resolveOverlap(dragged, s));
	}

	function hasAnyBlockingRule(): boolean {
		const mode = overlap?.value ?? 'allow';
		return mode !== 'allow';
	}

	/**
	 * For resize: find boundaries based on original position (left neighbor constrains
	 * left edge, right neighbor constrains right edge).
	 */
	function getResizeBounds(segmentId: string): { minOffset: number; maxEnd: number } {
		let minOffset = 0;
		let maxEnd = durationSec.value;
		const origStart = dragState.value!.originalOffsetSec;
		const origEnd = origStart + dragState.value!.originalDurationSec;

		for (const seg of getBlockingSegments(segmentId)) {
			const segEnd = seg.offsetSec + seg.durationSec;
			if (segEnd <= origStart + 1) minOffset = Math.max(minOffset, segEnd);
			if (seg.offsetSec >= origEnd - 1) maxEnd = Math.min(maxEnd, seg.offsetSec);
		}

		return { minOffset, maxEnd };
	}

	/**
	 * For move: find the closest valid position given a candidate offset,
	 * checking against blocking segments only.
	 */
	function clampMoveOffset(
		segmentId: string,
		candidateOffset: number,
		segDuration: number,
	): number {
		let offset = candidateOffset;

		for (const seg of getBlockingSegments(segmentId)) {
			const segStart = seg.offsetSec;
			const segEnd = segStart + seg.durationSec;
			const candidateEnd = offset + segDuration;

			if (offset < segEnd && candidateEnd > segStart) {
				const snapLeft = segEnd;
				const snapRight = segStart - segDuration;
				const distLeft = Math.abs(candidateOffset - snapLeft);
				const distRight = Math.abs(candidateOffset - snapRight);
				offset = distLeft <= distRight ? snapLeft : snapRight;
			}
		}

		return Math.max(0, Math.min(offset, durationSec.value - segDuration));
	}

	function startMove(e: PointerEvent, segment: Segment, index: number) {
		e.preventDefault();
		e.stopPropagation();

		dragState.value = {
			segmentId: segment.id,
			segmentIndex: index,
			mode: 'move',
			parentDurationSec: durationSec.value,
			parentSizePx: getContainerSize(),
			originalOffsetSec: segment.offsetSec,
			originalDurationSec: segment.durationSec,
			startCoord: pointerCoord(e),
		};

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
	}

	function startResize(e: PointerEvent, segment: Segment, index: number, edge: 'left' | 'right') {
		e.preventDefault();
		e.stopPropagation();

		dragState.value = {
			segmentId: segment.id,
			segmentIndex: index,
			mode: edge === 'left' ? 'resize-left' : 'resize-right',
			parentDurationSec: durationSec.value,
			parentSizePx: getContainerSize(),
			originalOffsetSec: segment.offsetSec,
			originalDurationSec: segment.durationSec,
			startCoord: pointerCoord(e),
		};

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
	}

	function onPointerMove(e: PointerEvent) {
		const state = dragState.value;
		if (!state) return;

		isDragging.value = true;

		const snap = snapSec.value;
		const minSeg = minSegmentSec.value;
		const dCoord = pointerCoord(e) - state.startCoord;
		// round-divide-multiply (not divide-then-round): naive rounding accumulates
		// pixel drift over the snap grid as the user drags.
		const deltaSec =
			Math.round(((dCoord / state.parentSizePx) * state.parentDurationSec) / snap) * snap;

		let newOffset = state.originalOffsetSec;
		let newDuration = state.originalDurationSec;

		const hasOverlapRules = hasAnyBlockingRule();

		if (state.mode === 'move') {
			newOffset = state.originalOffsetSec + deltaSec;
			newOffset = Math.max(0, Math.min(newOffset, state.parentDurationSec - newDuration));
			if (hasOverlapRules) {
				newOffset = clampMoveOffset(state.segmentId, newOffset, newDuration);
			}
		} else if (state.mode === 'resize-left') {
			const bounds = hasOverlapRules
				? getResizeBounds(state.segmentId)
				: { minOffset: 0, maxEnd: state.parentDurationSec };
			const clampedDelta = Math.min(deltaSec, state.originalDurationSec - minSeg);
			newOffset = Math.max(bounds.minOffset, Math.max(0, state.originalOffsetSec + clampedDelta));
			newDuration = state.originalDurationSec - (newOffset - state.originalOffsetSec);
		} else {
			const bounds = hasOverlapRules
				? getResizeBounds(state.segmentId)
				: { minOffset: 0, maxEnd: state.parentDurationSec };
			newDuration = Math.max(minSeg, state.originalDurationSec + deltaSec);
			newDuration = Math.min(newDuration, bounds.maxEnd - state.originalOffsetSec);
			newDuration = Math.min(newDuration, state.parentDurationSec - state.originalOffsetSec);
		}

		dragPreview.value = {
			segmentId: state.segmentId,
			segmentIndex: state.segmentIndex,
			offsetSec: newOffset,
			durationSec: newDuration,
		};
	}

	function onPointerUp() {
		document.removeEventListener('pointermove', onPointerMove);
		document.removeEventListener('pointerup', onPointerUp);

		const state = dragState.value;
		const preview = dragPreview.value;

		dragState.value = null;
		dragPreview.value = null;
		isDragging.value = false;

		if (!state || !preview) {
			onEnd?.();
			return;
		}
		if (
			preview.offsetSec === state.originalOffsetSec &&
			preview.durationSec === state.originalDurationSec
		) {
			onEnd?.();
			return; // no change
		}

		onUpdate({
			segmentId: state.segmentId,
			offsetSec: preview.offsetSec,
			durationSec: preview.durationSec,
		});
	}

	/**
	 * Returns the effective offset/duration for a segment,
	 * accounting for any in-progress drag preview.
	 */
	function getEffectivePosition(segment: Segment, index: number) {
		const preview = dragPreview.value;
		if (preview && preview.segmentId === segment.id && preview.segmentIndex === index) {
			return { offsetSec: preview.offsetSec, durationSec: preview.durationSec };
		}
		return { offsetSec: segment.offsetSec, durationSec: segment.durationSec };
	}

	return {
		startMove,
		startResize,
		dragPreview,
		isDragging,
		getEffectivePosition,
	};
}
