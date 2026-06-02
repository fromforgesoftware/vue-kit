<template>
	<div :class="classes" data-slot="activity-timeline">
		<div
			v-for="(group, groupIndex) in groups"
			:key="group.title"
			:class="groupClasses"
			data-slot="activity-timeline-group"
		>
			<h3 v-if="group.title" class="text-lg font-semibold text-foreground mb-2">
				{{ group.title }}
			</h3>

			<div class="flex flex-col relative">
				<div class="absolute left-3 top-0 bottom-0 w-px bg-border/50" />

				<template v-for="(activityItem, itemIndex) in group.items" :key="activityItem.id">
					<template v-if="activityItem.type === 'expandable_group'">
						<template v-if="isExpanded(activityItem.id)">
							<template v-for="subItem in activityItem.collapsedItems" :key="subItem.id">
								<ActivityTimelineItemComponent
									:item="subItem"
									:icon-classes="iconClasses"
									:item-classes="itemClasses"
									:get-icon-component="getIconComponent"
									:get-icon-color="getIconColor"
									:is-attribute-expanded="isAttributeExpanded"
									:toggle-attribute-expansion="toggleAttributeExpansion"
								/>
							</template>
						</template>

						<div class="flex gap-4 relative py-2 group ml-8">
							<div
								class="absolute -left-5 -top-4 w-5 h-8 border-b border-l border-border/50 rounded-bl-xl"
							/>
							<Button
								variant="ghost"
								size="sm"
								data-slot="activity-timeline-expand"
								:aria-expanded="isExpanded(activityItem.id)"
								:aria-label="
									(isExpanded(activityItem.id) ? 'Hide ' : 'Show ') +
									(activityItem.collapsedItems?.length || 0) +
									' items'
								"
								class="min-h-6 px-1 -mx-1 py-0 text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium"
								@click="toggleGroup(activityItem.id)"
							>
								<Icon :icon="ChevronsUpDown" size="sm" class="mr-1" />
								{{ isExpanded(activityItem.id) ? 'Hide' : 'Show' }}
								{{ activityItem.collapsedItems?.length || 0 }}
								{{ isExpanded(activityItem.id) ? 'items' : 'more items' }}
							</Button>
						</div>
					</template>

					<template v-else>
						<ActivityTimelineItemComponent
							:item="activityItem"
							:icon-classes="iconClasses"
							:item-classes="itemClasses"
							:get-icon-component="getIconComponent"
							:get-icon-color="getIconColor"
							:is-attribute-expanded="isAttributeExpanded"
							:toggle-attribute-expansion="toggleAttributeExpansion"
							:is-next-expandable="
								group.items[itemIndex + 1]?.type === 'expandable_group' &&
								!isExpanded(group.items[itemIndex + 1].id)
							"
						/>
					</template>
				</template>

				<div
					v-if="groupIndex === groups.length - 1 && (hasMore || loading || endLabel)"
					data-slot="activity-timeline-footer"
					class="flex gap-4 relative py-2 ml-8"
				>
					<div
						class="absolute -left-5 -top-4 w-5 h-8 border-b border-l border-border/50 rounded-bl-xl"
					/>
					<div v-if="loading" class="flex items-center gap-2 text-sm text-muted-foreground">
						<Spinner size="sm" />
						<span>{{ loadingLabel }}</span>
					</div>
					<Button
						v-else-if="hasMore"
						variant="ghost"
						size="sm"
						data-slot="activity-timeline-load-more"
						class="min-h-6 px-1 -mx-1 py-0 text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium"
						@click="emit('loadMore')"
					>
						<Icon :icon="ChevronsDown" size="sm" class="mr-1" />
						{{ loadMoreLabel }}
					</Button>
					<div v-else-if="endLabel" class="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Icon :icon="CircleCheck" size="sm" />
						<span>{{ endLabel }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
	ArrowRight,
	Plus,
	GitMerge,
	Calendar,
	ChevronDown,
	ChevronsUpDown,
	ChevronsDown,
	CircleCheck,
	MessageCircle,
	Activity,
	Mail,
	Pencil,
	ToggleRight,
	Briefcase,
} from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import Avatar from '../../general/avatar/Avatar.vue';
import Button from '../../general/button/Button.vue';
import Spinner from '../../general/spinner/Spinner.vue';
import {
	activityTimelineVariants,
	activityTimelineGroupVariants,
	activityTimelineItemVariants,
	activityTimelineIconVariants,
	type ActivityItem,
	type ActivityGroup,
	type ActivityType,
} from './activity-timeline';

