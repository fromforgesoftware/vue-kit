<template>
	<div data-slot="avatar-group" :class="rootClasses">
		<template v-for="(item, index) in shown" :key="index">
			<Tooltip v-if="tooltips" :side="tooltipSide">
				<div data-slot="avatar-group-item" :class="itemClasses">
					<Avatar
						:name="item.name"
						:initials="item.initials"
						:src="item.src"
						:alt="item.alt"
						:size="size"
						:shape="shape"
					/>
				</div>
				<template #content>
					<slot name="tooltip" :item="item" :index="index">
						<div class="text-xs">
							<div v-if="item.name" class="font-medium">{{ item.name }}</div>
							<div v-if="item.description" class="text-muted-foreground">
								{{ item.description }}
							</div>
						</div>
					</slot>
				</template>
			</Tooltip>
			<div v-else data-slot="avatar-group-item" :class="itemClasses">
				<Avatar
					:name="item.name"
					:initials="item.initials"
					:src="item.src"
					:alt="item.alt"
					:size="size"
					:shape="shape"
				/>
			</div>
		</template>
		<template v-if="overflowCount > 0">
			<Tooltip v-if="tooltips" :side="tooltipSide" class="max-w-sm">
				<div data-slot="avatar-group-overflow" :class="itemClasses">
					<Avatar :size="size" :shape="shape" :class="overflowClasses">
						<template #fallback>{{ overflowLabel }}</template>
					</Avatar>
				</div>
				<template #content>
					<slot name="overflow-tooltip" :items="overflowItems" :count="overflowCount">
						<div class="flex max-h-48 flex-col gap-1 overflow-y-auto text-xs">
							<div v-for="(item, idx) in overflowItems" :key="idx">
								{{ item.name
								}}<template v-if="item.description"> ({{ item.description }})</template>
							</div>
						</div>
					</slot>
				</template>
			</Tooltip>
			<div v-else data-slot="avatar-group-overflow" :class="itemClasses">
				<Avatar :size="size" :shape="shape" :class="overflowClasses">
					<template #fallback>{{ overflowLabel }}</template>
				</Avatar>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
/**
 * Stack of overlapping avatars with a trailing overflow indicator. Use to
 * represent a small group of people or entities inline (e.g. a list cell, a
 * chip on a card). Past three or four faces the overflow indicator takes over;
 * the count caps at `overflowCap` so the badge stays readable.
 *
 * @example
 * ```vue
 * <AvatarGroup
 *   :items="employees.map((e) => ({
 *     name: `${e.firstName} ${e.lastName}`,
 *     description: e.email,
 *   }))"
 *   :max="4"
 * />
 * ```
 */
import { computed } from 'vue';
import Avatar from '../avatar/Avatar.vue';
import Tooltip from '../tooltip/Tooltip.vue';
import type { AvatarSize, AvatarShape } from '../avatar/avatar';
import { cn } from '../../../helpers/cn';
import {
	avatarGroupVariants,
	avatarGroupItemVariants,
	avatarGroupOverflowVariants,
	type AvatarGroupItem,
} from './avatar-group';

interface Props {
	/** Avatars to render. The first `max` are shown as faces; the rest collapse into the overflow badge. */
	items: AvatarGroupItem[];
	/** Maximum number of avatars to show before the overflow badge. Defaults to 4. */
	max?: number;
	/** Cap for the overflow count label. Anything above renders as `+{cap}`. Defaults to 99. */
	overflowCap?: number;
	/** Avatar size — applies to every face including the overflow badge. */
	size?: AvatarSize;
	/** Avatar shape — applies to every face including the overflow badge. */
	shape?: AvatarShape;
	/** Show tooltips on hover. Disable when wrapping the group in a richer parent affordance. */
	tooltips?: boolean;
	/** Side to position the tooltip relative to each avatar. */
	tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
	/** Additional classes for the root container. */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	max: 4,
	overflowCap: 99,
	size: 'default',
	shape: 'circle',
	tooltips: true,
	tooltipSide: 'bottom',
});

defineSlots<{
	/** Per-avatar tooltip content. Defaults to `name` + optional `description`. */
	tooltip?: (slotProps: { item: AvatarGroupItem; index: number }) => unknown;
	/** Overflow tooltip content. Defaults to a scrollable list of remaining names. */
	'overflow-tooltip'?: (slotProps: { items: AvatarGroupItem[]; count: number }) => unknown;
}>();

const shown = computed(() => props.items.slice(0, props.max));
const overflowItems = computed(() => props.items.slice(props.max));
const overflowCount = computed(() => Math.max(0, props.items.length - props.max));
const overflowLabel = computed(() =>
	overflowCount.value > props.overflowCap ? `+${props.overflowCap}` : `+${overflowCount.value}`,
);

const rootClasses = computed(() => cn(avatarGroupVariants(), props.class));
const itemClasses = computed(() => cn(avatarGroupItemVariants({ size: props.size })));
const overflowClasses = computed(() => cn(avatarGroupOverflowVariants()));
</script>
