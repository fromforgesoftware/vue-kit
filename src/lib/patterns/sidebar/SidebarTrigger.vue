<template>
	<Button
		data-slot="sidebar-trigger"
		data-sidebar="trigger"
		variant="ghost"
		size="icon"
		:class="classes"
		:aria-label="triggerLabel"
		:aria-expanded="expanded"
		:aria-controls="SIDEBAR_DRAWER_ID"
		@click="toggleSidebar"
	>
		<slot>
			<Icon :icon="PanelLeft" />
		</slot>
		<span class="sr-only">{{ triggerLabel }}</span>
	</Button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PanelLeft } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn';
import { useSidebar, SIDEBAR_DRAWER_ID } from './useSidebar';
import { sidebarTriggerVariants } from './sidebar';

interface SidebarTriggerProps {
	class?: string;
}

const props = defineProps<SidebarTriggerProps>();

const { toggleSidebar, isMobile, openMobile, open } = useSidebar();

const expanded = computed(() => (isMobile.value ? openMobile.value : open.value));

const triggerLabel = computed(() => (expanded.value ? 'Close navigation' : 'Open navigation'));

const classes = computed(() => cn(sidebarTriggerVariants(), props.class));
</script>
