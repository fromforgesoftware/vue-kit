import { cva, type VariantProps } from 'class-variance-authority';
import { ForgeDate } from '@fromforgesoftware/ts-kit';

export interface DateRangePreset {
	id: string;
	label: string;
	range: () => { start: ForgeDate; end: ForgeDate };
}

export const defaultDateRangePresets: DateRangePreset[] = [
	{
		id: 'today',
		label: 'Today',
		range: () => ({ start: ForgeDate.now().startOf('day'), end: ForgeDate.now().endOf('day') }),
	},
	{
		id: 'last7',
		label: 'Last 7 Days',
		range: () => ({
			start: ForgeDate.now().minus({ days: 6 }).startOf('day'),
			end: ForgeDate.now().endOf('day'),
		}),
	},
	{
		id: 'last30',
		label: 'Last 30 Days',
		range: () => ({
			start: ForgeDate.now().minus({ days: 29 }).startOf('day'),
			end: ForgeDate.now().endOf('day'),
		}),
	},
	{
		id: 'thisWeek',
		label: 'This Week',
		range: () => ({ start: ForgeDate.now().startOf('week'), end: ForgeDate.now().endOf('week') }),
	},
	{
		id: 'lastWeek',
		label: 'Last Week',
		range: () => ({
			start: ForgeDate.now().minus({ days: 7 }).startOf('week'),
			end: ForgeDate.now().minus({ days: 7 }).endOf('week'),
		}),
	},
	{
		id: 'thisMonth',
		label: 'This Month',
		range: () => ({ start: ForgeDate.now().startOf('month'), end: ForgeDate.now().endOf('month') }),
	},
	{
		id: 'lastMonth',
		label: 'Last Month',
		range: () => ({
			start: ForgeDate.now().minus({ months: 1 }).startOf('month'),
			end: ForgeDate.now().minus({ months: 1 }).endOf('month'),
		}),
	},
	{
		id: 'thisYear',
		label: 'This Year',
		range: () => ({ start: ForgeDate.now().startOf('year'), end: ForgeDate.now().endOf('year') }),
	},
];

/**
 * Past-only presets for historic date filters. Every range ends at
 * yesterday or earlier — `past` is strictly before today, so backends
 * that reject the current day (e.g. shrinkage) accept all of them.
 * Use on widgets that read backward-looking data (historic charts,
 * shrinkage reports, etc.).
 */
export const pastDateRangePresets: DateRangePreset[] = [
	{
		id: 'yesterday',
		label: 'Yesterday',
		range: () => ({
			start: ForgeDate.now().minus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().minus({ days: 1 }).endOf('day'),
		}),
	},
	{
		id: 'last7',
		label: 'Last 7 Days',
		range: () => ({
			start: ForgeDate.now().minus({ days: 7 }).startOf('day'),
			end: ForgeDate.now().minus({ days: 1 }).endOf('day'),
		}),
	},
	{
		id: 'last30',
		label: 'Last 30 Days',
		range: () => ({
			start: ForgeDate.now().minus({ days: 30 }).startOf('day'),
			end: ForgeDate.now().minus({ days: 1 }).endOf('day'),
		}),
	},
	{
		id: 'weekToDate',
		label: 'Week to Date',
		range: () => ({
			start: ForgeDate.now().startOf('week'),
			end: ForgeDate.now().minus({ days: 1 }).endOf('day'),
		}),
	},
	{
		id: 'lastWeek',
		label: 'Last Week',
		range: () => ({
			start: ForgeDate.now().minus({ days: 7 }).startOf('week'),
			end: ForgeDate.now().minus({ days: 7 }).endOf('week'),
		}),
	},
	{
		id: 'monthToDate',
		label: 'Month to Date',
		range: () => ({
			start: ForgeDate.now().startOf('month'),
			end: ForgeDate.now().minus({ days: 1 }).endOf('day'),
		}),
	},
	{
		id: 'lastMonth',
		label: 'Last Month',
		range: () => ({
			start: ForgeDate.now().minus({ months: 1 }).startOf('month'),
			end: ForgeDate.now().minus({ months: 1 }).endOf('month'),
		}),
	},
	{
		id: 'yearToDate',
		label: 'Year to Date',
		range: () => ({
			start: ForgeDate.now().startOf('year'),
			end: ForgeDate.now().minus({ days: 1 }).endOf('day'),
		}),
	},
];

/**
 * Future-only presets for forecast date filters. Every range starts at
 * tomorrow or later — `future` is strictly after today, so backends that
 * only forecast forward (no current-day mixing) accept all of them. Use
 * on widgets that read forward-looking data (forecast charts, scheduling
 * projections, etc.).
 */
export const futureDateRangePresets: DateRangePreset[] = [
	{
		id: 'tomorrow',
		label: 'Tomorrow',
		range: () => ({
			start: ForgeDate.now().plus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().plus({ days: 1 }).endOf('day'),
		}),
	},
	{
		id: 'next7',
		label: 'Next 7 Days',
		range: () => ({
			start: ForgeDate.now().plus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().plus({ days: 7 }).endOf('day'),
		}),
	},
	{
		id: 'next30',
		label: 'Next 30 Days',
		range: () => ({
			start: ForgeDate.now().plus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().plus({ days: 30 }).endOf('day'),
		}),
	},
	{
		id: 'restOfWeek',
		label: 'Rest of Week',
		range: () => ({
			start: ForgeDate.now().plus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().endOf('week'),
		}),
	},
	{
		id: 'nextWeek',
		label: 'Next Week',
		range: () => ({
			start: ForgeDate.now().plus({ days: 7 }).startOf('week'),
			end: ForgeDate.now().plus({ days: 7 }).endOf('week'),
		}),
	},
	{
		id: 'restOfMonth',
		label: 'Rest of Month',
		range: () => ({
			start: ForgeDate.now().plus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().endOf('month'),
		}),
	},
	{
		id: 'nextMonth',
		label: 'Next Month',
		range: () => ({
			start: ForgeDate.now().plus({ months: 1 }).startOf('month'),
			end: ForgeDate.now().plus({ months: 1 }).endOf('month'),
		}),
	},
	{
		id: 'restOfYear',
		label: 'Rest of Year',
		range: () => ({
			start: ForgeDate.now().plus({ days: 1 }).startOf('day'),
			end: ForgeDate.now().endOf('year'),
		}),
	},
];