interface ActivityTimelineProps {
	/** Grouped activity items. */
	groups: ActivityGroup[];
	/** Whether more pages exist. When true, a "Load more" button is rendered at the bottom. */
	hasMore?: boolean;
	/** Whether a load is in progress. Replaces the button with a spinner. */
	loading?: boolean;
	/** Label for the load-more button. */
	loadMoreLabel?: string;
	/** Label shown next to the spinner while loading. */
	loadingLabel?: string;
	/** Footer text shown when there are entries but no more pages. Pass empty string to hide. */
	endLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<ActivityTimelineProps>(), {
	hasMore: false,
	loading: false,
	loadMoreLabel: 'Load more',
	loadingLabel: 'Loading…',
	endLabel: 'End of activity.',
});

const emit = defineEmits<{ loadMore: [] }>();

const classes = computed(() => cn(activityTimelineVariants(), props.class));
const groupClasses = computed(() => cn(activityTimelineGroupVariants()));
const itemClasses = computed(() => cn(activityTimelineItemVariants()));
const iconClasses = computed(() => cn(activityTimelineIconVariants()));

const expandedItems = ref<Set<string>>(new Set());
const expandedAttributes = ref<Set<string>>(new Set());

function toggleGroup(id: string): void {
	const newSet = new Set(expandedItems.value);
	if (newSet.has(id)) {
		newSet.delete(id);
	} else {
		newSet.add(id);
	}
	expandedItems.value = newSet;
}

function toggleAttributeExpansion(id: string): void {
	const newSet = new Set(expandedAttributes.value);
	if (newSet.has(id)) {
		newSet.delete(id);
	} else {
		newSet.add(id);
	}
	expandedAttributes.value = newSet;
}

function isExpanded(id: string): boolean {
	return expandedItems.value.has(id);
}

function isAttributeExpanded(id: string): boolean {
	return expandedAttributes.value.has(id);
}

function getIconComponent(type: ActivityType) {
	switch (type) {
		case 'status_change':
			return ToggleRight;
		case 'email':
			return Mail;
		case 'attribute_change':
			return Pencil;
		case 'add_to_list':
			return Plus;
		case 'assignment':
			return Briefcase;
		case 'merge':
			return GitMerge;
		case 'calendar_event':
			return Calendar;
		case 'comment':
			return MessageCircle;
		default:
			return Activity;
	}
}

function getIconColor(type: ActivityType): string {
	switch (type) {
		case 'status_change':
			return 'text-warning';
		case 'email':
			return 'text-info';
		case 'attribute_change':
			return 'text-accent-foreground';
		case 'add_to_list':
			return 'text-success';
		case 'assignment':
			return 'text-info';
		case 'merge':
			return 'text-accent-foreground';
		case 'calendar_event':
			return 'text-info';
		case 'comment':
			return 'text-success';
		default:
			return 'text-muted-foreground';
	}
}
</script>

<script lang="ts">
import { defineComponent, h, type PropType, type Component, type VNode } from 'vue';

interface ActivityTimelineItemProps {
	item: ActivityItem;
	iconClasses: string;
	itemClasses: string;
	getIconComponent: (type: ActivityType) => unknown;
	getIconColor: (type: ActivityType) => string;
	isAttributeExpanded: (id: string) => boolean;
	toggleAttributeExpansion: (id: string) => void;
	isNextExpandable?: boolean;
}

