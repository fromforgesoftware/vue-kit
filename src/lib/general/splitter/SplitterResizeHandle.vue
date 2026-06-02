<template>
	<SplitterResizeHandle
		:id="id"
		:disabled="disabled"
		:class="classes"
		:aria-label="ariaLabel"
		:data-orientation="ariaOrientation"
		data-slot="splitter-resize-handle"
	>
		<slot />
	</SplitterResizeHandle>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { SplitterResizeHandle } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	splitterResizeHandleVariants,
	SPLITTER_DIRECTION_KEY,
	type SplitterHandleThickness,
} from './splitter.js';

interface SplitterResizeHandleProps {
	id?: string;
	/** Visible rule weight. Default `hairline` (1 px). */
	thickness?: SplitterHandleThickness;
	/** Optional accessible label override. Defaults to "Resize panels". */
	ariaLabel?: string;
	/** Disable the handle entirely (drag and keyboard). */
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<SplitterResizeHandleProps>(), {
	thickness: 'hairline',
	ariaLabel: 'Resize panels',
	disabled: false,
});

// `Reka` already attaches `role="separator"` and exposes ArrowLeft/Right or
// ArrowUp/Down keyboard resize per WAI-ARIA Splitter pattern — these are our
// SC 2.5.7 keyboard alternative for drag.
const direction = inject(SPLITTER_DIRECTION_KEY, undefined);
const ariaOrientation = computed<'horizontal' | 'vertical'>(() =>
	// ARIA orientation for `separator` is the *axis of movement*, which is the
	// opposite of the layout direction. A horizontal Splitter has a vertical
	// separator that moves horizontally — but Reka maps `orientation` to the
	// splitter's layout axis, which we mirror to keep `data-orientation`
	// consistent across the API surface.
	direction?.value === 'vertical' ? 'vertical' : 'horizontal',
);

const classes = computed(() =>
	cn(splitterResizeHandleVariants({ thickness: props.thickness }), props.class),
);
</script>
