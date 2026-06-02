<template>
	<div
		data-slot="filter-bar-chip"
		:class="cn(filterBarChipVariants({ state: chipState, tone: column.tone ?? 'default' }))"
		:data-required="isRequired ? 'true' : undefined"
	>
		<!-- Column segment -->
		<span
			:class="cn(filterBarChipSegmentVariants({ type: 'column' }))"
			:aria-label="isRequired ? `${column.displayName} (Required filter)` : undefined"
		>
			<Icon v-if="column.icon" :icon="column.icon" size="xs-sm" />
			<span>{{ column.displayName }}</span>
			<span
				v-if="isRequired"
				aria-hidden="true"
				class="text-warning"
				:class="isPlaceholder ? 'font-semibold' : ''"
				>*</span
			>
		</span>

		<!-- Operator segment: static span when only one operator is allowed -->
		<span
			v-if="operators.length <= 1"
			:class="
				cn(
					filterBarChipSegmentVariants({ type: 'operator' }),
					'cursor-default hover:bg-transparent',
				)
			"
		>
			{{ filter.operator }}
		</span>
		<Popover v-else v-model:open="operatorPopoverOpen">
			<PopoverTrigger>
				<Button
					variant="ghost"
					:class="cn(filterBarChipSegmentVariants({ type: 'operator' }), 'h-full rounded-none')"
				>
					{{ filter.operator }}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="bottom"
				align="start"
				:side-offset="4"
				size="auto"
				hide-close-button
				:class="filterBarPopoverClass"
			>
				<div class="p-1">
					<Button
						v-for="op in operators"
						:key="op"
						variant="ghost"
						:class="
							cn(
								filterBarOptionVariants(),
								'h-auto rounded-sm justify-start font-normal',
								op === filter.operator && 'bg-accent',
							)
						"
						@click="selectOperator(op)"
					>
						{{ op }}
					</Button>
				</div>
			</PopoverContent>
		</Popover>

		<!-- Value segment: omitted for is empty / is not empty -->
		<template v-if="!hasNoValueSegment">
			<!-- Value segment: singleOption use DropdownMenu with radio -->
			<DropdownMenu v-if="isSingleOption" :modal="false">
				<DropdownMenuTrigger>
					<Button
						variant="ghost"
						:class="cn(filterBarChipSegmentVariants({ type: 'value' }), 'h-full rounded-none')"
					>
						<template v-if="valueIcons.length > 0">
							<Icon v-for="(opt, i) in valueIcons" :key="i" :icon="opt!.icon!" size="xs-sm" />
						</template>
						<span>{{ valueLabel }}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" :side-offset="4">
					<DropdownMenuRadioGroup
						:model-value="filter.values[0] ?? ''"
						@update:model-value="setSingleValue"
					>
						<DropdownMenuRadioItem
							v-for="option in column.options"
							:key="option.value"
							:value="option.value"
							class="gap-2"
						>
							<Icon v-if="option.icon" :icon="option.icon" size="sm" />
							<span class="flex-1">{{ option.label }}</span>
							<span
								v-if="columnFacets?.get(option.value) != null"
								class="ml-auto text-xs text-muted-foreground tabular-nums"
							>
								{{ columnFacets.get(option.value) }}
							</span>
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<!-- Value segment: option/multiOption use DropdownMenu -->
			<DropdownMenu v-else-if="hasOptionValues" :modal="false">
				<DropdownMenuTrigger>
					<Button
						variant="ghost"
						:class="cn(filterBarChipSegmentVariants({ type: 'value' }), 'h-full rounded-none')"
					>
						<template v-if="valueIcons.length > 0">
							<Icon v-for="(opt, i) in valueIcons" :key="i" :icon="opt!.icon!" size="xs-sm" />
						</template>
						<span>{{ valueLabel }}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" :side-offset="4">
					<DropdownMenuCheckboxItem
						v-for="option in column.options"
						:key="option.value"
						:checked="filter.values.includes(option.value)"
						class="gap-2"
						@update:checked="(checked) => toggleValue(option.value, !!checked)"
					>
						<Icon v-if="option.icon" :icon="option.icon" size="sm" />
						<span class="flex-1">{{ option.label }}</span>
						<span
							v-if="columnFacets?.get(option.value) != null"
							class="ml-auto text-xs text-muted-foreground tabular-nums"
						>
							{{ columnFacets.get(option.value) }}
						</span>
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<!-- Value segment: text/number use Popover with input -->
			<Popover v-else-if="filter.type === 'text' || filter.type === 'number'">
				<PopoverTrigger>
					<Button
						variant="ghost"
						:class="cn(filterBarChipSegmentVariants({ type: 'value' }), 'h-full rounded-none')"
					>
						<span>{{ valueLabel }}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					side="bottom"
					align="start"
					:side-offset="4"
					size="auto"
					hide-close-button
					:class="filterBarPopoverClass"
				>
					<div class="p-1.5">
						<input
							:type="filter.type === 'number' ? 'number' : 'text'"
							:aria-label="column.displayName"
							class="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							:value="filter.values[0] ?? ''"
							:placeholder="filter.type === 'number' ? 'Enter number...' : 'Enter value...'"
							@input="(e) => onTextInput((e.target as HTMLInputElement).value)"
						/>
					</div>
				</PopoverContent>
			</Popover>

			<!-- Value segment: date uses Calendar -->
			<Popover v-else-if="filter.type === 'date'">
				<PopoverTrigger>
					<Button
						variant="ghost"
						:class="cn(filterBarChipSegmentVariants({ type: 'value' }), 'h-full rounded-none')"
					>
						<span>{{ valueLabel }}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					side="bottom"
					align="start"
					:side-offset="4"
					size="auto"
					hide-close-button
					class="w-auto p-0"
				>
					<Calendar
						class="border-0 shadow-none rounded-md"
						:model-value="dateModel"
						@update:model-value="onDateSelect"
					/>
				</PopoverContent>
			</Popover>

			<!-- Value segment: daterange uses RangeCalendar -->
			<Popover v-else-if="filter.type === 'daterange'">
				<PopoverTrigger>
					<Button
						variant="ghost"
						:class="cn(filterBarChipSegmentVariants({ type: 'value' }), 'h-full rounded-none')"
					>
						<span>{{ valueLabel }}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					side="bottom"
					align="start"
					:side-offset="4"
					size="auto"
					hide-close-button
					class="w-auto p-0"
				>
					<DateRangePickerPanel
						:presets="column.presets"
						:model-value="dateRangeModel"
						@select="onDateRangeSelect"
					/>
				</PopoverContent>
			</Popover>
		</template>

		<!-- Badge cluster -->
		<span
			v-if="column.badge || (column.extraBadges && column.extraBadges.length > 0)"
			data-slot="filter-bar-chip-badges"
			class="inline-flex items-center ml-1 mr-1 *:mx-0! [&>*+*]:-ml-2!"
		>
			<span
				v-if="column.badge"
				data-slot="filter-bar-chip-badge"
				:class="
					cn(
						filterBarChipBadgeVariants({ tone: column.tone ?? 'default' }),
						'ring-2 ring-background',
					)
				"
				:aria-hidden="true"
				>{{ column.badge }}</span
			>
			<span
				v-for="extra in column.extraBadges"
				:key="`${extra.tone}|${extra.letter}`"
				data-slot="filter-bar-chip-extra-badge"
				:class="cn(filterBarChipBadgeVariants({ tone: extra.tone }), 'ring-2 ring-background')"
				:aria-hidden="true"
				>{{ extra.letter }}</span
			>
		</span>

		<!-- Remove (hidden for required filters) -->
		<Button
			v-if="!isRequired"
			variant="ghost"
			data-slot="filter-bar-chip-close"
			:class="
				cn(filterBarChipSegmentVariants({ type: 'remove' }), 'h-full rounded-none min-w-6 min-h-6')
			"
			aria-label="Remove filter"
			@click="emit('remove')"
		>
			<Icon :icon="X" size="xs-sm" />
		</Button>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X } from '@lucide/vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import Popover from '../../general/popover/Popover.vue';
