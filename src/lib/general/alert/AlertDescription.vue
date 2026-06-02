<template>
	<div data-slot="alert-description" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { alertDescriptionVariants, type AlertSize } from './alert.js';

interface AlertDescriptionProps {
	size?: AlertSize;
	class?: string;
}

const props = withDefaults(defineProps<AlertDescriptionProps>(), {
	size: 'default',
});

const classes = computed(() => cn(alertDescriptionVariants({ size: props.size }), props.class));
</script>
