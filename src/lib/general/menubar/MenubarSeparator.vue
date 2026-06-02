<template>
	<MenubarSeparator data-slot="menubar-separator" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarSeparator } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { menubarSeparatorVariants } from './menubar.js';

interface MenubarSeparatorProps {
	class?: string;
}

const props = defineProps<MenubarSeparatorProps>();

const classes = computed(() => cn(menubarSeparatorVariants(), props.class));
</script>
