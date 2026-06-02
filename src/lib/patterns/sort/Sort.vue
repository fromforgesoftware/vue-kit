<template>
	<Popover :open="isOpen" data-slot="sort" @update:open="onOpenChange">
		<PopoverTrigger data-slot="sort-trigger">
			<Button variant="outline" aria-label="Sort by">
				<Icon :icon="ArrowUpDown" size="sm" />
				<div class="hidden lg:flex">
					<div v-if="!isSortEmpty" class="flex items-center">
						Sort by:
						<span class="ml-1 font-semibold">{{ firstSortFieldName }}</span>
						<Badge v-if="activeSortCount > 1" variant="secondary" class="ml-2">
							+{{ activeSortCount - 1 }}
						</Badge>
					</div>
					<template v-else>Sort by</template>
				</div>
			</Button>
		</PopoverTrigger>
		<PopoverContent align="start" size="auto" hide-close-button :class="cn('w-auto', props.class)">
			<div class="space-y-3 -m-4 p-4 w-max">
				<div
					v-for="(sortField, index) in sortFields"
					:key="index"
					data-slot="sort-row"
					:draggable="sortFields.length > 1"
					:class="
						cn(
							sortRowVariants(),
							dragIndex === index && 'opacity-50',
							dropTargetIndex === index && dragIndex !== index && 'ring-2 ring-primary rounded',
						)
					"
					@dragstart="onDragStart(index, $event)"
					@dragover="onDragOver(index, $event)"
					@dragleave="onDragLeave"
					@drop="onDrop(index, $event)"
					@dragend="onDragEnd"
				>
					<Icon
						v-if="sortFields.length > 1"
						:icon="GripVertical"
						size="sm"
						class="cursor-grab shrink-0 text-muted-foreground"
					/>

					<Select
						:model-value="sortField.fieldName"
						@update:model-value="onFieldChange(index, $event)"
					>
						<SelectTrigger class="h-8 min-w-[140px]" aria-label="Sort field">
							<SelectValue placeholder="Select field">
								<div v-if="sortField.fieldName" class="flex items-center gap-1.5">
									<Icon
										v-if="findIconByFieldName(sortField.fieldName)"
										:icon="findIconByFieldName(sortField.fieldName)!"
										size="sm"
									/>
									{{ sortField.fieldName }}
								</div>
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								v-for="field in fieldsForRow(index)"
								:key="field.name"
								:value="field.name"
							>
								<div class="flex items-center gap-1.5">
									<Icon v-if="field.icon" :icon="field.icon" size="sm" />
									{{ field.name }}
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					<ToggleGroup
						type="single"
						:model-value="sortField.direction"
						class="shrink-0"
						@update:model-value="
							(val: string | string[]) => {
								if (val) onDirectionChange(index, val as string);
							}
						"
					>
						<ToggleGroupItem value="ASC" size="sm" variant="outline" aria-label="Ascending">
							<Icon :icon="ArrowUpNarrowWide" size="xs-sm" />
						</ToggleGroupItem>
						<ToggleGroupItem value="DESC" size="sm" variant="outline" aria-label="Descending">
							<Icon :icon="ArrowDownNarrowWide" size="xs-sm" />
						</ToggleGroupItem>
					</ToggleGroup>

					<Button
						data-slot="sort-delete"
						variant="ghost"
						size="icon"
						class="size-7 shrink-0 text-muted-foreground hover:text-foreground"
						:aria-label="`Remove sort by ${sortField.fieldName || 'field'}`"
						@click="deleteSortField(index)"
					>
						<Icon :icon="X" size="xs-sm" />
					</Button>
				</div>

				<Button
					data-slot="sort-add"
					variant="ghost"
					size="sm"
					class="text-muted-foreground"
					@click="addSortField"
				>
					<Icon :icon="Plus" size="xs-sm" />
					Add sort
				</Button>
			</div>
		</PopoverContent>
	</Popover>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue';
import {
	ArrowUpDown,
	ArrowUpNarrowWide,
	ArrowDownNarrowWide,
	GripVertical,
	Plus,
	X,
} from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import Button from '../../general/button/Button.vue';
import Badge from '../../general/badge/Badge.vue';
import Popover from '../../general/popover/Popover.vue';
import PopoverTrigger from '../../general/popover/PopoverTrigger.vue';
import PopoverContent from '../../general/popover/PopoverContent.vue';
import Select from '../../form/select/Select.vue';
import SelectTrigger from '../../form/select/SelectTrigger.vue';
import SelectValue from '../../form/select/SelectValue.vue';
import SelectContent from '../../form/select/SelectContent.vue';
import SelectItem from '../../form/select/SelectItem.vue';
import ToggleGroup from '../../form/toggle-group/ToggleGroup.vue';
import ToggleGroupItem from '../../form/toggle-group/ToggleGroupItem.vue';
import { sortRowVariants, type SortFieldOption, type SortField, type SortDirection } from './sort.js';

