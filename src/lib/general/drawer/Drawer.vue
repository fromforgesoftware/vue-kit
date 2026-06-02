<template>
	<slot />

	<Teleport v-if="parent === null" to="body">
		<div
			v-if="props.overlay && ctx.isVisible.value"
			data-slot="drawer-overlay"
			:class="overlayClasses"
			:style="overlayStyle"
			@click.self="onOverlayClick"
		/>
	</Teleport>
</template>

<script setup lang="ts">
import { provide, watch, computed, inject, useId } from 'vue';
import { cn } from '../../../helpers/cn';
import { useDrawer } from './useDrawer';
import {
	drawerKey,
	drawerOverlayVariants,
	nestedDrawerKey,
	TRANSITION_MS,
	type DrawerContext,
	type DrawerSide,
} from './drawer';

interface DrawerProps {
	open?: boolean;
	defaultOpen?: boolean;
	overlay?: boolean;
	side?: DrawerSide;
}

const props = withDefaults(defineProps<DrawerProps>(), {
	open: undefined,
	defaultOpen: false,
	overlay: true,
	side: 'right',
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

// When a Drawer is rendered inside another Drawer, it auto-promotes into a
// step panel of the host instead of opening as a separate modal. Lets
// consumers nest <Drawer>s without the second one overlaying the first.
const parent = inject(drawerKey, null);

const initialOpen = props.open !== undefined ? props.open : props.defaultOpen;

const ctx: DrawerContext = parent
	? buildNestedCtx(parent)
	: useDrawer(initialOpen, (val) => emit('update:open', val), props.side);

provide(drawerKey, ctx);

if (parent === null) {
	watch(
		() => props.open,
		(val) => {
			if (val === undefined) return;
			if (val && !ctx.isOpen.value) {
				ctx.open();
			} else if (!val && ctx.isOpen.value) {
				ctx.closeAll();
			}
		},
	);

	watch(
		() => props.side,
		(val) => {
			ctx.side.value = val;
		},
	);
}

defineExpose({
	pushStep: ctx.pushStep,
	popStep: ctx.popStep,
});

const overlayClasses = computed(() => cn(drawerOverlayVariants()));

function onOverlayClick() {
	ctx.closeAll();
}

const overlayStyle = computed(() => ({
	opacity: ctx.isClosing.value ? 0 : 1,
	transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
}));

function buildNestedCtx(host: DrawerContext): DrawerContext {
	const stepName = useId();

	provide(nestedDrawerKey, { stepName });

	watch(
		() => props.open,
		(val) => {
			if (val === undefined) return;
			const inStack = host.stack.value.includes(stepName);
			if (val && !inStack) host.pushStep(stepName);
			else if (!val && inStack) {
				// Only pop if our step is on top — anything above belongs to a deeper
				// nested flow that owns its own dismissal.
				if (host.stack.value[host.stack.value.length - 1] === stepName) {
					host.popStep();
				}
			}
		},
		{ immediate: true },
	);

	watch(host.stack, (newStack) => {
		if (props.open && !newStack.includes(stepName)) {
			emit('update:open', false);
		}
	});

	watch(host.isOpen, (open) => {
		if (!open && props.open) {
			emit('update:open', false);
		}
	});

	return {
		isOpen: computed(() => host.stack.value.includes(stepName)) as DrawerContext['isOpen'],
		isVisible: host.isVisible,
		isClosing: host.isClosing,
		stack: host.stack,
		entering: host.entering,
		leaving: host.leaving,
		side: host.side,
		pushStep: host.pushStep,
		popStep: host.popStep,
		open: () => host.pushStep(stepName),
		closeAll: () => {
			if (host.stack.value[host.stack.value.length - 1] === stepName) {
				host.popStep();
			}
		},
	};
}
</script>
