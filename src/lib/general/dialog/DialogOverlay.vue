<template>
	<DialogOverlay data-slot="dialog-overlay" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DialogOverlay, type DialogOverlayProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { dialogOverlayVariants } from './dialog';

interface Props extends DialogOverlayProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(dialogOverlayVariants(), props.class));
</script>
