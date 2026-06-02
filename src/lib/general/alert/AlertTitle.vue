<template>
	<h5 data-slot="alert-title" :class="classes">
		<slot />
	</h5>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { alertTitleVariants, type AlertSize } from './alert.js';

interface AlertTitleProps {
	size?: AlertSize;
	class?: string;
}

const props = withDefaults(defineProps<AlertTitleProps>(), {
	size: 'default',
});

const classes = computed(() => cn(alertTitleVariants({ size: props.size }), props.class));
</script>
