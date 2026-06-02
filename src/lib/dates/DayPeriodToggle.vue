<template>
	<slot />
</template>

<script setup lang="ts">
import { injectTimeFieldRootContext } from 'reka-ui';

// Bypasses Reka's keydown handler which adds ±12h to null hours when toggling
// dayPeriod. Must render inside a TimeFieldRoot slot.
const ctx = injectTimeFieldRootContext();

function setDayPeriod(target: 'AM' | 'PM') {
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
