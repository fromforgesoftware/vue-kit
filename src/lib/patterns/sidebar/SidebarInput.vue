<template>
	<Input data-slot="sidebar-input" data-sidebar="input" :class="classes" v-bind="$attrs">
		<template v-for="(_, name) in $slots" #[name]="slotData">
			<slot :name="name" v-bind="slotData ?? {}" />
		</template>
	</Input>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Input from '../../form/input/Input.vue';
import { cn } from '../../../helpers/cn';
import { sidebarInputVariants } from './sidebar';

interface SidebarInputProps {
	class?: string;
}

const props = defineProps<SidebarInputProps>();

const classes = computed(() => cn(sidebarInputVariants(), props.class));
</script>
