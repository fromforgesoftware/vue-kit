<template>
	<SelectTrigger
		:id="id"
		data-slot="select-trigger"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="classes"
	>
		<slot />
		<SelectIcon as-child>
			<Icon
				data-slot="select-trigger-icon"
				:icon="ChevronDown"
				size="sm"
				class="shrink-0 cursor-pointer opacity-50"
				aria-hidden="true"
			/>
		</SelectIcon>
	</SelectTrigger>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { SelectTrigger, SelectIcon } from 'reka-ui';
import { ChevronDown } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { selectTriggerVariants, SELECT_MULTI_KEY, type SelectSize } from './select.js';

interface SelectTriggerProps {
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px (matches Input). */
	size?: SelectSize;
	/** Sets `aria-invalid="true"` and tints the border destructive. */
	error?: boolean;
	/** id of the element(s) describing this trigger — error or hint text. */
	describedBy?: string;
	/** Element id matching the `for` of an associated `<Label>`. */
	id?: string;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<SelectTriggerProps>(), {
	size: 'default',
	error: false,
});

const multiCtx = inject(SELECT_MULTI_KEY, null);

// Multi-select chips need to flex-wrap and grow vertically — switch off the
// fixed height set by the `size` variant when chips are present.
const classes = computed(() =>
	cn(
		selectTriggerVariants({ size: props.size }),
		multiCtx ? 'h-auto min-h-9 flex-wrap gap-1 py-1' : '',
		props.class,
	),
);
</script>
