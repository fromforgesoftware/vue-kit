import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';

// Re-arms to the next minute boundary so "isToday" / "now" reactivity
// crosses midnight without drift. Lower-bounds the next delay so a
// background tab waking up doesn't immediately schedule a 0ms tick loop,
// and re-syncs on visibilitychange so an unparked tab refreshes
// immediately instead of waiting up to a minute.
export function useNowTick(): { now: Ref<ForgeDate> } {
	const now = ref<ForgeDate>(ForgeDate.now());
	let timeout: ReturnType<typeof setTimeout> | null = null;

	function clear() {
		if (timeout) clearTimeout(timeout);
		timeout = null;
	}

	function arm() {
		clear();
		const current = ForgeDate.now();
		const raw = 60_000 - (current.second * 1000 + current.millisecond);
		const delay = Math.max(250, raw);
		timeout = setTimeout(() => {
			now.value = ForgeDate.now();
			arm();
		}, delay);
	}

	function onVisibilityChange() {
		if (typeof document === 'undefined' || document.hidden) return;
		now.value = ForgeDate.now();
		arm();
	}

	onMounted(() => {
		arm();
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', onVisibilityChange);
		}
	});
	onUnmounted(() => {
		clear();
		if (typeof document !== 'undefined') {
			document.removeEventListener('visibilitychange', onVisibilityChange);
		}
	});

	return { now };
}

// Re-arms at the next local midnight (plus a safety margin) so day-level
// highlights ("is this column today?") flip without paying the cost of a
// minute-resolution ticker.
export function useDayTick(): { today: Ref<ForgeDate> } {
	const today = ref<ForgeDate>(ForgeDate.now());
	let timeout: ReturnType<typeof setTimeout> | null = null;

	function clear() {
		if (timeout) clearTimeout(timeout);
		timeout = null;
	}

	function msToNextMidnight(): number {
		const current = ForgeDate.now();
		const ms =
			current.hour * 3_600_000 +
			current.minute * 60_000 +
			current.second * 1_000 +
			current.millisecond;
		return Math.max(1_000, 86_400_000 - ms + 50);
	}

	function arm() {
		clear();
		timeout = setTimeout(() => {
			today.value = ForgeDate.now();
			arm();
		}, msToNextMidnight());
	}

	function onVisibilityChange() {
		if (typeof document === 'undefined' || document.hidden) return;
		today.value = ForgeDate.now();
		arm();
	}

	onMounted(() => {
		arm();
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', onVisibilityChange);
		}
	});
	onUnmounted(() => {
		clear();
		if (typeof document !== 'undefined') {
			document.removeEventListener('visibilitychange', onVisibilityChange);
		}
	});

	return { today };
}
