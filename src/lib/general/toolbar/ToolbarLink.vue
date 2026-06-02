<template>
	<ToolbarLink :href="href" :class="classes" data-slot="toolbar-link">
		<slot />
	</ToolbarLink>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { ToolbarLink } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { toolbarLinkVariants, TOOLBAR_SIZE_KEY, type ToolbarSize } from './toolbar';

interface ToolbarLinkProps {
	/** The URL that the link points to. */
	href?: string;
	class?: string;
}

const props = defineProps<ToolbarLinkProps>();

const size = inject<{ value: ToolbarSize } | undefined>(TOOLBAR_SIZE_KEY, undefined);

const classes = computed(() => cn(toolbarLinkVariants({ size: size?.value }), props.class));
</script>
