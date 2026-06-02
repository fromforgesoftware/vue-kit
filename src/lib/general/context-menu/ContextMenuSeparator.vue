<template>
	<ContextMenuSeparator data-slot="context-menu-separator" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuSeparator } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { contextMenuSeparatorVariants } from './context-menu';

interface ContextMenuSeparatorProps {
	class?: string;
}

const props = defineProps<ContextMenuSeparatorProps>();

const classes = computed(() => cn(contextMenuSeparatorVariants(), props.class));
</script>
