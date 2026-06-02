<template>
	<ContextMenuPortal>
		<ContextMenuSubContent
			data-slot="context-menu-sub-content"
			:side-offset="sideOffset"
			:align-offset="alignOffset"
			:loop="loop"
			:class="classes"
		>
			<slot />
		</ContextMenuSubContent>
	</ContextMenuPortal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuSubContent, ContextMenuPortal } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { contextMenuSubContentVariants } from './context-menu';

interface ContextMenuSubContentProps {
	sideOffset?: number;
	alignOffset?: number;
	loop?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<ContextMenuSubContentProps>(), {
	sideOffset: 2,
	alignOffset: -5,
	loop: true,
});

const classes = computed(() => cn(contextMenuSubContentVariants(), props.class));
</script>
