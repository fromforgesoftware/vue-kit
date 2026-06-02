<template>
	<SwitchRoot
		:id="id"
		data-slot="switch"
		:model-value="checked"
		:default-value="defaultChecked"
		:disabled="disabled"
		:required="required"
		:name="name"
		:value="value"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:aria-label="ariaLabel"
		:class="rootClasses"
		@update:model-value="onModelValueChange"
	>
		<SwitchThumb data-slot="switch-thumb" :class="thumbClasses" />
	</SwitchRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { switchVariants, switchThumbVariants, type SwitchVariants } from './switch';

interface SwitchProps {
	/** Controlled checked state. */
	checked?: boolean;
	/** Initial uncontrolled state. */
	defaultChecked?: boolean;
	/** Disabled state. */
	disabled?: boolean;
	/** Required attribute (native form validation). */
	required?: boolean;
	/** Sets `aria-invalid="true"` and tints the focus ring destructive. */
	error?: boolean;
	/** id of the element(s) describing this switch — error or hint text. */
	describedBy?: string;
	/** Accessible name when no Label is associated. Prefer pairing with `<Label for>`. */
	ariaLabel?: string;
	/** Density. `default` = 20 px tall track; `sm` = 16 px. Both meet WCAG 24×24 hit-area via invisible padding. */
	size?: SwitchVariants['size'];
	/** Native form `name` attribute. */
	name?: string;
	/** Native form `value` attribute. */
	value?: string;
	/** id matching the `for` of an associated `<Label>`. */
	id?: string;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<SwitchProps>(), {
	checked: undefined,
	defaultChecked: false,
	disabled: false,
	required: false,
	error: false,
	size: 'default',
});

const emit = defineEmits<{
	'update:checked': [value: boolean];
}>();

const rootClasses = computed(() => cn(switchVariants({ size: props.size }), props.class));
const thumbClasses = computed(() => cn(switchThumbVariants({ size: props.size })));

function onModelValueChange(val: boolean) {
	emit('update:checked', val);
}
</script>
