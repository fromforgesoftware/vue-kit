<template>
	<DropdownMenuPortal>
		<DropdownMenuSubContent
			data-slot="dropdown-menu-sub-content"
			:side-offset="sideOffset"
			:align-offset="alignOffset"
			:loop="loop"
			:class="classes"
		>
			<slot />
		</DropdownMenuSubContent>
	</DropdownMenuPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuSubContent, DropdownMenuPortal } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { dropdownMenuSubContentVariants } from './dropdown-menu';

interface DropdownMenuSubContentProps {
	sideOffset?: number;
	alignOffset?: number;
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<DropdownMenuSubContentProps>(), {
	sideOffset: 2,
	alignOffset: -5,
	loop: true,
});

const classes = computed(() => cn(dropdownMenuSubContentVariants(), props.class));
</script>
