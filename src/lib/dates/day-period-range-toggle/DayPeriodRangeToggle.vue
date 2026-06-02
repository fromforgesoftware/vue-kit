<template>
	<slot />
</template>

<script setup lang="ts">
import { injectTimeRangeFieldRootContext } from 'reka-ui';
import type { DayPeriod, RangeSide } from './day-period-range-toggle';

defineOptions({ name: 'DayPeriodRangeToggle' });

/**
 * Renderless behaviour helper that injects Reka UI's
 * `TimeRangeFieldRoot` context and exposes `toggle(side)` /
 * `setDayPeriod(side, target)` on the component instance.
 *
 * It exists to bypass Reka's built-in `dayPeriod` keydown handler, which
 * applies a ±12-hour shift to a *null* `hour` segment and ends up flipping
 * the displayed clock by mistake. This helper writes `dayPeriod` directly
 * onto `segmentValues[side]` and only adjusts `hour` when it is already set.
 *
 * **Renderless** — the component renders only its default slot (no DOM
 * wrapper). It must be rendered inside a `TimeRangeFieldRoot` slot scope
 * so the context injection succeeds.
 *
 * Consumers are the [`TimeRangeField`](?path=/docs/dates-timerangefield--docs)
 * component; toggles are wired up through
 * `dayPeriodToggleRef.value?.toggle('start' | 'end')`.
 */
const ctx = injectTimeRangeFieldRootContext();

function setDayPeriod(type: RangeSide, target: DayPeriod) {
	const sv = ctx.segmentValues[type].value;
	if (!('dayPeriod' in sv) || sv.dayPeriod === target) return;

	if (sv.hour != null) {
		sv.hour = target === 'PM' ? sv.hour + 12 : sv.hour - 12;
	}

	sv.dayPeriod = target;
}

function toggle(type: RangeSide) {
	const sv = ctx.segmentValues[type].value;
	if (!('dayPeriod' in sv)) return;
	setDayPeriod(type, sv.dayPeriod === 'AM' ? 'PM' : 'AM');
}

defineExpose({ toggle, setDayPeriod });
</script>
