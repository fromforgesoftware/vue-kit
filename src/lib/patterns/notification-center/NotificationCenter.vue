<template>
	<!-- Mobile: Dialog (bottom-sheet — Reka Dialog already handles this cleanly,
       unlike Popover which has floating-ui inline styles we'd have to fight). -->
	<Dialog v-if="isMobile" :open="open" @update:open="emit('update:open', $event)">
		<DialogTrigger as-child>
			<slot name="trigger">
				<Button
					data-slot="notification-center-trigger"
					variant="ghost"
					aria-label="Notifications"
					class="relative size-7 p-0 focus-visible:outline-2 focus-visible:outline-primary"
				>
					<Icon :icon="Bell" size="sm" />
					<Badge
						v-if="unreadCount > 0"
						shape="pill"
						class="absolute -top-1 -right-1 size-4 min-h-0 p-0 text-[9px] leading-none"
					>
						{{ unreadCount > 99 ? '99+' : unreadCount }}
					</Badge>
				</Button>
			</slot>
		</DialogTrigger>
		<DialogContent data-slot="notification-center" hide-close-button class="p-0 sm:max-w-[420px]">
			<VisuallyHidden>
				<DialogTitle>Notifications</DialogTitle>
			</VisuallyHidden>
			<NotificationCenterBody
				:variant="variant"
				:tabs="tabs"
				:active-tab="activeTab"
				:items="items"
				:has-more="hasMore"
				:loading="loading"
				@mark-all-read="emit('markAllRead')"
				@update:active-tab="emit('update:activeTab', $event)"
				@item-click="(item) => emit('itemClick', item)"
				@action-click="(item, key) => emit('actionClick', item, key)"
				@load-more="emit('loadMore')"
				@manage-click="emit('manageClick')"
			>
				<template #empty>
					<slot name="empty" />
				</template>
				<template #footer>
					<slot name="footer" />
				</template>
			</NotificationCenterBody>
		</DialogContent>
	</Dialog>

	<!-- Desktop: anchored popover -->
	<PopoverRoot v-else :open="open" @update:open="emit('update:open', $event)">
		<PopoverTrigger as-child>
			<slot name="trigger">
				<Button
					data-slot="notification-center-trigger"
					variant="ghost"
					aria-label="Notifications"
					class="relative size-7 p-0 focus-visible:outline-2 focus-visible:outline-primary"
				>
					<Icon :icon="Bell" size="sm" />
					<Badge
						v-if="unreadCount > 0"
						shape="pill"
						class="absolute -top-1 -right-1 size-4 min-h-0 p-0 text-[9px] leading-none"
					>
						{{ unreadCount > 99 ? '99+' : unreadCount }}
					</Badge>
				</Button>
			</slot>
		</PopoverTrigger>
		<PopoverPortal>
			<PopoverContent
				data-slot="notification-center"
				:side="side"
				:side-offset="8"
				:align="align"
				:class="contentClasses"
			>
				<NotificationCenterBody
					:variant="variant"
					:tabs="tabs"
					:active-tab="activeTab"
					:items="items"
					:has-more="hasMore"
					:loading="loading"
					@mark-all-read="emit('markAllRead')"
					@update:active-tab="emit('update:activeTab', $event)"
					@item-click="(item) => emit('itemClick', item)"
					@action-click="(item, key) => emit('actionClick', item, key)"
					@load-more="emit('loadMore')"
					@manage-click="emit('manageClick')"
				>
					<template #empty>
						<slot name="empty" />
					</template>
					<template #footer>
						<slot name="footer" />
					</template>
				</NotificationCenterBody>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
	PopoverRoot,
	PopoverTrigger,
	PopoverPortal,
	PopoverContent,
	VisuallyHidden,
} from 'reka-ui';
import { Bell } from '@lucide/vue';
import { useResponsive } from '../../../composables/useResponsive.js';
import { cn } from '../../../helpers/cn.js';
import Button from '../../general/button/Button.vue';
import Badge from '../../general/badge/Badge.vue';
import Icon from '../../general/icon/Icon.vue';
import Dialog from '../../general/dialog/Dialog.vue';
import DialogTrigger from '../../general/dialog/DialogTrigger.vue';
import DialogContent from '../../general/dialog/DialogContent.vue';
import DialogTitle from '../../general/dialog/DialogTitle.vue';
import NotificationCenterBody from './NotificationCenterBody.vue';
import {
	notificationCenterContentVariants,
	type NotificationCenterItemData,
	type NotificationCenterTab,
	type NotificationCenterVariant,
} from './notification-center.js';

type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
type PopoverAlign = 'start' | 'center' | 'end';

interface NotificationCenterProps {
	/** Notification items to display */
	items: NotificationCenterItemData[];
	/** Visual variant: 'simple' (no tabs, compact) or 'complex' (with tabs, virtual scroll) */
	variant?: NotificationCenterVariant;
	/** Tab definitions. Only rendered in 'complex' variant. */
	tabs?: NotificationCenterTab[];
	/** Currently active tab value */
	activeTab?: string;
	/** Total unread count shown on the trigger badge */
	unreadCount: number;
	/** Whether more items can be loaded */
	hasMore?: boolean;
	/** Whether items are currently loading */
	loading?: boolean;
	/** Popover open state (v-model) */
	open?: boolean;
	/** Popover placement side */
	side?: PopoverSide;
	/** Popover alignment */
	align?: PopoverAlign;
	/** Custom class for the popover content */
	class?: string;
}

const props = withDefaults(defineProps<NotificationCenterProps>(), {
	variant: 'simple',
	tabs: undefined,
	activeTab: undefined,
	hasMore: false,
	loading: false,
	open: undefined,
	side: 'bottom',
	align: 'end',
});

const emit = defineEmits<{
	'update:activeTab': [value: string];
	'update:open': [value: boolean];
	markAllRead: [];
	itemClick: [item: NotificationCenterItemData];
	actionClick: [item: NotificationCenterItemData, actionKey: string];
	loadMore: [];
	manageClick: [];
}>();

const contentClasses = computed(() =>
	cn(
		'z-50 rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
		'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
		'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
		notificationCenterContentVariants(),
		props.class,
	),
);

const { isMobile } = useResponsive();
</script>
