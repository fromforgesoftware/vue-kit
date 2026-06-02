<template>
	<UnsavedChangesDialog
		v-if="active"
		:open="active.isOpen.value"
		:title="resolvedTitle"
		:description="resolvedDescription"
		:confirm-text="resolvedConfirmText"
		:cancel-text="resolvedCancelText"
		@confirm="active.confirm"
		@cancel="active.cancel"
	/>
</template>

<script setup lang="ts">
import { computed, toValue } from 'vue';
import UnsavedChangesDialog from './UnsavedChangesDialog.vue';
import { useUnsavedChangesRegistry } from './unsavedChangesRegistry';

const registry = useUnsavedChangesRegistry();
const active = registry?.active;

const resolvedTitle = computed(() => (active?.value ? toValue(active.value.title) : undefined));
const resolvedDescription = computed(() =>
	active?.value ? toValue(active.value.description) : undefined,
);
const resolvedConfirmText = computed(() =>
	active?.value ? toValue(active.value.confirmText) : undefined,
);
const resolvedCancelText = computed(() =>
	active?.value ? toValue(active.value.cancelText) : undefined,
);
</script>
