<template>
	<div data-slot="drawer-header" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { drawerHeaderVariants } from './drawer';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn(drawerHeaderVariants(), props.class));
</script>
