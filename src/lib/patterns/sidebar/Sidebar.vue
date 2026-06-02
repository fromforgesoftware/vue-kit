<template>
	<!--
    Mobile: Reka Dialog primitives provide focus trap, focus-restore on close,
    escape-to-close, scroll lock, role="dialog" + aria-modal="true". The drawer
    is labelled by a visually-hidden DialogTitle so screen readers announce it
    as "Main navigation".
  -->
	<template v-if="isMobile">
		<DialogRoot :open="openMobile" @update:open="setOpenMobile">
			<DialogPortal>
				<DialogOverlay
					data-slot="sidebar-overlay"
					class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
				/>
				<DialogContent
					:id="drawerId"
					data-slot="sidebar"
					data-sidebar="sidebar"
					data-mobile="true"
					:data-side="side"
					aria-label="Main navigation"
					:style="{ width: SIDEBAR_WIDTH_MOBILE }"
					:class="
						cn(
							'fixed inset-y-0 z-50 flex h-svh flex-col bg-sidebar p-0 text-sidebar-foreground outline-none',
							'data-[state=open]:animate-in data-[state=closed]:animate-out duration-200',
							side === 'left'
								? 'left-0 border-r border-sidebar-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
								: 'right-0 border-l border-sidebar-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
							props.class,
						)
					"
				>
					<VisuallyHidden>
						<DialogTitle>Main navigation</DialogTitle>
					</VisuallyHidden>
					<slot />
				</DialogContent>
			</DialogPortal>
		</DialogRoot>
	</template>
	<!-- Desktop: inline sidebar -->
	<template v-else>
		<aside
			data-slot="sidebar"
			data-sidebar="sidebar"
			:data-side="side"
			:data-collapsible="state === 'collapsed' ? collapsible : ''"
			:data-state="state"
			:class="sidebarClasses"
			:style="desktopStyle"
		>
			<TooltipProvider :delay-duration="0">
				<div class="flex h-full w-full flex-col overflow-hidden">
					<slot />
				</div>
			</TooltipProvider>
		</aside>
	</template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
	DialogRoot,
	DialogPortal,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	VisuallyHidden,
} from 'reka-ui';
import TooltipProvider from '../../general/tooltip/TooltipProvider.vue';
import { cn } from '../../../helpers/cn';
import { useSidebar, SIDEBAR_DRAWER_ID } from './useSidebar';
import {
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_COLLAPSED,
	SIDEBAR_WIDTH_MOBILE,
	sidebarVariants,
} from './sidebar';

interface SidebarProps {
	class?: string;
}

const props = defineProps<SidebarProps>();

const { state, openMobile, setOpenMobile, isMobile, collapsible, side } = useSidebar();

const drawerId = SIDEBAR_DRAWER_ID;

const sidebarClasses = computed(() =>
	cn('group/sidebar', sidebarVariants({ side: side.value }), props.class),
);

const resolvedWidth = computed(() => {
	if (state.value === 'collapsed') {
		return collapsible.value === 'offcanvas' ? '0px' : SIDEBAR_WIDTH_COLLAPSED;
	}
	return SIDEBAR_WIDTH;
});

const desktopStyle = computed(() => ({
	width: resolvedWidth.value,
	minWidth: resolvedWidth.value,
	maxWidth: resolvedWidth.value,
}));
</script>
