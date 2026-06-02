export { default as SidebarProvider } from './SidebarProvider.vue';
export { default as Sidebar } from './Sidebar.vue';
export { default as SidebarHeader } from './SidebarHeader.vue';
export { default as SidebarContent } from './SidebarContent.vue';
export { default as SidebarFooter } from './SidebarFooter.vue';
export { default as SidebarGroup } from './SidebarGroup.vue';
export { default as SidebarGroupLabel } from './SidebarGroupLabel.vue';
export { default as SidebarGroupContent } from './SidebarGroupContent.vue';
export { default as SidebarMenu } from './SidebarMenu.vue';
export { default as SidebarMenuItem } from './SidebarMenuItem.vue';
export { default as SidebarMenuButton } from './SidebarMenuButton.vue';
export { default as SidebarMenuBadge } from './SidebarMenuBadge.vue';
export { default as SidebarMenuAction } from './SidebarMenuAction.vue';
export { default as SidebarMenuCollapsible } from './SidebarMenuCollapsible.vue';
export { default as SidebarMenuSub } from './SidebarMenuSub.vue';
export { default as SidebarMenuSubItem } from './SidebarMenuSubItem.vue';
export { default as SidebarMenuSubButton } from './SidebarMenuSubButton.vue';
export { default as SidebarCollapsibleHide } from './SidebarCollapsibleHide.vue';
export { default as SidebarCollapsibleShow } from './SidebarCollapsibleShow.vue';
export { default as SidebarSeparator } from './SidebarSeparator.vue';
export { default as SidebarTrigger } from './SidebarTrigger.vue';
export { default as SidebarRail } from './SidebarRail.vue';
export { default as SidebarInput } from './SidebarInput.vue';

export { useSidebar } from './useSidebar.js';

export {
	// Types
	type SidebarCollapsible,
	type SidebarSide,
	type SidebarState,
	type SidebarContext,
	type SidebarMenuButtonSize,
	type SidebarMenuSubButtonSize,
	type SidebarMenuButtonVariants,
	type SidebarMenuSubButtonVariants,
	type SidebarMenuActionVariants,
	// Constants
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_COLLAPSED,
	SIDEBAR_WIDTH_MOBILE,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_KEYBOARD_SHORTCUT,
	SIDEBAR_CONTEXT_KEY,
	// CVA variants
	sidebarProviderVariants,
	sidebarVariants,
	sidebarGapVariants,
	sidebarHeaderVariants,
	sidebarContentVariants,
	sidebarFooterVariants,
	sidebarGroupVariants,
	sidebarGroupLabelVariants,
	sidebarGroupContentVariants,
	sidebarMenuVariants,
	sidebarMenuItemVariants,
	sidebarMenuButtonVariants,
	sidebarMenuBadgeVariants,
	sidebarMenuActionVariants,
	sidebarMenuSubVariants,
	sidebarMenuSubItemVariants,
	sidebarMenuSubButtonVariants,
	sidebarSeparatorVariants,
	sidebarTriggerVariants,
	sidebarRailVariants,
	sidebarInputVariants,
} from './sidebar.js';
