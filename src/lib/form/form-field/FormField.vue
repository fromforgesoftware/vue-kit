<template>
	<div
		data-slot="form-field"
		:data-error="hasError ? 'true' : undefined"
		:data-layout="effectiveLayout"
		:class="wrapperClasses"
	>
		<div data-slot="form-field-label-col" :class="labelColClasses">
			<Label
				data-slot="form-field-label"
				:for="fieldId"
				:required="required"
				:variant="hasError ? 'error' : 'default'"
				:class="srOnlyLabel ? 'sr-only' : undefined"
			>
				{{ label }}
			</Label>
			<p
				v-if="description && effectiveLayout === 'horizontal' && !hasError"
				:id="hintId"
				data-slot="form-field-description"
				:class="formFieldMessageVariants({ tone: 'hint' })"
			>
				{{ description }}
			</p>
		</div>

		<div data-slot="form-field-control-col" :class="controlColClasses">
			<div data-slot="form-field-control" class="flex w-full items-center gap-2">
				<div class="min-w-0 flex-1">
					<slot
						:id="fieldId"
						:error="hasError"
						:required="required"
						:aria-described-by="ariaDescribedBy"
					/>
				</div>
				<slot name="action" />
			</div>

			<p
				v-if="description && effectiveLayout === 'vertical' && !hasError"
				:id="hintId"
				data-slot="form-field-description"
				:class="formFieldMessageVariants({ tone: 'hint' })"
			>
				{{ description }}
			</p>

			<p
				v-if="hasError"
				:id="errorId"
				data-slot="form-field-error"
				role="alert"
				aria-live="polite"
				:class="formFieldMessageVariants({ tone: 'error' })"
			>
				{{ error }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import Label from '../label/Label.vue';
import { cn } from '../../../helpers/cn';
import {
	formFieldVariants,
	formFieldLabelColVariants,
	formFieldControlColVariants,
	formFieldMessageVariants,
	type FormFieldVariants,
} from './form-field';

interface FormFieldProps {
	/** Visible label text. Required — every field needs a programmatic name. */
	label: string;
	/** Helper text shown below the control. Hidden when `error` is set. */
	description?: string;
	/** Error message. When non-empty, replaces the description and tints the field. */
	error?: string;
	/** Required attribute. Renders the asterisk on the Label and asks the
	 * slotted control to set `required` via the scoped slot. */
	required?: boolean;
	/** Layout. `vertical` stacks; `horizontal` aligns the label on the left at md+. */
	layout?: FormFieldVariants['layout'];
	/**
	 * Compatibility alias for `layout`:
	 *   - `panel` (drawer/embedded form) → `vertical`
	 *   - `page` (settings page row)     → `horizontal`
	 * Prefer `layout` in new code.
	 */
	variant?: 'panel' | 'page';
	/** id wired to the slotted control. Auto-generated if omitted. */
	for?: string;
	/** Hide the label visually but keep it for assistive tech. */
	srOnlyLabel?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<FormFieldProps>(), {
	required: false,
	srOnlyLabel: false,
});

// Resolve the effective layout. `variant` is the legacy prop; `layout` wins.
const effectiveLayout = computed<FormFieldVariants['layout']>(() => {
	if (props.layout) return props.layout;
	if (props.variant === 'panel') return 'vertical';
	if (props.variant === 'page') return 'horizontal';
	return 'vertical';
});

const autoId = useId();
const fieldId = computed(() => props.for ?? `field-${autoId}`);
const hintId = computed(() => `${fieldId.value}-hint`);
const errorId = computed(() => `${fieldId.value}-error`);
const hasError = computed(() => !!props.error);

// `aria-describedby` collects every visible message id. Order matters for
// screen readers — error first so users hear the failure ahead of context.
const ariaDescribedBy = computed(() => {
	const ids: string[] = [];
	if (hasError.value) ids.push(errorId.value);
	if (props.description) ids.push(hintId.value);
	return ids.length > 0 ? ids.join(' ') : undefined;
});

const wrapperClasses = computed(() =>
	cn(
		formFieldVariants({ layout: effectiveLayout.value }),
		hasError.value && 'data-[error=true]',
		props.class,
	),
);
const labelColClasses = computed(() =>
	formFieldLabelColVariants({ layout: effectiveLayout.value }),
);
const controlColClasses = computed(() =>
	formFieldControlColVariants({ layout: effectiveLayout.value }),
);

defineSlots<{
	default?: (props: {
		id: string;
		error: boolean;
		required: boolean;
		ariaDescribedBy: string | undefined;
	}) => unknown;
	/** Trailing content after the control (right-aligned helper, action). */
	action?: () => unknown;
}>();
</script>
