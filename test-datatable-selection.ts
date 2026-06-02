import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DataTable from './src/lib/organisms/data-table/DataTable.vue';

describe('DataTable Logic', () => {
	it('selects all', async () => {
		const dataSource = { data: [{ id: 1 }, { id: 2 }], totalCount: 2 };
		const columns = [{ key: 'id', header: 'ID' }];
		const wrapper = mount(DataTable, { props: { columns, dataSource, selectable: true } });

		const headerCheckbox = wrapper.find('th [role="checkbox"]');
		await headerCheckbox.trigger('click');

		// Wait for Vue's next tick
		await wrapper.vm.$nextTick();

		const rowCheckboxes = wrapper.findAll('td [role="checkbox"]');
		console.log('Header checked state:', headerCheckbox.attributes('data-state'));
		console.log('Row 0 checked state:', rowCheckboxes[0].attributes('data-state'));
		console.log('Row 1 checked state:', rowCheckboxes[1].attributes('data-state'));
	});
});