const ActivityTimelineItemComponent = defineComponent({
	name: 'ActivityTimelineItemComponent',
	props: {
		item: {
			type: Object as PropType<ActivityItem>,
			required: true,
		},
		iconClasses: {
			type: String,
			required: true,
		},
		itemClasses: {
			type: String,
			required: true,
		},
		getIconComponent: {
			type: Function as PropType<(type: ActivityType) => unknown>,
			required: true,
		},
		getIconColor: {
			type: Function as PropType<(type: ActivityType) => string>,
			required: true,
		},
		isAttributeExpanded: {
			type: Function as PropType<(id: string) => boolean>,
			required: true,
		},
		toggleAttributeExpansion: {
			type: Function as PropType<(id: string) => void>,
			required: true,
		},
		isNextExpandable: {
			type: Boolean,
			default: false,
		},
	},
	setup(props) {
		return (): VNode => {
			const IconComponent = props.getIconComponent(props.item.type);
			const iconColor = props.getIconColor(props.item.type);

			return h(
				'div',
				{
					class: props.itemClasses,
					'data-slot': 'activity-timeline-item',
					'data-activity-type': props.item.type,
				},
				[
					// Icon Column
					h('div', { class: 'relative z-10 flex flex-col items-center shrink-0' }, [
						h('div', { class: props.iconClasses }, [
							h(Icon, { icon: IconComponent as Component, size: 'xs', class: iconColor }),
						]),
					]),

					// Content Column. The content body is whatever the type's
					// render branch produces; if the item also carries `actions`,
					// render a compact button row below it. Actions are kept here
					// (rather than inside each branch) so every `ActivityType`
					// gets the same opt-in treatment with zero per-branch work.
					h('div', { class: cn('flex-1 min-w-0 pt-0.5', props.isNextExpandable && 'pb-4') }, [
						renderContent(props),
						renderActions(props.item as ActivityItem),
					]),
				],
			);
		};

		function renderActions(item: ActivityItem) {
			const actions = item.actions;
			if (!actions || actions.length === 0) return null;
			return h(
				'div',
				{
					class: 'flex items-center gap-2 mt-2',
					'data-slot': 'activity-timeline-actions',
				},
				actions.map((a) =>
					h(
						Button,
						{
							size: 'sm',
							variant: a.variant ?? 'outline',
							onClick: a.onClick,
							class: 'h-7 text-xs',
						},
						() => [a.icon ? h(a.icon, { class: 'size-3.5 mr-1' }) : null, a.label],
					),
				),
			);
		}

		function renderContent(props: ActivityTimelineItemProps) {
			const item = props.item as ActivityItem;

			switch (item.type) {
				case 'status_change':
					return h('div', { class: 'flex items-center gap-2 text-sm flex-wrap' }, [
						item.user &&
							h(Avatar, {
								class: 'size-5 text-[10px]',
								src: item.user.avatarUrl,
								name: item.user.name,
							}),
						h('span', { class: 'font-medium text-foreground' }, item.user?.name),
						h('span', { class: 'text-muted-foreground' }, 'has changed Status to'),
						h('div', { class: 'flex items-center gap-1 text-success font-medium' }, [
							h('div', { class: 'size-1.5 rounded-full bg-success' }),
							item.meta?.value,
						]),
						h(
							'span',
							{
								class: 'text-muted-foreground ml-auto sm:ml-0',
								title: item.timestampTooltip,
							},
							item.timestamp,
						),
					]);

				case 'email':
					return h(
						'div',
						{ class: 'rounded-lg border border-border bg-card p-4 shadow-sm relative z-10' },
						[
							h('div', { class: 'font-medium text-foreground mb-1' }, item.title),
							h('div', { class: 'flex items-center gap-2 text-sm text-muted-foreground mb-2' }, [
								h(
									'div',
									{ class: 'flex -space-x-2' },
									item.users?.map((u) =>
										h(Avatar, {
											class: 'size-5 ring-2 ring-background text-[10px]',
											src: u.avatarUrl,
											name: u.name,
										}),
									),
								),
								h(
									'span',
									{ class: 'text-foreground font-medium' },
									item.users
										?.slice(0, 2)
										.map((u) => u.name)
										.join(', '),
								),
								h('span', { title: item.timestampTooltip }, item.timestamp),
							]),
							h('p', { class: 'text-sm text-muted-foreground line-clamp-2' }, item.description),
						],
					);

				case 'attribute_change':
					return h('div', { class: 'flex flex-col gap-2' }, [
						h('div', { class: 'flex items-center gap-2 text-sm flex-wrap' }, [
							item.user &&
								h(Avatar, {
									class: 'size-5 text-[10px]',
									src: item.user.avatarUrl,
									name: item.user.name,
								}),
							h('span', { class: 'font-medium text-foreground' }, item.user?.name),
							h('span', { class: 'text-muted-foreground' }, 'has changed'),
							h(
								'button',
								{
									type: 'button',
									class:
										'inline-flex items-center gap-1 cursor-pointer rounded-sm bg-transparent border-0 p-0 m-0 appearance-none ' +
										'font-medium text-foreground hover:text-primary ' +
										'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
									'data-slot': 'activity-timeline-attribute-toggle',
									'aria-expanded': props.isAttributeExpanded(item.id),
									onClick: () => props.toggleAttributeExpansion(item.id),
								},
								[
									h('span', {}, `${item.meta?.count} attributes`),
									h(Icon, {
										icon: ChevronDown,
										size: 'xs',
										class: cn(
											'text-muted-foreground transition-transform',
											props.isAttributeExpanded(item.id) && 'rotate-180',
										),
									}),
								],
							),
							h(
								'span',
								{
									class: 'text-muted-foreground ml-auto sm:ml-0',
									title: item.timestampTooltip,
								},
								item.timestamp,
							),
						]),
						props.isAttributeExpanded(item.id) &&
							item.attributeChanges &&
							h(
								'div',
								{ class: 'ml-7 flex flex-col gap-1 text-sm' },
								item.attributeChanges.map((change) =>
									h('div', { class: 'flex items-center gap-2 text-muted-foreground' }, [
										h('span', { class: 'font-medium text-foreground' }, `${change.attribute}:`),
										h('span', { class: 'line-through' }, change.oldValue),
										h(Icon, { icon: ArrowRight, size: 'xs' }),
										h('span', { class: 'text-foreground' }, change.newValue),
									]),
								),
							),
					]);

				case 'assignment':
					return h('div', { class: 'flex items-center gap-2 text-sm flex-wrap' }, [
						item.user &&
							h(Avatar, {
								class: 'size-5 text-[10px]',
								src: item.user.avatarUrl,
								name: item.user.name,
							}),
						h('span', { class: 'font-medium text-foreground' }, item.user?.name),
						h('span', { class: 'text-muted-foreground' }, item.title || 'assigned'),
						item.meta?.value &&
							h(
								'span',
								{
									class:
										'inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground',
								},
								item.meta.value,
							),
						item.meta?.badge &&
							h('span', { class: 'text-muted-foreground' }, item.meta.label || 'effective'),
						item.meta?.badge &&
							h(
								'span',
								{
									class:
										'inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground',
								},
								item.meta.badge,
							),
						h(
							'span',
							{
								class: 'text-muted-foreground/70 ml-auto sm:ml-0',
								title: item.timestampTooltip,
							},
							`· ${item.timestamp}`,
						),
					]);

				case 'comment':
					return h('div', { class: 'flex flex-col gap-2' }, [
						h('div', { class: 'flex items-center gap-2 text-sm' }, [
							item.user &&
								h(Avatar, {
									class: 'size-5 text-[10px]',
									src: item.user.avatarUrl,
									name: item.user.name,
								}),
							h('span', { class: 'font-medium text-foreground' }, item.user?.name),
							h('span', { class: 'text-muted-foreground' }, 'added a comment'),
							h(
								'span',
								{
									class: 'text-muted-foreground ml-auto sm:ml-0',
									title: item.timestampTooltip,
								},
								item.timestamp,
							),
						]),
						item.description &&
							h(
								'div',
								{ class: 'ml-7 text-sm text-foreground bg-muted rounded-md p-2' },
								item.description,
							),
					]);

				default:
					return h('div', { class: 'flex items-center gap-2 text-sm flex-wrap' }, [
						item.user &&
							h(Avatar, {
								class: 'size-5 text-[10px]',
								src: item.user.avatarUrl,
								name: item.user.name,
							}),
						item.user && h('span', { class: 'font-medium text-foreground' }, item.user.name),
						h('span', { class: 'text-muted-foreground' }, item.title || item.description),
						h(
							'span',
							{
								class: 'text-muted-foreground ml-auto sm:ml-0',
								title: item.timestampTooltip,
							},
							item.timestamp,
						),
					]);
			}
		}
	},
});
</script>
