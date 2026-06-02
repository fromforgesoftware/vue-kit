<template>
	<div data-slot="dialog-header" :class="classes">
		<template v-if="$slots.icon">
			<div class="flex items-start gap-4">
				<div class="shrink-0">
					<slot name="icon" />
				</div>
				<div class="flex min-w-0 flex-col gap-1.5">
					<slot />
				</div>
			</div>
		</template>
		<template v-else>
			<slot />
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { dialogHeaderVariants } from './dialog';

interface Props {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(dialogHeaderVariants(), props.class));
</script>