interface SortProps {
	/**
	 * Available fields that can be sorted.
	 */
	availableFields?: SortFieldOption[];
	/**
	 * The current sort value (v-model).
	 */
	modelValue?: SortField[];
	class?: string;
}

const props = withDefaults(defineProps<SortProps>(), {
	availableFields: () => [],
	modelValue: undefined,
});

const emit = defineEmits<{
	'update:modelValue': [value: SortField[]];
}>();

interface InternalSortField {
	fieldName: string;
	direction: SortDirection;
}

const isOpen = ref(false);
const sortFields = ref<InternalSortField[]>([]);

function createEmptySortField(): InternalSortField {
	return { fieldName: '', direction: 'ASC' };
}

function initFromValue(): void {
	if (props.modelValue && props.modelValue.length > 0) {
		sortFields.value = props.modelValue.map((sf) => ({
			fieldName: sf.field.name,
			direction: sf.direction,
		}));
	} else {
		sortFields.value = [createEmptySortField()];
	}
}

initFromValue();

watch(
	() => props.modelValue,
	() => {
		if (!isOpen.value) {
			initFromValue();
		}
	},
	{ deep: true },
);

const isSortEmpty = computed(() => {
	if (sortFields.value.length === 0) return true;
	if (sortFields.value.length > 1) return false;
	return sortFields.value[0].fieldName === '';
});

const isFormValid = computed(() => {
	return sortFields.value.every((sf) => sf.fieldName !== '');
});

const activeSortCount = computed(() => {
	if (isSortEmpty.value) return 0;
	return sortFields.value.filter((sf) => sf.fieldName !== '').length;
});

const firstSortFieldName = computed(() => {
	if (isSortEmpty.value) return '';
	return sortFields.value[0].fieldName;
});

function findFieldOption(fieldName: string): SortFieldOption | undefined {
	return (props.availableFields ?? []).find((f) => f.name === fieldName);
}

// Fields available for a given row's selector — hides fields already chosen
// in OTHER rows so the user can't pick the same field twice.
function fieldsForRow(currentIndex: number): SortFieldOption[] {
	const usedByOthers = new Set(
		sortFields.value
			.filter((_, idx) => idx !== currentIndex)
			.map((sf) => sf.fieldName)
			.filter((name) => name !== ''),
	);
	return (props.availableFields ?? []).filter((f) => !usedByOthers.has(f.name));
}

function findIconByFieldName(fieldName: string): Component | undefined {
	return findFieldOption(fieldName)?.icon;
}

function toSortFields(internal: InternalSortField[]): SortField[] {
	return internal.map((sf) => {
		const option = findFieldOption(sf.fieldName);
		return {
			field: { name: sf.fieldName, icon: option?.icon },
			direction: sf.direction as SortDirection,
		};
	});
}

function addSortField(): void {
	sortFields.value.push(createEmptySortField());
}

function deleteSortField(index: number): void {
	sortFields.value.splice(index, 1);
	if (sortFields.value.length === 0) {
		sortFields.value = [createEmptySortField()];
		close();
	}
}

function onFieldChange(index: number, fieldName: string | string[]): void {
	sortFields.value[index].fieldName = Array.isArray(fieldName) ? (fieldName[0] ?? '') : fieldName;
}

function onDirectionChange(index: number, direction: string): void {
	sortFields.value[index].direction = direction as SortDirection;
}

function close(): void {
	if (!isFormValid.value && !isSortEmpty.value) return;

	if (isFormValid.value) {
		emit('update:modelValue', toSortFields(sortFields.value));
	}

	if (isSortEmpty.value) {
		emit('update:modelValue', []);
	}

	isOpen.value = false;
}

function onOpenChange(open: boolean): void {
	if (!open) {
		close();
	} else {
		isOpen.value = true;
	}
}

// --- Drag and drop ---
const dragIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);

function onDragStart(index: number, event: DragEvent): void {
	dragIndex.value = index;
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', String(index));
	}
}

function onDragOver(index: number, event: DragEvent): void {
	event.preventDefault();
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move';
	}
	dropTargetIndex.value = index;
}

function onDragLeave(): void {
	dropTargetIndex.value = null;
}

function onDrop(index: number, event: DragEvent): void {
	event.preventDefault();
	if (dragIndex.value !== null && dragIndex.value !== index) {
		const item = sortFields.value.splice(dragIndex.value, 1)[0];
		sortFields.value.splice(index, 0, item);
	}
	dragIndex.value = null;
	dropTargetIndex.value = null;
}

function onDragEnd(): void {
	dragIndex.value = null;
	dropTargetIndex.value = null;
}
</script>
