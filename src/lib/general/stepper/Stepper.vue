<template>
	<div data-slot="stepper" :class="classes">
		<!-- Steps header — circle + title + separator -->
		<!--
      Native <ol> already exposes list semantics. `aria-orientation` is not a
      permitted attribute on <ol> (axe rule: aria-allowed-attr) — orientation
      is purely visual here, so we surface it via data-orientation only.
    -->
		<ol data-slot="stepper-list" :class="listClasses" :data-orientation="orientation">
			<template v-for="(step, index) in steps" :key="step.id">
				<li
					data-slot="stepper-step"
					:data-state="getStepState(index)"
					:data-optional="step.optional ? 'true' : 'false'"
					:class="
						orientation === 'horizontal'
							? 'flex flex-col items-center shrink-0'
							: 'flex items-start gap-3'
					"
				>
					<!-- Step indicator: native <button> if clickable, <div> otherwise.
               This keeps focus management and aria-current correct without
               adding a fake button when the indicator isn't interactive.
               `aria-label` is only added on the interactive button variant —
               on a plain <div> with no role it would violate
               aria-prohibited-attr. The visible step title beneath provides
               the label for the non-interactive case. -->
					<component
						:is="isStepClickable(index) ? 'button' : 'div'"
						data-slot="stepper-indicator"
						:type="isStepClickable(index) ? 'button' : undefined"
						:aria-current="getAriaCurrent(index)"
						:aria-label="isStepClickable(index) ? `Step ${index + 1}: ${step.title}` : undefined"
						:disabled="isStepClickable(index) ? undefined : undefined"
						:class="getStepClasses(index)"
						@click="goToStep(index)"
					>
						<Spinner
							v-if="loading && modelValue === index"
							size="sm"
							class="text-primary-foreground"
						/>
						<Icon
							v-else-if="getStepState(index) === 'completed'"
							:icon="Check"
							size="sm"
							data-slot="stepper-check"
						/>
						<span v-else>{{ index + 1 }}</span>
					</component>
					<!-- Title + description -->
					<div
						data-slot="stepper-label"
						:class="
							orientation === 'horizontal'
								? 'flex flex-col items-center'
								: 'flex flex-col items-start'
						"
					>
						<span
							class="mt-2 text-xs sm:text-sm font-medium whitespace-nowrap"
							:class="[
								orientation === 'horizontal' ? 'text-center' : 'mt-0',
								modelValue === index || getStepState(index) === 'completed'
									? 'text-foreground'
									: 'text-muted-foreground',
							]"
						>
							{{ step.title }}
						</span>
						<span
							v-if="step.optional && getStepState(index) === 'inactive'"
							class="text-2xs text-muted-foreground"
							:class="orientation === 'horizontal' ? 'text-center' : ''"
						>
							Optional
						</span>
						<span
							v-else-if="step.description"
							class="text-xs text-muted-foreground"
							:class="orientation === 'horizontal' ? 'text-center' : ''"
						>
							{{ step.description }}
						</span>
					</div>
				</li>

				<!-- Separator -->
				<div
					v-if="index < steps.length - 1"
					data-slot="stepper-separator"
					aria-hidden="true"
					:class="[
						cn(
							stepperSeparatorVariants({
								orientation,
								completed: isSeparatorComplete(index),
								dashed: !!steps[index + 1]?.optional,
							}),
						),
						orientation === 'horizontal' ? 'mb-auto mt-3.5' : 'ml-4',
					]"
				/>
			</template>
		</ol>

		<!-- Content slot -->
		<div data-slot="stepper-content" :class="contentClasses">
			<slot :current-step="currentStep" :step-index="modelValue" />
		</div>

		<!-- Navigation buttons -->
		<div v-if="showNavigation" data-slot="stepper-actions" :class="actionsClasses">
			<Button variant="outline" :disabled="isFirstStep || loading" @click="previousStep">
				Previous
			</Button>
			<Button :disabled="loading || currentStep?.disabled" @click="nextStep">
				{{ isLastStep ? 'Finish' : 'Next' }}
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { Check } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import Spinner from '../spinner/Spinner.vue';
import Button from '../button/Button.vue';
import {
	stepperVariants,
	stepperListVariants,
	stepperItemVariants,
	stepperSeparatorVariants,
	stepperContentVariants,
	stepperActionsVariants,
	STEPPER_VARIANT_KEY,
	type Step,
	type StepperItemState,
	type StepperVariant,
	type StepperOrientation,
} from './stepper.js';

