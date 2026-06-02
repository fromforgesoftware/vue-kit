<template>
	<div
		data-slot="date-range-picker-presets"
		class="flex flex-col gap-0.5 border-r border-border p-2"
	>
		<Button
			v-for="preset in presets"
			:key="preset.id"
			variant="ghost"
			size="sm"
			data-slot="date-range-picker-preset-item"
			:data-active="activePresetId === preset.id ? '' : undefined"
			:class="dateRangePresetItemVariants()"
			@click="onSelect(preset)"
		>
			{{ preset.label }}
		</Button>
	</div>
</template>

<script setup lang="ts">
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import Button from '../../general/button/Button.vue';
import { dateRangePresetItemVariants } from './date-range-picker';
import type { DateRangePreset } from './date-range-picker';

interface Props {
	presets: DateRangePreset[];
	activePresetId?: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
	select: [value: { start: ForgeDate; end: ForgeDate }, presetId: string];
}>();

function onSelect(preset: DateRangePreset) {
	emit('select', preset.range(), preset.id);
}
</script>
