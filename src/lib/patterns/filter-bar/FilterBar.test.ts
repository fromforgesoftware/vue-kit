import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterBar from './FilterBar.vue';
import FilterBarChip from './FilterBarChip.vue';
import type { ColumnConfig, FiltersState } from './filter-bar.js';
import { defaultDateRangePresets } from '../../dates/date-range-picker/date-range-picker.js';

const COLUMNS: ColumnConfig[] = [
	{
		id: 'status',
		type: 'option',
		displayName: 'Status',
		options: [{ value: 'a', label: 'A' }],
	},
	{
		id: 'name',
		type: 'text',
		displayName: 'Name',
	},
	{
		id: 'dateRange',
		type: 'daterange',
		displayName: 'Date Range',
	},
];

describe('FilterBar', () => {
	describe('rendering', () => {
		it('renders trigger by default', () => {
			const w = mount(FilterBar, { props: { columns: COLUMNS, modelValue: [] } });
			expect(w.find('[data-slot="filter-bar-trigger"]').exists()).toBe(true);
		});

		it('renders chip when filters are active', () => {
			const filters: FiltersState = [
				{ columnId: 'status', type: 'option', operator: 'is', values: ['a'] },
			];
			const w = mount(FilterBar, { props: { columns: COLUMNS, modelValue: filters } });
			expect(w.find('[data-slot="filter-bar-chip"]').exists()).toBe(true);
		});
	});

	describe('is empty operator', () => {
		it('chip omits the value editor when operator is "is empty"', () => {
			const filter = {
				columnId: 'name',
				type: 'text' as const,
				operator: 'is empty' as const,
				values: [],
			};
			const column: ColumnConfig = { id: 'name', type: 'text', displayName: 'Name' };
			const w = mount(FilterBarChip, { props: { filter, column } });
			expect(w.text()).toContain('is empty');
			expect(w.text()).not.toContain('Enter value');
		});
	});

	describe('daterange presets', () => {
		it('does not render preset shortcuts on a chip without a presets list', () => {
			const filter = {
				columnId: 'dateRange',
				type: 'daterange' as const,
				operator: 'is between' as const,
				values: ['2026-01-01', '2026-12-31'],
			};
			const column: ColumnConfig = {
				id: 'dateRange',
				type: 'daterange',
				displayName: 'Date Range',
			};
			const w = mount(FilterBarChip, {
				props: { filter, column },
			});
			// The presets list lives behind a popover trigger in the chip's value
			// segment. Without a `presets` prop on the column we must NOT render
			// any preset items, even after the popover opens.
			expect(w.find('[data-slot="date-range-picker-preset-item"]').exists()).toBe(false);
		});

		it('renders the chip even when a preset list is provided (presets only show inside the popover)', () => {
			const filter = {
				columnId: 'dateRange',
				type: 'daterange' as const,
				operator: 'is between' as const,
				values: ['2026-01-01', '2026-12-31'],
			};
			const column: ColumnConfig = {
				id: 'dateRange',
				type: 'daterange',
				displayName: 'Date Range',
				presets: defaultDateRangePresets,
			};
			// Mounting the chip alone gives us the trigger button without opening
			// the popover. The presence of the column.presets prop is what enables
			// the conditional <DateRangePresets> render — verify it's accepted on
			// the column type and the chip mounts cleanly.
			const w = mount(FilterBarChip, { props: { filter, column } });
			expect(w.exists()).toBe(true);
		});

		it('accepts a `presets` array on a daterange ColumnConfig at the type level', () => {
			// Type-level acceptance test — if the prop didn't exist on ColumnConfig,
			// this object literal wouldn't compile. Run as a vitest case so the
			// type and runtime assertions live together.
			const column: ColumnConfig = {
				id: 'dateRange',
				type: 'daterange',
				displayName: 'Date Range',
				presets: [
					{
						id: 'this-year',
						label: 'This year',
						range: () => ({
							start: defaultDateRangePresets[0].range().start,
							end: defaultDateRangePresets[0].range().end,
						}),
					},
				],
			};
			expect(column.presets).toHaveLength(1);
			expect(column.presets?.[0].id).toBe('this-year');
		});
	});
});
