<template>
	<div data-slot="survey-rating-scale" :class="classes">
		<p v-if="question" :class="surveyRatingScaleQuestionVariants()">
			{{ question }}
		</p>
		<ToggleGroup
			type="single"
			:model-value="modelValue"
			:disabled="disabled"
			class="w-full"
			@update:model-value="onUpdate"
		>
			<ToggleGroupItem v-for="n in options" :key="n" :value="String(n)" size="sm" class="flex-1">
				{{ n }}
			</ToggleGroupItem>
		</ToggleGroup>
		<div :class="surveyRatingScaleLabelsVariants()">
			<span>{{ minLabel }}</span>
			<span>{{ maxLabel }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { ToggleGroup, ToggleGroupItem } from '../../form/toggle-group';
import {
	surveyRatingScaleVariants,
	surveyRatingScaleQuestionVariants,
	surveyRatingScaleLabelsVariants,
} from './survey-rating-scale';

interface Props {
	modelValue?: string;
	question?: string;
	min?: number;
	max?: number;
	minLabel?: string;
	maxLabel?: string;
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	min: 0,
	max: 10,
	minLabel: 'Very easy',
	maxLabel: 'Very difficult',
	disabled: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const options = computed(() => {
	const items: number[] = [];
	for (let i = props.min; i <= props.max; i++) {
		items.push(i);
	}
	return items;
});

const classes = computed(() => cn(surveyRatingScaleVariants(), props.class));

function onUpdate(value: string | string[]) {
	const v = Array.isArray(value) ? value[0] : value;
	if (v) emit('update:modelValue', v);
}
</script>
