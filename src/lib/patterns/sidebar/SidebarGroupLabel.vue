<template>
	<!-- Collapsed: ellipsis icon -->
	<Primitive
		v-if="isIconCollapsed"
		:as-child="asChild"
		:as="asChild ? undefined : 'div'"
		data-slot="sidebar-group-label"
		:class="classes"
	>
		<slot name="collapsed">
			<Icon :icon="Ellipsis" size="sm" class="text-sidebar-foreground/40" />
		</slot>
	</Primitive>

	<!-- Expanded: normal label -->
	<Primitive
		v-else
		:as-child="asChild"
		:as="asChild ? undefined : 'div'"
		data-slot="sidebar-group-label"
		:class="classes"
	>
		<slot />
	</Primitive>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Ellipsis } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { Primitive } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { useSidebar } from './useSidebar';
import { sidebarGroupLabelVariants } from './sidebar';

interface SidebarGroupLabelProps {
	asChild?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<SidebarGroupLabelProps>(), {
	asChild: false,
});

const { state, collapsible } = useSidebar();

const isIconCollapsed = computed(() => state.value === 'collapsed' && collapsible.value === 'icon');

const classes = computed(() =>
	cn(
		sidebarGroupLabelVariants(),
		isIconCollapsed.value && 'justify-center px-0 cursor-pointer',
		props.class,
	),
);
</script>
