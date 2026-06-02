<template>
	<MenubarMenu data-slot="menubar-menu" :value="value">
		<slot />
	</MenubarMenu>
</template>

<script setup lang="ts">
import { MenubarMenu } from 'reka-ui';

interface MenubarMenuProps {
	value?: string;
}

defineProps<MenubarMenuProps>();
</script>
