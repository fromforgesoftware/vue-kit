import { type Component } from 'vue';
import { cva } from 'class-variance-authority';
import type { DateRangePreset } from '../../dates/date-range-picker/date-range-picker';

/** Filterable column data type — drives the operator set and value editor UI. */
export type ColumnDataType =
	| 'text'
	| 'number'
	| 'option'
	| 'singleOption'
	| 'multiOption'
	| 'date'
	| 'daterange';

/** A choice in an option / multi-option filter. */
export interface ColumnOption {
	value: string;
	label: string;
	icon?: Component;
}

/**
 * Visual tone for differentiating chips that share a conceptual key but
 * apply to different widget subsets (e.g. past vs future date filter on a
 * mixed dashboard). Drives the chip background tint and the optional
 * trailing badge color.
 */
export type ChipTone = 'default' | 'past' | 'future' | 'shrinkage' | 'adherence' | 'dimension';

/** Definition of a filterable column — id, type, display, and any pre-canned options. */
export interface ColumnConfig {
	id: string;
	type: ColumnDataType;
	displayName: string;
	icon?: Component;
	options?: ColumnOption[];
	/**
	 * Optional preset shortcuts for `daterange` columns. When set, FilterBar
	 * renders the preset list alongside the calendar in both the add-filter
	 * dropdown and the chip-edit popover. Use `defaultDateRangePresets` from
	 * `@fromforgesoftware/vue-kit` for a standard set, or pass a custom list to fit a
	 * different domain (leave year, payroll period, fiscal quarters, …).
	 * Ignored for non-daterange columns.
	 */
	presets?: DateRangePreset[];
	/** When true the filter trigger is greyed-out and the submenu cannot be opened. */
	disabled?: boolean;
	/** Hint shown below the disabled trigger explaining why (e.g. "Select a group first"). */
	disabledReason?: string;
	/** When true the filter is always rendered as a chip and cannot be removed. */
	required?: boolean;
	/** Restrict operators for this column. Defaults to getOperatorsForType(type). */
	operators?: readonly FilterOperator[];
	/** Initial operator when filter is created. Defaults to getDefaultOperator(type). */
	defaultOperator?: FilterOperator;
	/**
	 * Tints the chip wrapper. Pair with `badge` to visually link the chip
	 * to the widgets it affects on the same dashboard. Omit for plain chips.
	 */
	tone?: ChipTone;
	/**
	 * Single character rendered as a colored pill at the trailing end of
	 * the chip. Used together with `tone` to differentiate chips that share
	 * a conceptual key but apply to different widget subsets.
	 */
	badge?: string;
	/**
	 * Additional letter pills rendered next to the main badge — one per
	 * feature/widget-kind that shares this filter on the current dashboard
	 * (e.g. an `Adherence` `A` and a `Shrinkage` `S` next to the past-date
	 * chip's `H`). Each pill carries its own tone, independent of
	 * `column.tone`. Omit for plain chips.
	 */
	extraBadges?: { letter: string; tone: ChipTone }[];
}

export const textOperators = [
	'is',
	'is not',
	'contains',
	'does not contain',
	'is empty',
	'is not empty',
] as const;
export const numberOperators = [
	'is',
	'is not',
	'is greater than',
	'is less than',
	'is between',
] as const;
export const dateOperators = [
	'is',
	'is before',
	'is after',
	'is between',
	'is empty',
	'is not empty',
] as const;
export const dateRangeOperators = ['is between'] as const;
export const singleOptionOperators = ['is', 'is not'] as const;
export const optionOperators = [
	'is',
	'is not',
	'is any of',
	'is none of',
	'is empty',
	'is not empty',
] as const;
export const multiOptionOperators = [
	'include',
	'do not include',
	'include any of',
	'include none of',
	'is empty',
	'is not empty',
] as const;

export type TextOperator = (typeof textOperators)[number];
export type NumberOperator = (typeof numberOperators)[number];
export type DateOperator = (typeof dateOperators)[number];
export type DateRangeOperator = (typeof dateRangeOperators)[number];
export type SingleOptionOperator = (typeof singleOptionOperators)[number];
export type OptionOperator = (typeof optionOperators)[number];
export type MultiOptionOperator = (typeof multiOptionOperators)[number];

export type FilterOperator =
	| TextOperator
	| NumberOperator
	| DateOperator
	| DateRangeOperator
	| SingleOptionOperator
	| OptionOperator
	| MultiOptionOperator;

