<template>
	<Popover v-model:open="isOpen" data-slot="feedback-popover">
		<PopoverTrigger data-slot="feedback-popover-trigger">
			<Button :variant="triggerVariant">{{ triggerLabel }}</Button>
		</PopoverTrigger>
		<PopoverContent :class="props.class" data-slot="feedback-popover-content">
			<div aria-live="polite" aria-atomic="true">
				<div
					v-if="showSuccess"
					:class="feedbackPopoverSuccessVariants()"
					data-slot="feedback-popover-success"
				>
					<Icon :icon="CircleCheck" size="default" class="text-success" />
					<p>Thank you for your feedback!</p>
				</div>

				<div v-else>
					<p :class="feedbackPopoverTitleVariants()">{{ title }}</p>
					<Textarea v-model="feedbackText" :placeholder="placeholder" class="mt-2" :rows="4" />
					<div :class="feedbackPopoverActionsVariants()">
						<Button
							data-slot="feedback-popover-submit"
							size="sm"
							:loading="loading"
							:disabled="!feedbackText.trim() || loading"
							@click="onSubmit"
						>
							{{ submitLabel }}
						</Button>
					</div>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { CircleCheck } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { Popover, PopoverTrigger, PopoverContent } from '../../general/popover/index.js';
import { Button } from '../../general/button/index.js';
import { Textarea } from '../../form/textarea/index.js';
import type { ButtonVariant } from '../../general/button/button.js';
import {
	feedbackPopoverTitleVariants,
	feedbackPopoverActionsVariants,
	feedbackPopoverSuccessVariants,
} from './feedback-popover.js';

interface Props {
	title?: string;
	placeholder?: string;
	submitLabel?: string;
	triggerLabel?: string;
	triggerVariant?: ButtonVariant;
	loading?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	title: 'Send us feedback',
	placeholder: 'How can we improve?',
	submitLabel: 'Send feedback',
	triggerLabel: 'Feedback',
	triggerVariant: 'outline',
	loading: false,
});

const emit = defineEmits<{
	submit: [feedback: string];
}>();

const feedbackText = ref('');
const isOpen = ref(false);
const showSuccess = ref(false);

function onSubmit() {
	const text = feedbackText.value.trim();
	if (!text || props.loading) return;
	emit('submit', text);
}

function setSuccess() {
	showSuccess.value = true;
	setTimeout(() => {
		showSuccess.value = false;
		feedbackText.value = '';
		isOpen.value = false;
	}, 2000);
}

watch(isOpen, (open) => {
	if (!open && !showSuccess.value) {
		feedbackText.value = '';
	}
});

defineExpose({ setSuccess });
</script>
