<template>
	<!-- Collapsed: dropdown on click + tooltip on hover. Nested as-child triggers
       (TooltipTrigger > DropdownMenuTrigger > button) so both pointer events
       reach the same button without one stealing them from the other. -->
	<template v-if="isIconCollapsed">
		<TooltipProvider :delay-duration="0">
			<TooltipRoot>
				<DropdownMenuRoot>
					<TooltipTrigger as-child>
						<RekaDropdownMenuTrigger as-child>
							<Button
								variant="ghost"
								data-slot="sidebar-menu-collapsible-trigger"
								:aria-label="label"
								:class="collapsedButtonClasses"
							>
								<slot name="icon" />
							</Button>
						</RekaDropdownMenuTrigger>
					</TooltipTrigger>
					<DropdownMenuPortal>
						<DropdownMenuContent
							data-slot="sidebar-menu-collapsible-content"
							side="right"
							align="start"
							:side-offset="4"
						>
							<DropdownMenuLabel>{{ label }}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								v-for="item in items"
								:key="item.key"
								data-slot="sidebar-menu-collapsible-item"
								@select="onSelect(item.key)"
							>
								{{ item.label }}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenuPortal>
					<TooltipPortal>
						<TooltipContent
							data-slot="sidebar-menu-collapsible-tooltip"
							side="right"
							:side-offset="8"
							:class="tooltipClasses"
						>
							{{ label }}
						</TooltipContent>
					</TooltipPortal>
				</DropdownMenuRoot>
			</TooltipRoot>
		</TooltipProvider>
	</template>
	<!-- Expanded: collapsible inline submenu -->
	<template v-else>
		<CollapsibleRoot
			v-model:open="isOpen"
			data-slot="sidebar-menu-collapsible"
			class="group/collapsible"
		>
			<CollapsibleTrigger as-child>
				<SidebarMenuButton
					data-slot="sidebar-menu-collapsible-trigger"
					:class="cn($props.class)"
					:close-mobile-on-click="false"
				>
					<slot name="icon" />
					<span>{{ label }}</span>
					<Icon
						:icon="ChevronDown"
						size="sm"
						class="ml-auto transition-transform group-data-[state=closed]/collapsible:-rotate-90"
					/>
				</SidebarMenuButton>
			</CollapsibleTrigger>
			<CollapsibleContent
				data-slot="sidebar-menu-collapsible-content"
				class="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
			>
				<SidebarMenuSub>
					<SidebarMenuSubItem v-for="item in items" :key="item.key">
						<SidebarMenuSubButton
							data-slot="sidebar-menu-collapsible-item"
							:is-active="activeItem === item.key"
							@click="onSelect(item.key)"
						>
							<span>{{ item.label }}</span>
						</SidebarMenuSubButton>
					</SidebarMenuSubItem>
				</SidebarMenuSub>
			</CollapsibleContent>
		</CollapsibleRoot>
	</template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from 'reka-ui';
import {
	DropdownMenuRoot,
	DropdownMenuTrigger as RekaDropdownMenuTrigger,
	DropdownMenuPortal,
	TooltipProvider,
	TooltipRoot,
	TooltipTrigger,
	TooltipPortal,
	TooltipContent,
} from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { useSidebar } from './useSidebar.js';
import { sidebarMenuButtonVariants } from './sidebar.js';
import { tooltipContentVariants } from '../../general/tooltip/tooltip.js';
import SidebarMenuButton from './SidebarMenuButton.vue';
import SidebarMenuSub from './SidebarMenuSub.vue';
import SidebarMenuSubItem from './SidebarMenuSubItem.vue';
import SidebarMenuSubButton from './SidebarMenuSubButton.vue';
import DropdownMenuContent from '../../general/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '../../general/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../../general/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuItem from '../../general/dropdown-menu/DropdownMenuItem.vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { ChevronDown } from '@lucide/vue';

export interface SidebarMenuCollapsibleItem {
	key: string;
	label: string;
}

interface SidebarMenuCollapsibleProps {
	/** Menu items to display in the submenu */
	items: SidebarMenuCollapsibleItem[];
	/** Label shown in the menu button and dropdown header */
	label: string;
	/** Key of the currently active item */
	activeItem?: string;
	/** Whether the collapsible is open by default */
	defaultOpen?: boolean;
	/** Controlled open state */
	open?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<SidebarMenuCollapsibleProps>(), {
	defaultOpen: false,
	open: undefined,
	activeItem: undefined,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
	select: [key: string];
}>();

const { state, collapsible, isMobile } = useSidebar();

const isIconCollapsed = computed(
	() => !isMobile.value && state.value === 'collapsed' && collapsible.value === 'icon',
);

const internalOpen = ref(props.defaultOpen);

const isOpen = computed({
	get: () => props.open ?? internalOpen.value,
	set: (val: boolean) => {
		internalOpen.value = val;
		emit('update:open', val);
	},
});

const collapsedButtonClasses = computed(() =>
	cn(
		sidebarMenuButtonVariants(),
		'!size-8 !p-2 justify-center [&>svg]:size-4 [&>svg]:shrink-0',
		props.class,
	),
);

const tooltipClasses = computed(() => tooltipContentVariants());

function onSelect(key: string) {
	emit('select', key);
}
</script>
