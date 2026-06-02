import { cva, type VariantProps } from 'class-variance-authority';
import { ForgeDate } from '@fromforgesoftware/ts-kit';

/** Preset shortcut shown in the date-picker sidebar (e.g. "Today", "Yesterday"). */
export interface DatePickerPreset {
	id: string;
	label: string;
	date: () => ForgeDate;
}

/** Built-in presets — Today, Yesterday, Tomorrow. Override via `:presets`. */
export const defaultDatePickerPresets: DatePickerPreset[] = [
	{
		id: 'today',
		label: 'Today',
		date: () => ForgeDate.now(),
	},
	{
		id: 'yesterday',
		label: 'Yesterday',
		date: () => ForgeDate.now().minus({ days: 1 }),
	},
	{
		id: 'tomorrow',
		label: 'Tomorrow',
		date: () => ForgeDate.now().plus({ days: 1 }),
	},
	{
		id: 'startOfWeek',
		label: 'Start of Week',
		date: () => ForgeDate.now().startOf('week'),
	},
	{
		id: 'endOfWeek',
		label: 'End of Week',
		date: () => ForgeDate.now().endOf('week'),
	},
	{
		id: 'startOfMonth',
		label: 'Start of Month',
		date: () => ForgeDate.now().startOf('month'),
	},
	{
		id: 'endOfMonth',
		label: 'End of Month',
		date: () => ForgeDate.now().endOf('month'),
	},
];

export const defaultWeekPickerPresets: DatePickerPreset[] = [
	{
		id: 'thisWeek',
		label: 'This Week',
		date: () => ForgeDate.now().startOf('week'),
	},
	{
		id: 'lastWeek',
		label: 'Last Week',
		date: () => ForgeDate.now().minus({ days: 7 }).startOf('week'),
	},
	{
		id: 'nextWeek',
		label: 'Next Week',
		date: () => ForgeDate.now().plus({ days: 7 }).startOf('week'),
	},
	{
		id: 'firstWeekOfMonth',
		label: 'First Week of Month',
		date: () => ForgeDate.now().startOf('month'),
	},
	{
		id: 'lastWeekOfMonth',
		label: 'Last Week of Month',
		date: () => ForgeDate.now().endOf('month').startOf('week'),
	},
];

/**
 * Field-style trigger: a row of segments + a calendar-icon button. Error
 * styling is opt-in via `variant="error"`, not Reka's `data-[invalid]`
 * (which fires on any empty model — see DateField for the same rationale).
 */
// (which flips `aria-invalid` on the trigger). We don't paint red on Reka's
// automatic `data-[invalid]` because Reka sets it on empty model / first
// paint, which would make every freshly-mounted picker look broken.
export const datePickerFieldVariants = cva(
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

export const datePickerInputVariants = cva(
	[
		'rounded-sm p-0.5 outline-none transition-colors',
		'focus:bg-accent focus:text-accent-foreground',
		'data-[placeholder]:text-muted-foreground',
	].join(' '),
);

// Calendar icon button inside the field. Visually a flat icon button — the
// surrounding field provides the focus ring.
export const datePickerTriggerVariants = cva(
	[
		'ml-2 inline-flex cursor-pointer items-center justify-center rounded-sm',
		'text-muted-foreground hover:text-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
		'disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
);

// Reka's DatePickerContent uses floating-ui, which writes inline position/
// transform styles that beat any Tailwind `max-sm:fixed inset-x-0 bottom-0`
// override (the previous bottom-sheet attempt). Instead we cap the popover's
// width/height to the viewport so it stays usable at any size, and rely on
// `collision-padding` on the Content tag to keep it on-screen. Day cells stay
// at 44 × 44 below `sm` (see `datePickerCellTriggerVariants`) for touch.
export const datePickerContentVariants = cva(
	[
		'z-60 rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none',
		'max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-2rem)] overflow-auto',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
	].join(' '),
);

export const datePickerCalendarVariants = cva('p-4', {
	variants: {
		size: {
			sm: 'p-3',
			default: 'p-4',
			lg: 'p-5',
		},
	},
	defaultVariants: { size: 'default' },
});

export const datePickerHeaderVariants = cva('flex items-center justify-between');

export const datePickerHeadingVariants = cva('font-medium text-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

export const datePickerSelectVariants = cva(
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

// Nav button (prev/next month). Meets WCAG 2.5.8 (≥ 24×24) at every size.
export const datePickerNavButtonVariants = cva(
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

export const datePickerGridVariants = cva('border-collapse select-none space-y-1');

export const datePickerHeadCellVariants = cva('rounded-md text-center text-muted-foreground', {
	variants: {
		size: {
			sm: 'w-7 text-2xs',
			default: 'w-8 text-xs',
			lg: 'w-9 text-sm',
		},
	},
	defaultVariants: { size: 'default' },
});

export const datePickerCellVariants = cva('relative text-center', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

// Day-cell trigger. Every size meets WCAG 2.5.8 ≥ 24×24 (`sm` is 28 px,
// `default` 32 px, `lg` 36 px). Sizes are identical across viewports so the
// calendar grid layout doesn't reflow on rotation.
export const datePickerCellTriggerVariants = cva(
	[
		'relative flex items-center justify-center rounded-md',
		'whitespace-nowrap font-normal outline-none transition-colors',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring/50',
		'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary/90',
		'data-[outside-view]:text-muted-foreground',
		'data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground data-[unavailable]:line-through',
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
		'data-[highlighted]:bg-accent',
		'before:absolute before:bottom-1 before:hidden before:size-1 before:rounded-full before:bg-primary',
		'data-[today]:before:block data-[selected]:before:bg-primary-foreground',
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

export const datePickerPresetItemVariants = cva(
	[
		'w-full justify-start rounded-md px-3 py-1.5 text-left text-sm whitespace-nowrap',
		'text-muted-foreground',
		'data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:font-medium',
	].join(' '),
);

export type DatePickerVariants = VariantProps<typeof datePickerFieldVariants>;
export type DatePickerSize = NonNullable<DatePickerVariants['size']>;
export type DatePickerVariant = NonNullable<DatePickerVariants['variant']>;
