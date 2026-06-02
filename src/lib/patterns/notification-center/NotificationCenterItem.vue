<template>
	<div data-slot="notification-center-item" :class="classes" @click="emit('click', item)">
		<!-- Left: Avatar or Icon -->
		<div class="shrink-0 pt-0.5">
			<Avatar v-if="item.avatar" :src="item.avatar.src" :name="item.avatar.name" size="sm" />
			<div
				v-else
				:class="
					cn(
						'flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground',
						item.iconClass,
					)
				"
			>
				<Icon :icon="item.icon ?? Bell" size="sm" />
			</div>
		</div>

		<!-- Center: Content -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<span class="font-medium text-sm text-foreground truncate">{{ item.subject }}</span>
				<Badge
					v-if="item.badge"
					:variant="item.badge.variant ?? 'secondary'"
					class="text-[10px] shrink-0"
				>
					{{ item.badge.label }}
				</Badge>
			</div>

			<p v-if="item.body" class="text-sm text-muted-foreground line-clamp-2 mt-0.5">
				{{ item.body }}
			</p>

			<!-- Attachment chip -->
			<div
				v-if="item.attachment"
				class="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground"
			>
				<Icon :icon="Paperclip" size="xs" />
				<span>{{ item.attachment.label }}</span>
				<span v-if="item.attachment.size" class="text-muted-foreground">
					({{ item.attachment.size }})
				</span>
			</div>

			<!-- Action buttons -->
			<NotificationCenterActions
				v-if="item.actions?.length"
				:actions="item.actions"
				class="mt-2"
				@action="(key) => emit('actionClick', item, key)"
			/>
		</div>

		<!-- Right: Timestamp + unread dot -->
		<div class="shrink-0 flex flex-col items-end gap-1 pt-0.5">
			<span class="text-xs text-muted-foreground whitespace-nowrap">{{ item.relativeTime }}</span>
			<div v-if="!item.isRead" class="size-2 rounded-full bg-primary" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bell, Paperclip } from '@lucide/vue';
import { cn } from '../../../helpers/cn';
import Avatar from '../../general/avatar/Avatar.vue';
import Badge from '../../general/badge/Badge.vue';
import Icon from '../../general/icon/Icon.vue';
import NotificationCenterActions from './NotificationCenterActions.vue';
import {
	notificationCenterItemVariants,
	type NotificationCenterItemData,
} from './notification-center';

interface NotificationCenterItemProps {
	item: NotificationCenterItemData;
	class?: string;
}

const props = defineProps<NotificationCenterItemProps>();

const emit = defineEmits<{
	click: [item: NotificationCenterItemData];
	actionClick: [item: NotificationCenterItemData, actionKey: string];
}>();

const classes = computed(() =>
	cn(
		notificationCenterItemVariants({
			isRead: props.item.isRead,
			accent: props.item.accent ?? false,
		}),
		props.class,
	),
);
</script>
