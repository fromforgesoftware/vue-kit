<template>
	<h2 :id="titleId" data-slot="drawer-title" :class="classes">
		<slot />
	</h2>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount } from 'vue';
import { cn } from '../../../helpers/cn';
import { drawerTitleVariants, drawerPanelKey } from './drawer';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn(drawerTitleVariants(), props.class));

// Register with the surrounding DrawerPanel so it can switch from `aria-label`
// to `aria-labelledby`. Falls back gracefully when used standalone.
const panelCtx = inject(drawerPanelKey, null);
const titleId = computed(() => panelCtx?.titleId);

onMounted(() => panelCtx?.registerTitle());
onBeforeUnmount(() => panelCtx?.unregisterTitle());
</script>
