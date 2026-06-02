<template>
	<RadioGroupItem
		:id="id"
		data-slot="radio-group-item"
		:value="value"
		:disabled="disabled"
		:required="required"
		:aria-invalid="effectiveError || undefined"
		:aria-describedby="describedBy"
		:class="itemClasses"
	>
		<RadioGroupIndicator data-slot="radio-group-indicator" :class="indicatorClasses">
			<svg
				viewBox="0 0 6 6"
				fill="currentcolor"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<circle cx="3" cy="3" r="3" />
			</svg>
		</RadioGroupIndicator>
	</RadioGroupItem>
</template>

<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue';
import { RadioGroupItem, RadioGroupIndicator } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { radioItemVariants, radioIndicatorVariants, type RadioSize } from './radio';

interface RadioGroupItemProps {
	/** The value of this item. Selected when it matches the group's `modelValue`. */
	value: string;
	/** Disable just this item. */
	disabled?: boolean;
	/** Required attribute (native form validation). */
	required?: boolean;
	/** Density. Defaults to the group's size when inside a RadioGroup. */
	size?: RadioSize;
	/** Sets `aria-invalid="true"` on this item — usually inherited from the group. */
	error?: boolean;
	/** id of the element(s) describing this item — error or hint text. */
	describedBy?: string;
	/** Element id matching the `for` of an associated `<Label>`. */
	id?: string;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<RadioGroupItemProps>(), {
	disabled: false,
	required: false,
});

// Inherit size + error from the group when not overridden on the item.
const groupSize = inject<ComputedRef<RadioSize | undefined> | undefined>(
	'radioGroupSize',
	undefined,
);
const groupError = inject<ComputedRef<boolean | undefined> | undefined>(
	'radioGroupError',
	undefined,
);

const effectiveSize = computed<RadioSize>(() => props.size ?? groupSize?.value ?? 'default');
const effectiveError = computed<boolean>(() => props.error || (groupError?.value ?? false));

const itemClasses = computed(() =>
	cn(radioItemVariants({ size: effectiveSize.value }), props.class),
);
const indicatorClasses = computed(() => cn(radioIndicatorVariants({ size: effectiveSize.value })));
</script>
