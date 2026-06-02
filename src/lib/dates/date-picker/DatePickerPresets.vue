<template>
	<div data-slot="date-picker-presets" class="flex flex-col gap-0.5 border-r border-border p-2">
		<Button
			v-for="preset in presets"
			:key="preset.id"
			variant="ghost"
			size="sm"
			data-slot="date-picker-preset-item"
			:data-active="activePresetId === preset.id ? '' : undefined"
			:class="datePickerPresetItemVariants()"
			@click="onSelect(preset)"
		>
			{{ preset.label }}
		</Button>
	</div>
</template>

<script setup lang="ts">
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import Button from '../../general/button/Button.vue';
import { datePickerPresetItemVariants } from './date-picker';
import type { DatePickerPreset } from './date-picker';

interface Props {
	presets: DatePickerPreset[];
	activePresetId?: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
	select: [value: ForgeDate, presetId: string];
}>();

function onSelect(preset: DatePickerPreset) {
	emit('select', preset.date(), preset.id);
}
</script>
