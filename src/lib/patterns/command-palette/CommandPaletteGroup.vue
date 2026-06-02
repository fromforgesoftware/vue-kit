<template>
	<div
		v-show="isVisible"
		:class="classes"
		data-slot="command-palette-group"
		data-command-group
		role="group"
	>
		<div
			v-if="heading || $slots.heading"
			data-slot="command-palette-group-heading"
			data-command-group-heading
			role="presentation"
			class="flex items-center"
		>
			<slot name="heading">{{ heading }}</slot>
		</div>
		<div data-slot="command-palette-group-items" data-command-group-items role="group">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, provide, ref } from 'vue';
import { cn } from '../../../helpers/cn';
import {
	commandPaletteGroupVariants,
	COMMAND_PALETTE_KEY,
	COMMAND_PALETTE_SUB_ID_KEY,
	COMMAND_PALETTE_GROUP_KEY,
	type CommandPaletteGroupContext,
} from './command-palette';

interface CommandPaletteGroupProps {
	/** Group heading text */
	heading?: string;
	/** If set, this group is a submenu and only shows when pushed */
	subId?: string;
	class?: string;
}

const props = defineProps<CommandPaletteGroupProps>();

const ctx = inject(COMMAND_PALETTE_KEY)!;
const parentSubId = inject(COMMAND_PALETTE_SUB_ID_KEY, null);

const isInSubmenu = computed(() => {
	if (props.subId) return ctx.activeSubmenu.value === props.subId;
	if (parentSubId) return ctx.activeSubmenu.value === parentSubId;
	return ctx.activeSubmenu.value === null;
});

const visibleChildren = ref(0);
const groupCtx: CommandPaletteGroupContext = {
	incrementVisible: () => {
		visibleChildren.value++;
	},
	decrementVisible: () => {
		visibleChildren.value = Math.max(0, visibleChildren.value - 1);
	},
};
provide(COMMAND_PALETTE_GROUP_KEY, groupCtx);

const isVisible = computed(() => isInSubmenu.value && visibleChildren.value > 0);

const classes = computed(() => cn(commandPaletteGroupVariants(), props.class));
</script>
