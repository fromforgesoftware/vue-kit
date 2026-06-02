<template>
	<DialogTitle data-slot="dialog-title" :class="classes">
		<slot />
	</DialogTitle>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DialogTitle, type DialogTitleProps } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { dialogTitleVariants } from './dialog.js';

interface Props extends DialogTitleProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(dialogTitleVariants(), props.class));
</script>
