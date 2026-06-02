<template>
	<div :class="cn(splitButtonRootVariants(), props.class)" data-slot="split-button">
		<Button
			ref="primaryRef"
			:variant="variant"
			:size="size"
			:disabled="disabled || selectedAction?.disabled"
			:loading="loading"
			:class="splitButtonPrimaryVariants()"
			data-slot="split-button-primary"
			@click="handleClick"
			@keydown="onPrimaryKeydown"
		>
			<slot :action="selectedAction">
				{{ selectedAction?.label }}
			</slot>
		</Button>

		<DropdownMenu>
			<DropdownMenuTrigger as-child>
				<Button
					ref="triggerRef"
					:variant="variant"
					:size="size"
					:disabled="disabled"
					:class="splitButtonTriggerVariants()"
					:aria-label="triggerAriaLabel"
					data-slot="split-button-trigger"
				>
					<Icon :icon="ChevronDown" size="sm" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent :align="align" class="max-w-[calc(100vw-1rem)] sm:max-w-xs">
				<DropdownMenuRadioGroup
					:model-value="selectedValue"
					@update:model-value="handleSelectionChange"
				>
					<DropdownMenuRadioItem
						v-for="action in actions"
						:key="action.value"
						:value="action.value"
						:disabled="action.disabled"
						data-slot="split-button-item"
					>
						<div :class="splitButtonItemVariants()">
							<span :class="splitButtonItemLabelVariants()">
								{{ action.label }}
							</span>
							<span v-if="action.description" :class="splitButtonItemDescriptionVariants()">
								{{ action.description }}
							</span>
						</div>
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronDown } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import Button from '../button/Button.vue';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from '../dropdown-menu';
import type { ButtonVariants } from '../button/button';
import {
	splitButtonRootVariants,
	splitButtonPrimaryVariants,
	splitButtonTriggerVariants,
	splitButtonItemVariants,
	splitButtonItemLabelVariants,
	splitButtonItemDescriptionVariants,
	type SplitButtonAction,
} from './split-button';

interface SplitButtonProps {
	/** Available actions to choose from. */
	actions: SplitButtonAction[];
	/** The currently selected action value (v-model). */
	modelValue?: string;
	/** Button variant — applies to both the primary button and the dropdown trigger. */
	variant?: ButtonVariants['variant'];
	/** Button size. */
	size?: ButtonVariants['size'];
	/** Disable the entire split button. */
	disabled?: boolean;
	/** Show loading state on the primary button. */
	loading?: boolean;
	/** Dropdown content alignment. */
	align?: 'start' | 'center' | 'end';
	/** Accessible label for the dropdown trigger. Defaults to `"More options"`. */
	triggerAriaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<SplitButtonProps>(), {
	variant: 'default',
	size: 'default',
	disabled: false,
	loading: false,
	align: 'end',
	triggerAriaLabel: 'More options',
});

const emit = defineEmits<{
	/** Fired when the primary button is clicked. Payload is the selected action value. */
	click: [value: string];
	/** Fired when the user picks a different action from the dropdown. */
	'update:modelValue': [value: string];
}>();

const selectedValue = computed(() => {
	if (props.modelValue) return props.modelValue;
	return props.actions[0]?.value ?? '';
});

const selectedAction = computed(() => props.actions.find((a) => a.value === selectedValue.value));

const primaryRef = ref<InstanceType<typeof Button>>();
const triggerRef = ref<InstanceType<typeof Button>>();

function handleClick() {
	if (selectedAction.value && !selectedAction.value.disabled) {
		emit('click', selectedValue.value);
	}
}

function handleSelectionChange(value: string) {
	emit('update:modelValue', value);
}

// SC 2.1.1: ArrowDown on the primary button opens the dropdown — the user
// should not need to tab to the chevron to reach the menu. We dispatch a
// click on the trigger which Reka handles as "open menu".
function onPrimaryKeydown(event: KeyboardEvent) {
	if (event.key === 'ArrowDown') {
		event.preventDefault();
		// `as unknown as { $el }`: triggerRef points at the Reka trigger component;
		// we need the underlying DOM element to dispatch a click that opens the menu.
		const triggerEl = (triggerRef.value as unknown as { $el?: HTMLElement })?.$el;
		triggerEl?.click();
	}
}
</script>