import PopoverTrigger from '../../general/popover/PopoverTrigger.vue';
import PopoverContent from '../../general/popover/PopoverContent.vue';
import DropdownMenu from '../../general/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../../general/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../../general/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuCheckboxItem from '../../general/dropdown-menu/DropdownMenuCheckboxItem.vue';
import DropdownMenuRadioGroup from '../../general/dropdown-menu/DropdownMenuRadioGroup.vue';
import DropdownMenuRadioItem from '../../general/dropdown-menu/DropdownMenuRadioItem.vue';
import Calendar from '../../dates/calendar/Calendar.vue';
import DateRangePickerPanel from './DateRangePickerPanel.vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn';
import {
	filterBarChipVariants,
	filterBarChipBadgeVariants,
	filterBarChipSegmentVariants,
	filterBarPopoverClass,
	filterBarOptionVariants,
	getOperatorsForType,
	operatorTakesNoValue,
	type FilterModel,
	type ColumnConfig,
	type FilterOperator,
	type FacetedValues,
} from './filter-bar';

interface FilterBarChipProps {
	filter: FilterModel;
	column: ColumnConfig;
	facets?: FacetedValues;
	/** True when the underlying column has required: true. Hides the remove button + shows asterisk. */
	isRequired?: boolean;
	/** True when the chip represents a required column with no value yet (synthetic empty). */
	isPlaceholder?: boolean;
}

