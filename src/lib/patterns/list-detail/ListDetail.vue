<template>
	<div data-slot="list-detail" :class="cn(listDetailVariants(), props.class)">
		<!-- Wide viewport: two resizable panes, both always visible. -->
		<Splitter
			v-if="isWide"
			:auto-save-id="autoSaveId"
			class="h-full w-full"
			data-slot="list-detail-wide"
		>
			<SplitterPanel
				:default-size="railWidth"
				:min-size="railMinSize"
				:max-size="railMaxSize"
				class="min-w-0"
				data-slot="list-detail-rail"
			>
				<ScrollArea class="h-full" viewport-class="h-full">
					<slot name="list" />
				</ScrollArea>
			</SplitterPanel>
			<SplitterResizeHandle />
			<SplitterPanel class="min-w-0" data-slot="list-detail-pane">
				<slot v-if="hasSelection" name="detail" />
				<slot v-else name="empty" />
			</SplitterPanel>
		</Splitter>

		<!-- Narrow viewport: single column that drills down list → detail. -->
		<template v-else>
			<div
				v-if="!hasSelection"
				class="h-full min-h-0 w-full overflow-y-auto"
				data-slot="list-detail-narrow-list"
			>
				<slot name="list" />
			</div>
			<div
				v-else
				class="flex h-full min-h-0 w-full flex-col"
				data-slot="list-detail-narrow-detail"
			>
				<div class="flex items-center gap-1 border-b border-border px-2 py-1.5">
					<Button
						variant="ghost"
						size="sm"
						data-slot="list-detail-back"
						@click="emit('back')"
					>
						<Icon :icon="ChevronLeft" size="sm" />
						<span>{{ backLabel }}</span>
					</Button>
					<slot name="mobile-bar" />
				</div>
				<div class="min-h-0 flex-1 overflow-y-auto">
					<slot name="detail" />
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft } from '@lucide/vue';
import Splitter from '../../general/splitter/Splitter.vue';
import SplitterPanel from '../../general/splitter/SplitterPanel.vue';
import SplitterResizeHandle from '../../general/splitter/SplitterResizeHandle.vue';
import ScrollArea from '../../general/scroll-area/ScrollArea.vue';
import Button from '../../general/button/Button.vue';
import Icon from '../../general/icon/Icon.vue';
import { useResponsive } from '../../../composables/useResponsive.js';
import { cn } from '../../../helpers/cn.js';
import { listDetailVariants, type ListDetailBreakpoint } from './list-detail.js';

interface ListDetailProps {
	/**
	 * The selected item's id. Its presence drives the narrow-viewport drill-down
	 * (null → show the list; set → show the detail). On wide viewports it toggles
	 * the detail vs the `empty` slot.
	 */
	selected?: string | null;
	/** Initial rail width as a percentage of the container (wide viewport). */
	railWidth?: number;
	/** Minimum rail width percentage when dragging the resize handle. */
	railMinSize?: number;
	/** Maximum rail width percentage when dragging the resize handle. */
	railMaxSize?: number;
	/** Viewport width at/above which the two-pane layout is used. */
	breakpoint?: ListDetailBreakpoint;
	/** Label on the narrow-viewport back button. */
	backLabel?: string;
	/** Forwarded to the Splitter so panel sizes persist to localStorage. */
	autoSaveId?: string;
	class?: string;
}

const props = withDefaults(defineProps<ListDetailProps>(), {
	selected: null,
	railWidth: 32,
	railMinSize: 20,
	railMaxSize: 45,
	breakpoint: 'md',
	backLabel: 'Back',
	autoSaveId: undefined,
	class: undefined,
});

const emit = defineEmits<{
	/** Fired when the narrow-viewport back button is pressed. */
	back: [];
}>();

const responsive = useResponsive();
const isWide = computed(() => responsive[props.breakpoint].value);
const hasSelection = computed(() => props.selected != null && props.selected !== '');
</script>
