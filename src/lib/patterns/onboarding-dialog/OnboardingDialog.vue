<template>
	<Dialog data-slot="onboarding-dialog" :open="open" @update:open="onOpenChange">
		<DialogContent
			data-slot="onboarding-dialog-content"
			:class="cn(onboardingDialogContentVariants(), props.class)"
			:hide-close-button="hideCloseButton"
		>
			<!--
        Reka stamps aria-labelledby/describedby onto the dialog content. We
        always feed it a real DialogTitle/Description so axe's
        aria-dialog-name rule resolves; the visible <h2>/<p> below remains
        the consumer-facing copy.
      -->
			<VisuallyHidden>
				<DialogTitle>{{ step?.title ?? 'Onboarding' }}</DialogTitle>
				<DialogDescription>{{ step?.description ?? '' }}</DialogDescription>
			</VisuallyHidden>

			<!-- Media area -->
			<div :class="onboardingDialogMediaVariants()">
				<slot name="media" :step="step" :index="currentStep" />
			</div>

			<!-- Body -->
			<div :class="onboardingDialogBodyVariants()">
				<slot name="content" :step="step" :index="currentStep">
					<h2
						v-if="step?.title"
						data-slot="onboarding-dialog-title"
						:class="onboardingDialogTitleVariants()"
					>
						{{ step.title }}
					</h2>
					<p v-if="step?.description" :class="onboardingDialogDescriptionVariants()">
						{{ step.description }}
					</p>
				</slot>
			</div>

			<!-- Footer -->
			<div :class="onboardingDialogFooterVariants()">
				<!-- Dot indicators -->
				<div class="flex items-center" aria-label="Onboarding steps">
					<Button
						v-for="(s, i) in steps"
						:key="s.id"
						data-slot="onboarding-dialog-step"
						variant="ghost"
						size="icon-xs"
						:aria-current="i === currentStep ? 'step' : undefined"
						:aria-label="`Step ${i + 1}: ${s.title}`"
						:class="cn(onboardingDialogDotVariants({ active: i === currentStep }))"
						@click="goTo(i)"
					/>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2">
					<Button variant="outline" @click="skip">
						{{ skipLabel }}
					</Button>
					<Button data-slot="onboarding-dialog-next" @click="next">
						{{ isLast ? finishLabel : nextLabel }}
						<Icon v-if="!isLast" :icon="ArrowRight" size="sm" />
					</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowRight } from '@lucide/vue';
import { VisuallyHidden, DialogTitle, DialogDescription } from 'reka-ui';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import { Dialog } from '../../general/dialog';
import DialogContent from '../../general/dialog/DialogContent.vue';
import { Button } from '../../general/button';
import {
	onboardingDialogContentVariants,
	onboardingDialogMediaVariants,
	onboardingDialogBodyVariants,
	onboardingDialogTitleVariants,
	onboardingDialogDescriptionVariants,
	onboardingDialogFooterVariants,
	onboardingDialogDotVariants,
	type OnboardingStep,
} from './onboarding-dialog';

interface OnboardingDialogProps {
	/** Array of onboarding step definitions */
	steps: OnboardingStep[];
	/** Whether the dialog is open (v-model:open) */
	open?: boolean;
	/** Label for the skip button */
	skipLabel?: string;
	/** Label for the next button */
	nextLabel?: string;
	/** Label for the finish button (last step) */
	finishLabel?: string;
	/** Hide the close (X) button */
	hideCloseButton?: boolean;
	/** Class override for the dialog content */
	class?: string;
}

const props = withDefaults(defineProps<OnboardingDialogProps>(), {
	open: false,
	skipLabel: 'Skip',
	nextLabel: 'Next',
	finishLabel: 'Get Started',
	hideCloseButton: false,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
	next: [payload: { step: OnboardingStep; index: number }];
	complete: [];
	skip: [];
}>();

// Step navigation
const currentStep = ref(0);

const step = computed(() => props.steps[currentStep.value] ?? null);
const isLast = computed(() => currentStep.value === props.steps.length - 1);

function next() {
	if (!step.value) return;

	emit('next', { step: step.value, index: currentStep.value });

	if (isLast.value) {
		emit('complete');
		emit('update:open', false);
		currentStep.value = 0;
	} else {
		currentStep.value++;
	}
}

function goTo(index: number) {
	if (index >= 0 && index < props.steps.length) {
		currentStep.value = index;
	}
}

function skip() {
	emit('skip');
	emit('update:open', false);
	currentStep.value = 0;
}

function onOpenChange(value: boolean) {
	emit('update:open', value);
	if (!value) {
		currentStep.value = 0;
	}
}

// Reset step index when dialog opens
watch(
	() => props.open,
	(open) => {
		if (!open) {
			currentStep.value = 0;
		}
	},
);

defineExpose({ next, goTo, skip, currentStep });
</script>