// Error styling is consumer-controlled via `error` prop / `variant="error"`
// (which flips `aria-invalid` on the trigger). We don't paint red on Reka's
// automatic `data-[invalid]` (set on empty model / first paint).
export const dateRangePickerFieldVariants = cva(
	[
		'flex w-fit select-none items-center justify-between rounded-md border bg-transparent shadow-xs',
		'transition-[color,box-shadow] outline-none',
		'border-input',
		'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/50',
		'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
		'disabled:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
	].join(' '),
	{
		variants: {
			variant: {
				default: '',
				error: 'border-destructive ring-2 ring-destructive/20',
			},
			size: {
				sm: 'h-7 px-2 text-sm',
				default: 'h-8 px-3 text-sm',
				lg: 'h-10 px-3 text-sm',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const dateRangePickerInputVariants = cva(
	[
		'rounded-sm p-0.5 outline-none transition-colors',
		'focus:bg-accent focus:text-accent-foreground',
		'data-[placeholder]:text-muted-foreground',
	].join(' '),
);

export const dateRangePickerTriggerVariants = cva(
	[
		'ml-2 inline-flex cursor-pointer items-center justify-center rounded-sm',
		'text-muted-foreground hover:text-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
);

// Reka UI applies inline floating-ui styles (position/transform) to the popover,
// so a `max-sm:fixed inset-x-0 bottom-0` bottom-sheet override does not actually
// stick — the inline styles win. Instead we let the popper position normally and
// just cap dimensions / allow overflow scrolling so it stays within the viewport
// at any width. Combined with `collision-padding` on the content, this keeps
// mobile usable. Consumers rendering 2 months should drop to 1 on narrow screens.
export const dateRangePickerContentVariants = cva(
	[
		'z-60 rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none',
		'max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-auto',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
	].join(' '),
);

export const dateRangePickerCalendarVariants = cva('p-4', {
	variants: {
		size: {
			sm: 'p-3',
			default: 'p-4',
			lg: 'p-5',
		},
	},
	defaultVariants: { size: 'default' },
});

export const dateRangePickerHeaderVariants = cva('flex items-center justify-between');

export const dateRangePickerHeadingVariants = cva('font-medium text-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

export const dateRangePickerSelectVariants = cva(
	[
		'appearance-none rounded-md border-none bg-transparent font-medium text-foreground outline-none cursor-pointer',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:cursor-not-allowed disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'px-1 py-0.5 text-xs',
				default: 'px-1 py-0.5 text-sm',
				lg: 'px-1.5 py-1 text-base',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const dateRangePickerNavButtonVariants = cva(
	[
		'inline-flex cursor-pointer items-center justify-center rounded-md',
		'bg-transparent text-muted-foreground',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-6',
				default: 'size-7',
				lg: 'size-8',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const dateRangePickerGridVariants = cva('border-collapse select-none space-y-1');

export const dateRangePickerHeadCellVariants = cva('rounded-md text-center text-muted-foreground', {
	variants: {
		size: {
			sm: 'w-7 text-2xs',
			default: 'w-8 text-xs',
			lg: 'w-9 text-sm',
		},
	},
	defaultVariants: { size: 'default' },
});

export const dateRangePickerCellVariants = cva('relative text-center', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

export const dateRangePickerCellTriggerVariants = cva(
	[
		'relative flex items-center justify-center rounded-md',
		'whitespace-nowrap font-normal outline-none transition-colors',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'data-[selected]:bg-accent data-[selected]:rounded-none',
		'data-[highlighted]:bg-accent data-[highlighted]:rounded-none',
		'data-[selection-start]:!bg-primary data-[selection-start]:text-primary-foreground data-[selection-start]:hover:bg-primary/90 data-[selection-start]:!rounded-md',
		'data-[selection-end]:!bg-primary data-[selection-end]:text-primary-foreground data-[selection-end]:hover:bg-primary/90 data-[selection-end]:!rounded-md',
		'data-[outside-view]:text-muted-foreground',
		'data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground data-[unavailable]:line-through',
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
		'before:absolute before:bottom-1 before:hidden before:size-1 before:rounded-full before:bg-primary',
		'data-[today]:before:block data-[selection-start]:before:bg-primary-foreground data-[selection-end]:before:bg-primary-foreground',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-7 text-xs',
				default: 'size-8 text-sm',
				lg: 'size-9 text-base',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export const dateRangePresetItemVariants = cva(
	[
		'w-full justify-start rounded-md px-3 py-1.5 text-left text-sm whitespace-nowrap',
		'text-muted-foreground',
		'data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:font-medium',
	].join(' '),
);

export type DateRangePickerVariants = VariantProps<typeof dateRangePickerFieldVariants>;
export type DateRangePickerSize = NonNullable<DateRangePickerVariants['size']>;
export type DateRangePickerVariant = NonNullable<DateRangePickerVariants['variant']>;
