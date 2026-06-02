import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { useDataTableState } from './useDataTableState.js';

describe('useDataTableState', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('uses the documented default page size (25) when no override is given', () => {
		const { pagination } = useDataTableState({ key: 'employees' });
		expect(pagination.value.pageSize).toBe(25);
	});

	it('honours an explicit defaultPageSize when provided', () => {
		const { pagination } = useDataTableState({
			key: 'employees',
			defaultPageSize: 50,
		});
		expect(pagination.value.pageSize).toBe(50);
	});

	it('persists page size changes back to localStorage under a stable key', async () => {
		const { pagination } = useDataTableState({ key: 'employees' });

		pagination.value = { ...pagination.value, pageSize: 100 };
		await nextTick();

		const raw = localStorage.getItem('trading-bot:datatable:employees:pageSize');
		expect(raw).toBe('100');
	});

	it('restores the previously-persisted page size on a subsequent mount', () => {
		localStorage.setItem('trading-bot:datatable:employees:pageSize', '75');

		const { pagination } = useDataTableState({ key: 'employees' });

		expect(pagination.value.pageSize).toBe(75);
	});

	it('does NOT restore pageIndex — revisiting the list lands on page 1', () => {
		localStorage.setItem('trading-bot:datatable:employees:pageIndex', '7');

		const { pagination } = useDataTableState({ key: 'employees' });

		expect(pagination.value.pageIndex).toBe(0);
	});

	it('persists sorting state under the per-key namespace', async () => {
		const { sorting } = useDataTableState({ key: 'employees' });

		sorting.value = [{ id: 'name', desc: false }];
		await nextTick();

		const raw = localStorage.getItem('trading-bot:datatable:employees:sorting');
		expect(raw).toBe(JSON.stringify([{ id: 'name', desc: false }]));
	});

	it('persists column visibility under the per-key namespace', async () => {
		const { columnVisibility } = useDataTableState({ key: 'employees' });

		columnVisibility.value = { externalID: false };
		await nextTick();

		const raw = localStorage.getItem('trading-bot:datatable:employees:visibility');
		expect(raw).toBe(JSON.stringify({ externalID: false }));
	});

	it('namespaces state per key so two tables never share storage', async () => {
		const a = useDataTableState({ key: 'employees', defaultPageSize: 10 });
		const b = useDataTableState({ key: 'leaves', defaultPageSize: 50 });

		a.pagination.value = { ...a.pagination.value, pageSize: 200 };
		await nextTick();

		expect(b.pagination.value.pageSize).toBe(50);
		expect(localStorage.getItem('trading-bot:datatable:employees:pageSize')).toBe('200');
		expect(localStorage.getItem('trading-bot:datatable:leaves:pageSize')).toBe('50');
	});
});
