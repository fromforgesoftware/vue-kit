<template>
	<ToolbarToggleGroup
		v-bind="rootProps"
		:class="classes"
		data-slot="toolbar-toggle-group"
		@update:model-value="emit('update:modelValue', $event as string | string[])"
	>
		<slot />
	</ToolbarToggleGroup>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { ToolbarToggleGroup } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	toolbarToggleGroupVariants,
	TOOLBAR_ORIENTATION_KEY,
	type ToolbarOrientation,
} from './toolbar.js';

interface ToolbarToggleGroupProps {
	/** Whether one or many items can be active. */
	type?: 'single' | 'multiple';
	/** Controlled value(s). */
	modelValue?: string | string[];
	class?: string;
}

const props = withDefaults(defineProps<ToolbarToggleGroupProps>(), {
	type: 'multiple',
	modelValue: undefined,
});

const emit = defineEmits<{
	'update:modelValue': [value: string | string[]];
}>();

const orientation = inject<{ value: ToolbarOrientation } | undefined>(
	TOOLBAR_ORIENTATION_KEY,
	undefined,
);

const classes = computed(() =>
	cn(toolbarToggleGroupVariants({ orientation: orientation?.value }), props.class),
);

const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		type: props.type,
	};
	if (props.modelValue !== undefined) {
		result.modelValue = props.modelValue;
	}
	return result;
});
</script>