/** Returns the valid operator list for a given column data type. */
export function getOperatorsForType(type: ColumnDataType): readonly string[] {
	switch (type) {
		case 'text':
			return textOperators;
		case 'number':
			return numberOperators;
		case 'date':
			return dateOperators;
		case 'daterange':
			return dateRangeOperators;
		case 'singleOption':
			return singleOptionOperators;
		case 'option':
			return optionOperators;
		case 'multiOption':
			return multiOptionOperators;
	}
}

/** Returns the default operator for a column type — used when adding a new filter chip. */
export function getDefaultOperator(type: ColumnDataType): FilterOperator {
	switch (type) {
		case 'text':
			return 'contains';
		case 'number':
			return 'is';
		case 'date':
			return 'is';
		case 'daterange':
			return 'is between';
		case 'singleOption':
			return 'is';
		case 'option':
			return 'is';
		case 'multiOption':
			return 'include any of';
	}
}

export interface FilterModel {
	columnId: string;
	type: ColumnDataType;
	operator: FilterOperator;
	values: string[];
	/** Filters sharing an orGroupIndex are OR'd; groups are AND'd with top-level filters. */
	orGroupIndex?: number;
}

export type FiltersState = FilterModel[];

export function operatorTakesNoValue(op: FilterOperator): boolean {
	return op === 'is empty' || op === 'is not empty';
}

/** Per-column value frequency for facet pills (counts shown in dropdown options). */
export type FacetedValues = Record<string, Map<string, number>>;

/** Layout — `default` is inline chip row, `panel` is a side panel for advanced filtering. */
export type FilterBarVariant = 'default' | 'panel';

/** Root container for {@link FilterBar}. */
export const filterBarVariants = cva('', {
	variants: {
		variant: {
			default: 'flex items-center gap-1.5 flex-wrap',
			panel: 'flex flex-col gap-0',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export const filterBarButtonVariants = cva(
	'inline-flex items-center justify-center size-8 rounded-md border border-border text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground text-muted-foreground',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const filterBarClearVariants = cva(
	'inline-flex items-center gap-1 rounded-md bg-destructive/10 border border-destructive/20 h-8 px-2 text-sm font-medium text-destructive cursor-pointer hover:bg-destructive/20 transition-colors',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const filterBarChipVariants = cva('inline-flex items-center rounded-md border text-sm h-8', {
	variants: {
		state: {
			default: 'border-border divide-x divide-border',
			requiredEmpty: 'border-warning/60 bg-warning/5 divide-x divide-warning/20',
		},
		tone: {
			default: '',
			past: 'border-info/40 bg-info/10 divide-info/20',
			future: 'border-success/40 bg-success/10 divide-success/20',
			shrinkage: 'border-purple-400/40 bg-purple-500/10 divide-purple-500/20',
			adherence: 'border-destructive/40 bg-destructive/10 divide-destructive/20',
			dimension: 'border-warning/40 bg-warning/10 divide-warning/20',
		},
	},
	defaultVariants: { state: 'default', tone: 'default' },
});

/** Trailing pill on a chip — a 1-char letter colored to match the chip tone. */
export const filterBarChipBadgeVariants = cva(
	'ml-1 mr-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded text-[10px] font-bold uppercase leading-none',
	{
		variants: {
			tone: {
				default: 'bg-muted text-muted-foreground',
				past: 'bg-info text-white',
				future: 'bg-success text-white',
				shrinkage: 'bg-purple-500 text-white',
				adherence: 'bg-destructive text-white',
				dimension: 'bg-warning text-white',
			},
		},
		defaultVariants: { tone: 'default' },
	},
);

export const filterBarChipSegmentVariants = cva(
	'inline-flex items-center gap-1 h-full px-2 text-sm cursor-pointer transition-colors hover:bg-accent',
	{
		variants: {
			type: {
				column: 'font-medium text-foreground',
				operator: 'text-muted-foreground',
				value: 'text-foreground',
				remove: 'px-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
			},
		},
		defaultVariants: {
			type: 'column',
		},
	},
);

/** Pass as :class on the Popover component to override its default w-72 p-4 */
export const filterBarPopoverClass = 'w-56 p-0';

export const filterBarOptionVariants = cva(
	'group flex items-center gap-2 w-full px-2 py-1 text-sm cursor-pointer rounded-sm transition-colors hover:bg-accent text-left',
	{
		variants: {},
		defaultVariants: {},
	},
);
