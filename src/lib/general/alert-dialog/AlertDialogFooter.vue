<template>
	<div data-slot="alert-dialog-footer" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { alertDialogFooterVariants } from './alert-dialog.js';

interface Props {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(alertDialogFooterVariants(), props.class));
</script>
