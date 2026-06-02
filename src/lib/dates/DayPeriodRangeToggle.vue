<template>
	<slot />
</template>

<script setup lang="ts">
import { injectTimeRangeFieldRootContext } from 'reka-ui';

// Bypasses Reka's keydown handler which adds ±12h to null hours when toggling
// dayPeriod. Must render inside a TimeRangeFieldRoot slot.
const ctx = injectTimeRangeFieldRootContext();

function setDayPeriod(type: 'start' | 'end', target: 'AM' | 'PM') {
	const sv = ctx.segmentValues[type].value;
	if (!('dayPeriod' in sv) || sv.dayPeriod === target) return;

	if (sv.hour != null) {
		sv.hour = target === 'PM' ? sv.hour + 12 : sv.hour - 12;
	}

	sv.dayPeriod = target;
}

function toggle(type: 'start' | 'end') {
	const sv = ctx.segmentValues[type].value;
	if (!('dayPeriod' in sv)) return;
	setDayPeriod(type, sv.dayPeriod === 'AM' ? 'PM' : 'AM');
}

defineExpose({ toggle, setDayPeriod });
</script>
