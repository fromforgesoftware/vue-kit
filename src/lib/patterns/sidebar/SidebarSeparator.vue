<template>
	<Divider v-if="!isIconCollapsed" data-slot="sidebar-separator" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Divider from '../../general/divider/Divider.vue';
import { cn } from '../../../helpers/cn';
import { useSidebar } from './useSidebar';
import { sidebarSeparatorVariants } from './sidebar';

interface SidebarSeparatorProps {
	class?: string;
}

const props = defineProps<SidebarSeparatorProps>();

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() => cn(sidebarSeparatorVariants(), props.class));
</script>
