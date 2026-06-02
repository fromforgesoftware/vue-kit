<template>
	<slot />
</template>

<script setup lang="ts">
import { injectTimeFieldRootContext } from 'reka-ui';
import type { DayPeriod } from './day-period-toggle';

defineOptions({ name: 'DayPeriodToggle' });

/**
 * Renderless behaviour helper that injects Reka UI's `TimeFieldRoot` context
 * and exposes `toggle()` / `setDayPeriod()` on the component instance.
 *
 * It exists to bypass Reka's built-in `dayPeriod` keydown handler, which
 * applies a ±12-hour shift to a *null* `hour` segment and ends up flipping
 * the displayed clock by mistake. This helper writes `dayPeriod` directly
 * onto `segmentValues` and only adjusts `hour` when it is already set.
 *
 * **Renderless** — the component renders only its default slot (no DOM
 * wrapper). It must be rendered inside a `TimeFieldRoot` slot scope so the
 * context injection succeeds.
 *
 * Consumers are the [`TimeField`](?path=/docs/dates-timefield--docs)
 * component; the toggle is wired up through `dayPeriodToggleRef.value?.toggle()`.
 */
const ctx = injectTimeFieldRootContext();

function setDayPeriod(target: DayPeriod) {
	const sv = ctx.segmentValues.value;
	if (!('dayPeriod' in sv) || sv.dayPeriod === target) return;

	if (sv.hour != null) {
		sv.hour = target === 'PM' ? sv.hour + 12 : sv.hour - 12;
	}

	sv.dayPeriod = target;
}

function toggle() {
	const sv = ctx.segmentValues.value;
	if (!('dayPeriod' in sv)) return;
	setDayPeriod(sv.dayPeriod === 'AM' ? 'PM' : 'AM');
}

defineExpose({ toggle, setDayPeriod });
</script>
