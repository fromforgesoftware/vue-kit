<template>
	<AvatarRoot data-slot="avatar" :class="rootClasses">
		<AvatarImage
			v-if="src"
			data-slot="avatar-image"
			:src="src"
			:alt="alt ?? name ?? 'Avatar'"
			:class="imageClasses"
		/>
		<AvatarFallback data-slot="avatar-fallback" :class="fallbackClasses">
			<slot name="fallback">
				{{ displayInitials }}
			</slot>
		</AvatarFallback>
	</AvatarRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	avatarVariants,
	avatarImageVariants,
	avatarFallbackVariants,
	type AvatarVariants,
} from './avatar.js';

interface AvatarProps {
	size?: AvatarVariants['size'];
	shape?: AvatarVariants['shape'];
	/** Full name. Used to derive initials when no `initials` prop and no image. */
	name?: string;
	/** Initials shown in the fallback (overrides `name`). */
	initials?: string;
	/** Image URL. */
	src?: string;
	/** Image alt text. Defaults to `name` then to "Avatar". */
	alt?: string;
	class?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
	size: 'default',
	shape: 'circle',
});

const rootClasses = computed(() =>
	cn(avatarVariants({ size: props.size, shape: props.shape }), props.class),
);
const imageClasses = computed(() => cn(avatarImageVariants()));
const fallbackClasses = computed(() => cn(avatarFallbackVariants({ size: props.size })));

const displayInitials = computed(() => {
	if (props.initials) return props.initials.slice(0, 2).toUpperCase();
	if (!props.name) return '';
	const words = props.name.trim().split(/\s+/);
	if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
	return words[0].slice(0, 2).toUpperCase();
});
</script>
