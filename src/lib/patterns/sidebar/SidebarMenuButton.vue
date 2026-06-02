<template>
	<!-- With tooltip when collapsed (desktop only) -->
	<Tooltip
		v-if="showTooltip"
		:content="tooltipText"
		:side="tooltipSide"
		:delay-duration="0"
		:side-offset="8"
	>
		<Primitive
			:as-child="asChild"
			:as="asChild ? undefined : 'button'"
			data-slot="sidebar-menu-button"
			data-sidebar="menu-button"
			:data-size="size"
			:data-active="isActive"
			:class="classes"
			v-bind="attrs"
		>
			<slot />
		</Primitive>
	</Tooltip>

	<!-- Without tooltip (expanded or mobile) -->
	<Primitive
		v-else
		:as-child="asChild"
		:as="asChild ? undefined : 'button'"
		data-slot="sidebar-menu-button"
		data-sidebar="menu-button"
		:data-size="size"
		:data-active="isActive"
		:class="classes"
		v-bind="attrs"
		@click="isMobile && closeMobileOnClick && setOpenMobile(false)"
	>
		<slot />
	</Primitive>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Primitive } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import Tooltip from '../../general/tooltip/Tooltip.vue';
import { useSidebar } from './useSidebar';
import { sidebarMenuButtonVariants, type SidebarMenuButtonSize } from './sidebar';

interface SidebarMenuButtonProps {
	asChild?: boolean;
	isActive?: boolean;
	size?: SidebarMenuButtonSize;
	tooltip?: string | { content: string; side?: 'top' | 'right' | 'bottom' | 'left' };
	closeMobileOnClick?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<SidebarMenuButtonProps>(), {
	asChild: false,
	isActive: false,
	size: 'default',
	tooltip: undefined,
	closeMobileOnClick: true,
});

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

const { state, collapsible, isMobile, setOpenMobile } = useSidebar();

const isIconCollapsed = computed(
	() => !isMobile.value && state.value === 'collapsed' && collapsible.value === 'icon',
);

const showTooltip = computed(() => isIconCollapsed.value && !!props.tooltip);

const tooltipText = computed(() =>
	typeof props.tooltip === 'string' ? props.tooltip : props.tooltip?.content,
);

const tooltipSide = computed(() =>
	typeof props.tooltip === 'string' ? 'right' : (props.tooltip?.side ?? 'right'),
);

const classes = computed(() =>
	cn(
		sidebarMenuButtonVariants({ size: props.size }),
		isIconCollapsed.value &&
			'w-8 h-8 p-2 justify-center [&>span]:hidden [&>div]:hidden [&>svg~svg]:hidden',
		props.class,
	),
);
</script>
