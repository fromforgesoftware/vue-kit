<template>
	<div data-slot="drawer-body" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { drawerBodyVariants } from './drawer';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn(drawerBodyVariants(), props.class));
</script>
