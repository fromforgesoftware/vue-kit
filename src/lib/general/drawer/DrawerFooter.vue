<template>
	<div data-slot="drawer-footer" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { drawerFooterVariants } from './drawer.js';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn(drawerFooterVariants(), props.class));
</script>
