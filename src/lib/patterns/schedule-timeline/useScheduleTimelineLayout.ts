import { ref, computed, onMounted, onUnmounted, unref, watch, type Ref, type MaybeRef } from 'vue';
import type { ScheduleTimelineDepartment, ScheduleTimelineEmployeeRow } from './schedule-timeline.js';

interface VirtualScrollExpose {
	getScrollElement: () => HTMLElement | null;
	measure?: () => void;
}

interface LayoutOptions {
	departments: MaybeRef<ScheduleTimelineDepartment[] | undefined>;
	rows: MaybeRef<ScheduleTimelineEmployeeRow[] | undefined>;
	employeeColumnWidth: MaybeRef<number>;
	minColumnWidth: MaybeRef<number>;
	columnCount: MaybeRef<number>;
	defaultCollapsed: MaybeRef<boolean>;
	initialColumnWidth: number;
}

// Shared scaffolding for the three timeline views (day/week/month). Owns the
// virtual-scroll ref, column-width calculation tied to ResizeObserver, header
// scroll-sync, and the collapsed-departments set.
export function useScheduleTimelineLayout(opts: LayoutOptions) {
	const virtualScrollRef = ref<VirtualScrollExpose | null>(null);
	const columnWidth = ref(opts.initialColumnWidth);
	const headerScrollLeft = ref(0);
	const collapsedGroups = ref<Set<string>>(new Set());
	let resizeObserver: ResizeObserver | null = null;

	const hasGroups = computed(() => (unref(opts.departments)?.length ?? 0) > 0);
	const flatRows = computed(() => unref(opts.rows) ?? []);

	function recalculateColumnWidth() {
		const container = virtualScrollRef.value?.getScrollElement();
		if (!container) return;
		const available = container.clientWidth - unref(opts.employeeColumnWidth);
		const count = unref(opts.columnCount);
		if (count <= 0) return;
		const calculated = Math.floor(available / count);
		columnWidth.value = Math.max(unref(opts.minColumnWidth), calculated);
	}

	function onScroll(event: Event) {
		headerScrollLeft.value = -(event.target as HTMLElement).scrollLeft;
	}

	function toggleGroup(id: string) {
		const next = new Set(collapsedGroups.value);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		collapsedGroups.value = next;
	}

	onMounted(() => {
		const depts = unref(opts.departments);
		if (unref(opts.defaultCollapsed) && depts) {
			collapsedGroups.value = new Set(depts.map((d) => d.id));
		}
		recalculateColumnWidth();
		const el = virtualScrollRef.value?.getScrollElement();
		if (el && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => recalculateColumnWidth());
			resizeObserver.observe(el);
		}
	});

	// Column count changes (startTime/endTime in day view, dateRange in
	// week/month) need to re-aim the column width too — ResizeObserver only
	// fires on viewport resize.
	watch(
		() => unref(opts.columnCount),
		() => recalculateColumnWidth(),
	);

	onUnmounted(() => {
		resizeObserver?.disconnect();
		resizeObserver = null;
	});

	return {
		virtualScrollRef: virtualScrollRef as Ref<VirtualScrollExpose | null>,
		columnWidth,
		headerScrollLeft,
		collapsedGroups,
		hasGroups,
		flatRows,
		onScroll,
		toggleGroup,
		recalculateColumnWidth,
	};
}
