<template>
	<Dialog :open="open" @update:open="onOpenChange">
		<slot name="trigger" />

		<DialogContent data-slot="plan-picker" size="sm" :class="props.class">
			<!-- Header -->
			<DialogHeader>
				<template v-if="$slots.icon" #icon>
					<slot name="icon" />
				</template>
				<DialogTitle>
					<slot name="title">{{ title }}</slot>
				</DialogTitle>
				<DialogDescription>
					<slot name="description">{{ description }}</slot>
				</DialogDescription>
			</DialogHeader>

			<!-- Scrollable body: plan options + features -->
			<DialogBody class="flex flex-col gap-5">
				<!-- Plan options -->
				<RadioGroup
					:model-value="selectedValue"
					class="flex flex-col gap-2.5"
					@update:model-value="onSelectPlan($event)"
				>
					<PlanPickerOption
						v-for="plan in plans"
						:key="plan.value"
						:value="plan.value"
						:name="plan.name"
						:price="plan.price"
						:disabled="plan.disabled"
						:selected="selectedValue === plan.value"
					>
						<template v-if="$slots['option-name']" #name>
							<slot name="option-name" :plan="plan" />
						</template>
						<template v-if="$slots['option-price']" #price>
							<slot name="option-price" :plan="plan" />
						</template>
					</PlanPickerOption>
				</RadioGroup>

				<!-- Features -->
				<div v-if="features.length > 0 || $slots.features" class="flex flex-col gap-3">
					<p class="text-sm font-medium">
						<slot name="features-title">Features include:</slot>
					</p>

					<slot name="features" :features="features">
						<div class="flex flex-col gap-2.5">
							<div v-for="(feature, idx) in features" :key="idx" :class="featureClasses">
								<Icon :icon="Check" size="sm" :class="featureIconClasses" />
								<span>{{ feature.label }}</span>
							</div>
						</div>
					</slot>
				</div>
			</DialogBody>

			<!-- Actions -->
			<DialogFooter>
				<DialogClose>
					<Button data-slot="plan-picker-cancel" variant="outline" @click="onCancel">
						{{ cancelLabel }}
					</Button>
				</DialogClose>
				<Button
					data-slot="plan-picker-confirm"
					:loading="loading"
					:disabled="!selectedValue"
					@click="onConfirm"
				>
					{{ confirmLabel }}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { cn } from '../../../helpers/cn';
import { Check } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Dialog from '../../general/dialog/Dialog.vue';
import DialogContent from '../../general/dialog/DialogContent.vue';
import DialogHeader from '../../general/dialog/DialogHeader.vue';
import DialogTitle from '../../general/dialog/DialogTitle.vue';
import DialogDescription from '../../general/dialog/DialogDescription.vue';
import DialogFooter from '../../general/dialog/DialogFooter.vue';
import DialogBody from '../../general/dialog/DialogBody.vue';
import DialogClose from '../../general/dialog/DialogClose.vue';
import RadioGroup from '../../form/radio/RadioGroup.vue';
import Button from '../../general/button/Button.vue';
import PlanPickerOption from './PlanPickerOption.vue';
import {
	planPickerFeatureVariants,
	planPickerFeatureIconVariants,
	type PlanOption,
	type PlanFeature,
} from './plan-picker';

interface PlanPickerProps {
	/** Whether the dialog is open */
	open?: boolean;
	/** Available plan options */
	plans: PlanOption[];
	/** Currently selected plan value */
	modelValue?: string;
	/** Features to display below the plan options */
	features?: PlanFeature[];
	/** Dialog title */
	title?: string;
	/** Dialog subtitle / description */
	description?: string;
	/** Confirm button label */
	confirmLabel?: string;
	/** Cancel button label */
	cancelLabel?: string;
	/** Whether the confirm action is loading */
	loading?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<PlanPickerProps>(), {
	open: false,
	modelValue: undefined,
	features: () => [],
	title: 'Change your plan',
	description: 'Pick one of the following plans.',
	confirmLabel: 'Change plan',
	cancelLabel: 'Cancel',
	loading: false,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
	'update:modelValue': [value: string];
	confirm: [value: string];
	cancel: [];
}>();

const selectedValue = ref(props.modelValue ?? '');

watch(
	() => props.modelValue,
	(val) => {
		if (val !== undefined) selectedValue.value = val;
	},
);

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen && props.modelValue !== undefined) {
			selectedValue.value = props.modelValue;
		}
	},
);

function onSelectPlan(value: string) {
	selectedValue.value = value;
	emit('update:modelValue', value);
}

function onConfirm() {
	emit('confirm', selectedValue.value);
}

function onCancel() {
	emit('cancel');
	emit('update:open', false);
}

function onOpenChange(value: boolean) {
	emit('update:open', value);
}

const featureClasses = computed(() => cn(planPickerFeatureVariants()));
const featureIconClasses = computed(() => cn(planPickerFeatureIconVariants()));
</script>
