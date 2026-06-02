<template>
	<TreeRoot
		v-model="selected"
		:items="data"
		:get-key="getKey"
		:get-children="getChildren"
		:default-expanded="defaultExpanded"
		:multiple="multiple"
		:class="classes"
		:aria-label="ariaLabel"
		data-slot="tree-view"
	>
		<template #default="{ flattenItems }">
			<TreeItem
				v-for="item in flattenItems"
				:key="item._id"
				v-bind="item.bind"
				v-slot="{ isExpanded, handleToggle }"
				data-slot="tree-view-item"
				:class="itemClasses"
				:style="{ paddingLeft: `${(item.level - 1) * indentStep + 8}px` }"
				:data-disabled="item.value.disabled ? '' : undefined"
			>
				<button
					v-if="item.hasChildren"
					type="button"
					tabindex="-1"
					:aria-label="isExpanded ? 'Collapse' : 'Expand'"
					:aria-expanded="isExpanded ? 'true' : 'false'"
					:class="treeViewChevronVariants()"
					data-slot="tree-view-chevron"
					@click.stop="handleToggle()"
				>
					<Icon
						:icon="ChevronRight"
						size="sm"
						:class="
							isExpanded
								? 'transition-transform duration-200 rotate-90'
								: 'transition-transform duration-200'
						"
						aria-hidden="true"
					/>
				</button>
				<span v-else class="size-6 shrink-0" aria-hidden="true" />

				<Icon
					v-if="!hideIcons"
					:icon="item.hasChildren ? (isExpanded ? FolderOpen : Folder) : File"
					size="sm"
					class="text-muted-foreground"
					aria-hidden="true"
					data-slot="tree-view-icon"
				/>

				<span class="truncate" data-slot="tree-view-label">{{ item.value.name }}</span>
			</TreeItem>
		</template>
	</TreeRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TreeRoot, TreeItem } from 'reka-ui';
import { ChevronRight, File, Folder, FolderOpen } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import {
	treeViewVariants,
	treeViewItemVariants,
	treeViewChevronVariants,
	type TreeNode,
	type TreeViewSize,
} from './tree-view';

interface TreeViewProps {
	data: TreeNode[];
	defaultExpanded?: string[];
	/** Allow multiple nodes to be selected at once. */
	multiple?: boolean;
	/** Density tier. */
	size?: TreeViewSize;
	/** Hide the file/folder icons (chevron stays). */
	hideIcons?: boolean;
	/** Indent step in pixels per nesting level. Defaults to 16. */
	indentStep?: number;
	/** Accessible label for the whole tree — surfaces as `aria-label` on the root. */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<TreeViewProps>(), {
	defaultExpanded: () => [],
	multiple: false,
	size: 'default',
	hideIcons: false,
	indentStep: 16,
});

const selected = defineModel<TreeNode | TreeNode[]>('modelValue');

const classes = computed(() => cn(treeViewVariants({ size: props.size }), props.class));
const itemClasses = computed(() => treeViewItemVariants({ size: props.size }));

function getKey(item: TreeNode): string {
	return item.id;
}

function getChildren(item: TreeNode): TreeNode[] | undefined {
	return item.children;
}
</script>