interface StepperProps {
	/** Array of steps to display. */
	steps: Step[];
	/** Current active step index. */
	modelValue?: number;
	/** Whether the current step is loading (shows spinner on its indicator and disables nav). */
	loading?: boolean;
	/** Whether to render the Previous / Next navigation buttons. */
	showNavigation?: boolean;
	/**
	 * Allow clicking any step to jump to it.
	 *
	 * - `false` (default): no step indicators are clickable.
	 * - `true`: all completed and previously visited steps become clickable; future steps remain disabled.
	 * - `'any'`: every non-disabled step becomes clickable, including future ones (use with caution; required if your steps don't have inter-step validation).
	 */
	interactive?: boolean | 'any';
	/** Visual orientation of the step indicator row. */
	orientation?: StepperOrientation;
	/** Visual variant. */
	variant?: StepperVariant;
	class?: string;
}

const props = withDefaults(defineProps<StepperProps>(), {
	modelValue: 0,
	loading: false,
	showNavigation: true,
	interactive: false,
	orientation: 'horizontal',
	variant: 'default',
});

provide(STEPPER_VARIANT_KEY, toRef(props, 'variant'));

const emit = defineEmits<{
	'update:modelValue': [value: number];
	stepComplete: [payload: { step: Step; index: number }];
	finish: [];
}>();

const classes = computed(() => cn(stepperVariants(), props.class));
const listClasses = computed(() => cn(stepperListVariants({ orientation: props.orientation })));
const contentClasses = computed(() => cn(stepperContentVariants()));
const actionsClasses = computed(() => cn(stepperActionsVariants()));

const isLastStep = computed(() => props.modelValue === props.steps.length - 1);
const isFirstStep = computed(() => props.modelValue === 0);

const currentStep = computed(() => props.steps[props.modelValue]);

function getStepState(index: number): StepperItemState {
	if (props.loading && props.modelValue === index) return 'loading';
	if (props.steps[index]?.completed || index < props.modelValue) return 'completed';
	if (props.modelValue === index) return 'active';
	return 'inactive';
}

function isStepClickable(index: number): boolean {
	if (props.loading) return false;
	if (props.steps[index]?.disabled) return false;
	if (index === props.modelValue) return false;
	if (props.interactive === 'any') return true;
	if (props.interactive === true) return index < props.modelValue;
	return false;
}

function getStepClasses(index: number): string {
	return cn(
		stepperItemVariants({
			state: getStepState(index),
			optional: !!props.steps[index]?.optional,
			clickable: isStepClickable(index),
		}),
	);
}

function goToStep(index: number): void {
	if (!isStepClickable(index)) return;
	emit('update:modelValue', index);
}

function isSeparatorComplete(index: number): boolean {
	return props.steps[index]?.completed || index < props.modelValue;
}

function nextStep(): void {
	if (props.modelValue < props.steps.length - 1) {
		emit('stepComplete', { step: currentStep.value, index: props.modelValue });
		emit('update:modelValue', props.modelValue + 1);
	} else if (isLastStep.value) {
		emit('stepComplete', { step: currentStep.value, index: props.modelValue });
		emit('finish');
	}
}

function previousStep(): void {
	if (props.modelValue > 0) {
		emit('update:modelValue', props.modelValue - 1);
	}
}

function getAriaCurrent(index: number): 'step' | undefined {
	return props.modelValue === index ? 'step' : undefined;
}
</script>