const props = withDefaults(defineProps<FilterBarChipProps>(), {
	facets: undefined,
	isRequired: false,
	isPlaceholder: false,
});

const chipState = computed<'default' | 'requiredEmpty'>(() =>
	props.isPlaceholder ? 'requiredEmpty' : 'default',
);

const emit = defineEmits<{
	'update:operator': [operator: FilterOperator];
	'update:values': [values: string[]];
	remove: [];
}>();

const operatorPopoverOpen = ref(false);

const operators = computed(() => props.column.operators ?? getOperatorsForType(props.filter.type));

const valueLabel = computed(() => {
	const values = props.filter.values;
	if (values.length === 0) {
		return props.isPlaceholder ? 'Select value...' : 'any';
	}

	if (props.column.options) {
		const labels = values.map((v) => {
			const opt = props.column.options?.find((o) => o.value === v);
			return opt?.label ?? v;
		});
		if (labels.length === 1) return labels[0];
		return `${labels.length} ${props.column.displayName.toLowerCase()}`;
	}

	// Date range: show "start → end"
	if (props.filter.type === 'daterange' && values.length === 2) {
		return `${values[0]} → ${values[1]}`;
	}

	if (values.length === 1) return values[0];
	return `${values.length} values`;
});

const valueIcons = computed(() => {
	if (!props.column.options) return [];
	return props.filter.values
		.map((v) => props.column.options?.find((o) => o.value === v))
		.filter((o) => o?.icon)
		.slice(0, 3);
});

function selectOperator(op: string) {
	emit('update:operator', op as FilterOperator);
	operatorPopoverOpen.value = false;
}

function toggleValue(value: string, checked: boolean) {
	const values = checked
		? [...props.filter.values, value]
		: props.filter.values.filter((v) => v !== value);
	emit('update:values', values);
}

function setSingleValue(value: string) {
	emit('update:values', [value]);
}

function onTextInput(value: string) {
	emit('update:values', value ? [value] : []);
}

function onDateSelect(date: ForgeDate) {
	emit('update:values', [date.toISODate()]);
}

function onDateRangeSelect(range: { start: ForgeDate; end: ForgeDate }) {
	emit('update:values', [range.start.toISODate(), range.end.toISODate()]);
}

const columnFacets = computed(() => props.facets?.[props.filter.columnId]);
const hasNoValueSegment = computed(() => operatorTakesNoValue(props.filter.operator));
const isSingleOption = computed(() => props.filter.type === 'singleOption');
const hasOptionValues = computed(
	() => props.filter.type === 'option' || props.filter.type === 'multiOption',
);

const dateModel = computed<ForgeDate | null>(() => {
	const iso = props.filter.values[0];
	return iso ? ForgeDate.fromISO(iso) : null;
});

const dateRangeModel = computed<{ start: ForgeDate; end: ForgeDate } | null>(() => {
	const [startIso, endIso] = props.filter.values;
	if (!startIso || !endIso) return null;
	return { start: ForgeDate.fromISO(startIso), end: ForgeDate.fromISO(endIso) };
});
</script>
