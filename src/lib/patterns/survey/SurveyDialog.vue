<template>
	<Dialog :open="open" @update:open="onOpenChange">
		<DialogContent data-slot="survey-dialog" :size="size" :class="props.class">
			<DialogHeader>
				<template v-if="$slots.icon" #icon>
					<slot name="icon" />
				</template>
				<DialogTitle>{{ title }}</DialogTitle>
				<slot name="header" />
			</DialogHeader>

			<div :class="surveyDialogBodyVariants()">
				<template v-for="(step, index) in steps" :key="step">
					<div v-show="currentStep === index">
						<slot :name="`step-${index}`" :step-label="step" :step-index="index" />
					</div>
				</template>
			</div>

			<div :class="surveyDialogFooterVariants()">
				<span v-if="!isSingleStep" :class="surveyDialogStepIndicatorVariants()">
					{{ currentStep + 1 }} / {{ steps.length }}
				</span>
				<div :class="surveyDialogActionsVariants()">
					<Button
						v-if="!isFirstStep && !isSingleStep"
						data-slot="survey-dialog-prev"
						variant="outline"
						:disabled="loading"
						@click="back"
					>
						{{ backLabel }}
					</Button>
					<Button data-slot="survey-dialog-next" :loading="loading" @click="next">
						{{ isLastStep || isSingleStep ? submitLabel : nextLabel }}
					</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Dialog } from '../../general/dialog';
import DialogContent from '../../general/dialog/DialogContent.vue';
import DialogHeader from '../../general/dialog/DialogHeader.vue';
import DialogTitle from '../../general/dialog/DialogTitle.vue';
import { Button } from '../../general/button';
import type { DialogSize } from '../../general/dialog/dialog';
import {
	surveyDialogBodyVariants,
	surveyDialogFooterVariants,
	surveyDialogStepIndicatorVariants,
	surveyDialogActionsVariants,
} from './survey-dialog';

interface Props {
	open?: boolean;
	title?: string;
	steps: string[];
	submitLabel?: string;
	nextLabel?: string;
	backLabel?: string;
	loading?: boolean;
	size?: DialogSize;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	open: false,
	title: 'Help us improve',
	submitLabel: 'Send feedback',
	nextLabel: 'Next',
	backLabel: 'Back',
	loading: false,
	size: 'sm',
});

const emit = defineEmits<{
	'update:open': [value: boolean];
	submit: [];
	'update:step': [index: number];
}>();

const currentStep = ref(0);

const isFirstStep = computed(() => currentStep.value === 0);
const isLastStep = computed(() => currentStep.value === props.steps.length - 1);
const isSingleStep = computed(() => props.steps.length <= 1);

function next() {
	if (isLastStep.value) {
		emit('submit');
	} else {
		currentStep.value++;
		emit('update:step', currentStep.value);
	}
}

function back() {
	if (!isFirstStep.value) {
		currentStep.value--;
		emit('update:step', currentStep.value);
	}
}

function onOpenChange(value: boolean) {
	emit('update:open', value);
	if (!value) {
		currentStep.value = 0;
	}
}

watch(
	() => props.open,
	(open) => {
		if (!open) {
			currentStep.value = 0;
		}
	},
);

function setSuccess() {
	emit('update:open', false);
	currentStep.value = 0;
}

defineExpose({ setSuccess, next, back, currentStep });
</script>
