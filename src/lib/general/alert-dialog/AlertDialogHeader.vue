<template>
	<div data-slot="alert-dialog-header" :class="classes">
		<slot v-if="hasIcon" name="icon" />
		<div class="flex flex-col gap-1">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { cn } from '../../../helpers/cn';
import { alertDialogHeaderVariants } from './alert-dialog';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const slots = useSlots();

const hasIcon = computed(() => !!slots.icon);

const classes = computed(() => cn(alertDialogHeaderVariants(), props.class));
</script>
