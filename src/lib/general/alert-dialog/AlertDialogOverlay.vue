<template>
	<AlertDialogOverlay data-slot="alert-dialog-overlay" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertDialogOverlay, type AlertDialogOverlayProps } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { alertDialogOverlayVariants } from './alert-dialog.js';

interface Props extends AlertDialogOverlayProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(alertDialogOverlayVariants(), props.class));
</script>
