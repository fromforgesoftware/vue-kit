<template>
	<PopoverClose data-slot="popover-close" as-child>
		<slot />
	</PopoverClose>
</template>

<script setup lang="ts">
import { PopoverClose } from 'reka-ui';
</script>
