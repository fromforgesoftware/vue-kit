<template>
	<DropdownMenuSeparator data-slot="dropdown-menu-separator" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuSeparator } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { dropdownMenuSeparatorVariants } from './dropdown-menu';

interface DropdownMenuSeparatorProps {
	class?: string;
}

const props = defineProps<DropdownMenuSeparatorProps>();

const classes = computed(() => cn(dropdownMenuSeparatorVariants(), props.class));
</script>
