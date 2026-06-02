<template>
	<!-- Header -->
	<div data-slot="notification-center-header" :class="headerClasses">
		<h3 class="text-sm font-semibold text-foreground">Notifications</h3>
		<Button
			data-slot="notification-center-mark-read"
			variant="link"
			size="sm"
			class="h-auto p-0 text-xs focus-visible:outline-2 focus-visible:outline-primary"
			@click="emit('markAllRead')"
		>
			Mark all as read
		</Button>
	</div>

	<!-- Panel variant: tabs + list -->
	<template v-if="showTabs">
		<Tabs
			:model-value="activeTab ?? tabs![0]?.value"
			variant="underlined"
			@update:model-value="emit('update:activeTab', String($event))"
		>
			<TabsList class="w-full justify-start px-4 shrink-0">
				<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
					{{ tab.label }}
					<Badge
						v-if="tab.count != null && tab.count > 0"
						variant="secondary"
						class="ml-1.5 text-[10px]"
					>
						{{ tab.count }}
					</Badge>
				</TabsTrigger>
				<TabsIndicator />
			</TabsList>

			<TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="mt-0">
				<NotificationCenterList
					:items="items"
					:has-more="hasMore"
					:loading="loading"
					@item-click="(item) => emit('itemClick', item)"
					@action-click="(item, key) => emit('actionClick', item, key)"
					@load-more="emit('loadMore')"
				>
					<template #empty>
						<slot name="empty" />
					</template>
				</NotificationCenterList>
			</TabsContent>
		</Tabs>
	</template>

	<!-- Simple variant (default): direct list, no tabs -->
	<template v-else>
		<NotificationCenterList
			:items="items"
			:has-more="hasMore"
			:loading="loading"
			@item-click="(item) => emit('itemClick', item)"
			@action-click="(item, key) => emit('actionClick', item, key)"
			@load-more="emit('loadMore')"
		>
			<template #empty>
				<slot name="empty" />
			</template>
		</NotificationCenterList>
	</template>

	<!-- Footer -->
	<div data-slot="notification-center-footer" :class="footerClasses">
		<slot name="footer">
			<Button
				data-slot="notification-center-manage"
				variant="link"
				size="sm"
				class="h-auto p-0 text-xs text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary"
				@click="emit('manageClick')"
			>
				{{ footerLabel }}
			</Button>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import Button from '../../general/button/Button.vue';
import Badge from '../../general/badge/Badge.vue';
import Tabs from '../../general/tabs/Tabs.vue';
import TabsList from '../../general/tabs/TabsList.vue';
import TabsTrigger from '../../general/tabs/TabsTrigger.vue';
import TabsContent from '../../general/tabs/TabsContent.vue';
import TabsIndicator from '../../general/tabs/TabsIndicator.vue';
import NotificationCenterList from './NotificationCenterList.vue';
import {
	notificationCenterHeaderVariants,
	notificationCenterFooterVariants,
	type NotificationCenterItemData,
	type NotificationCenterTab,
	type NotificationCenterVariant,
} from './notification-center.js';

interface Props {
	variant?: NotificationCenterVariant;
	tabs?: NotificationCenterTab[];
	activeTab?: string;
	items: NotificationCenterItemData[];
	hasMore?: boolean;
	loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'simple',
	tabs: undefined,
	activeTab: undefined,
	hasMore: false,
	loading: false,
});

const emit = defineEmits<{
	'update:activeTab': [value: string];
	markAllRead: [];
	itemClick: [item: NotificationCenterItemData];
	actionClick: [item: NotificationCenterItemData, actionKey: string];
	loadMore: [];
	manageClick: [];
}>();

const showTabs = computed(() => props.variant === 'complex' && !!props.tabs?.length);
const headerClasses = computed(() => cn(notificationCenterHeaderVariants()));
const footerClasses = computed(() => cn(notificationCenterFooterVariants()));
const footerLabel = computed(() => (showTabs.value ? 'All notifications' : 'All notifications'));
</script>
