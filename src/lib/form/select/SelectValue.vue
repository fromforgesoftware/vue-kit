<template>
	<!-- Single select -->
	<SelectValue v-if="!multiCtx" data-slot="select-value" :placeholder="placeholder">
		<slot />
	</SelectValue>

	<!-- Multi select: chips + overflow -->
	<template v-else>
		<span
			v-if="multiCtx.modelValue.length > 0"
			data-slot="select-value"
			class="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden"
		>
			<span
				v-for="val in visibleChips"
				:key="val"
				data-slot="select-chip"
				class="inline-flex shrink-0 items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs"
			>
				<slot :value="val">{{ val }}</slot>
				<Button
					variant="ghost"
					size="icon-xs"
					data-slot="select-chip-remove"
					aria-label="Remove"
					class="size-auto rounded-sm bg-transparent p-0 opacity-70 hover:bg-transparent hover:opacity-100"
					@click.stop="multiCtx.toggle(val)"
				>
					<Icon :icon="X" size="xs" />
				</Button>
			</span>
			<span
				v-if="overflowCount > 0"
				data-slot="select-chip-overflow"
				class="shrink-0 text-xs text-muted-foreground"
			>
				+{{ overflowCount }}
			</span>
		</span>
		<span v-else data-slot="select-value" class="text-muted-foreground pointer-events-none">
			{{ placeholder }}
		</span>
	</template>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { SelectValue } from 'reka-ui';
import { X } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { SELECT_MULTI_KEY } from './select.js';

interface SelectValueProps {
	/** Placeholder shown when no value is selected. */
	placeholder?: string;
	/** Max chips to show before displaying +N overflow (multi mode only). Default: 3 */
	maxChips?: number;
}

const props = withDefaults(defineProps<SelectValueProps>(), {
	maxChips: 3,
});

const multiCtx = inject(SELECT_MULTI_KEY, null);

const visibleChips = computed(() => multiCtx?.modelValue.slice(0, props.maxChips) ?? []);
const overflowCount = computed(() =>
	Math.max(0, (multiCtx?.modelValue.length ?? 0) - props.maxChips),
);
</script>
