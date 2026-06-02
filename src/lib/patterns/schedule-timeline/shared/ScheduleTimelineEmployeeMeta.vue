<template>
	<span v-if="hasContent" class="text-2xs text-muted-foreground truncate leading-tight mt-0.5">
		<template v-if="employee.scheduledHours !== undefined">
			<span :class="hoursToneClass">
				{{ formatHours(employee.scheduledHours)
				}}<template v-if="employee.weeklyHours !== undefined">/{{ employee.weeklyHours }}</template
				>h
			</span>
		</template>
		<template v-else-if="employee.weeklyHours !== undefined"
			>{{ employee.weeklyHours }} hrs</template
		>
		<template
			v-if="
				(employee.weeklyHours !== undefined || employee.scheduledHours !== undefined) &&
				employee.role
			"
		>
			&middot;
		</template>
		<template v-if="employee.role">{{ employee.role }}</template>
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ScheduleTimelineEmployee } from '../schedule-timeline';

const props = defineProps<{
	employee: ScheduleTimelineEmployee;
}>();

const hasContent = computed(
	() =>
		props.employee.scheduledHours !== undefined ||
		props.employee.weeklyHours !== undefined ||
		!!props.employee.role,
);

const hoursToneClass = computed(() => {
	switch (props.employee.scheduledHoursTone) {
		case 'over':
			return 'text-destructive font-medium';
		case 'under':
			return 'text-warning font-medium';
		case 'ok':
			return 'text-success';
		default:
			return '';
	}
});

// Single Intl.NumberFormat so the decimal separator matches surrounding numbers.
const hoursFormatter = computed(
	() =>
		new Intl.NumberFormat('en-GB', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 1,
		}),
);

function formatHours(hours: number): string {
	return hoursFormatter.value.format(hours);
}
</script>
