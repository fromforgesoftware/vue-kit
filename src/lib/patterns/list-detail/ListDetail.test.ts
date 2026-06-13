import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ListDetail from './ListDetail.vue';
import ListDetailItem from './ListDetailItem.vue';
import ListDetailHeader from './ListDetailHeader.vue';

describe('ListDetailItem', () => {
	it('renders title and subtitle', () => {
		const w = mount(ListDetailItem, { props: { title: 'Checking', subtitle: 'Cash' } });
		expect(w.text()).toContain('Checking');
		expect(w.text()).toContain('Cash');
	});

	it('emits select on click', async () => {
		const w = mount(ListDetailItem, { props: { title: 'Checking' } });
		await w.find('[data-slot="list-detail-item"]').trigger('click');
		expect(w.emitted('select')).toHaveLength(1);
	});

	it('marks the active row', () => {
		const w = mount(ListDetailItem, { props: { title: 'Checking', active: true } });
		expect(w.find('[data-slot="list-detail-item"]').attributes('aria-current')).toBe('true');
	});

	it('renders leading and trailing slots', () => {
		const w = mount(ListDetailItem, {
			props: { title: 'Checking' },
			slots: { leading: '<span class="lead" />', trailing: '<span class="trail" />' },
		});
		expect(w.find('.lead').exists()).toBe(true);
		expect(w.find('.trail').exists()).toBe(true);
	});
});

describe('ListDetailHeader', () => {
	it('renders title, subtitle and actions', () => {
		const w = mount(ListDetailHeader, {
			props: { title: 'Checking', subtitle: 'EUR' },
			slots: { actions: '<button class="act">…</button>' },
		});
		expect(w.text()).toContain('Checking');
		expect(w.text()).toContain('EUR');
		expect(w.find('.act').exists()).toBe(true);
	});
});

// jsdom reports a 0-width viewport, so useResponsive resolves to the narrow
// (drill-down) layout. These cover the single-column behaviour; the two-pane
// layout is exercised visually in the Storybook story.
describe('ListDetail (narrow viewport)', () => {
	it('shows the list and no back button when nothing is selected', () => {
		const w = mount(ListDetail, {
			props: { selected: null },
			slots: {
				list: '<div class="rail">rail</div>',
				detail: '<div class="detail">detail</div>',
			},
		});
		expect(w.find('.rail').exists()).toBe(true);
		expect(w.find('.detail').exists()).toBe(false);
		expect(w.find('[data-slot="list-detail-back"]').exists()).toBe(false);
	});

	it('drills into the detail with a back button when an item is selected', () => {
		const w = mount(ListDetail, {
			props: { selected: 'acc-1' },
			slots: {
				list: '<div class="rail">rail</div>',
				detail: '<div class="detail">detail</div>',
			},
		});
		expect(w.find('.detail').exists()).toBe(true);
		expect(w.find('[data-slot="list-detail-back"]').exists()).toBe(true);
	});

	it('emits back when the back button is pressed', async () => {
		const w = mount(ListDetail, {
			props: { selected: 'acc-1' },
			slots: { list: '<div>rail</div>', detail: '<div>detail</div>' },
		});
		await w.find('[data-slot="list-detail-back"]').trigger('click');
		expect(w.emitted('back')).toHaveLength(1);
	});
});
