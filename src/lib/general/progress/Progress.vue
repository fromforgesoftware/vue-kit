<template>
	<ProgressRoot
		data-slot="progress"
		:model-value="indeterminate ? null : (modelValue ?? 0)"
		:get-value-label="getValueLabel"
		:class="rootClasses"
	>
		<ProgressIndicator
			data-slot="progress-indicator"
			:class="indicatorClasses"
			:style="indicatorStyle"
		/>
	</ProgressRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ProgressIndicator, ProgressRoot, type ProgressRootProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { progressVariants, progressIndicatorVariants, type ProgressVariants } from './progress';

interface Props extends /* @vue-ignore */ ProgressRootProps {
	modelValue?: number | null;
	size?: ProgressVariants['size'];
	variant?: ProgressVariants['variant'];
	/** Render an indeterminate animation; ignores `modelValue`. */
	indeterminate?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	size: 'default',
	variant: 'default',
	indeterminate: false,
});

// Progressbars require an accessible name (axe: aria-progressbar-name). Reka
// derives `aria-label` from `getValueLabel(value, max)`. The default
// implementation returns "<percent>%" for determinate progress but `undefined`
// for indeterminate (when modelValue is null), which strips the accessible
// name. Provide our own resolver that falls back to a generic "Progress"
// label for the indeterminate case while preserving the percent label for
// determinate values.
function getValueLabel(value: number | null | undefined, max: number): string {
	if (typeof value === 'number') return `${Math.round((value / max) * 100)}%`;
	return 'Progress';
}

const rootClasses = computed(() =>
	cn(progressVariants({ size: props.size, variant: props.variant }), props.class),
);

const indicatorClasses = computed(() =>
	cn(progressIndicatorVariants({ variant: props.variant, indeterminate: props.indeterminate })),
);

const indicatorStyle = computed(() => {
	if (props.indeterminate) return undefined;
	return { transform: `translateX(-${100 - (props.modelValue ?? 0)}%)` };
});
</script>

<style>
@keyframes progress-indeterminate-anim {
	0% {
		transform: translateX(-100%);
	}
	50% {
		transform: translateX(0%);
	}
	100% {
		transform: translateX(100%);
	}
}

.progress-indeterminate {
	animation: progress-indeterminate-anim 1.4s ease-in-out infinite;
}
</style>
