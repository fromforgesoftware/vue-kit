import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Table from './Table.vue';

describe('Table', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Table);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render wrapper div', () => {
			expect(wrapper.element.tagName).toBe('DIV');
		});

		it('should render table element', () => {
			expect(wrapper.find('table').exists()).toBe(true);
		});

		it('should have overflow wrapper', () => {
			expect(wrapper.classes()).toContain('overflow-auto');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept class prop', () => {
			const wrapper = mount(Table, {
				props: { class: 'custom-table' },
			});
			expect(wrapper.find('table').classes()).toContain('custom-table');
		});
	});

	// ============================================
	// Slot Tests
	// ============================================
	describe('slots', () => {
		it('should render slot content', () => {
			const wrapper = mount(Table, {
				slots: {
					default: '<thead><tr><th>Header</th></tr></thead>',
				},
			});
			expect(wrapper.find('th').text()).toBe('Header');
		});

		it('should render full table structure', () => {
			const wrapper = mount(Table, {
				slots: {
					default: `
            <thead>
              <tr><th>Name</th><th>Age</th></tr>
            </thead>
            <tbody>
              <tr><td>John</td><td>30</td></tr>
              <tr><td>Jane</td><td>25</td></tr>
            </tbody>
          `,
				},
			});
			expect(wrapper.findAll('th')).toHaveLength(2);
			expect(wrapper.findAll('td')).toHaveLength(4);
			expect(wrapper.findAll('tr')).toHaveLength(3);
		});

		it('should render tbody content', () => {
			const wrapper = mount(Table, {
				slots: {
					default: '<tbody><tr><td>Cell</td></tr></tbody>',
				},
			});
			expect(wrapper.find('td').text()).toBe('Cell');
		});

		it('should render tfoot content', () => {
			const wrapper = mount(Table, {
				slots: {
					default: '<tfoot><tr><td>Footer</td></tr></tfoot>',
				},
			});
			expect(wrapper.find('tfoot').exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should have relative positioning on wrapper', () => {
			expect(wrapper.classes()).toContain('relative');
		});

		it('should have full width on wrapper', () => {
			expect(wrapper.classes()).toContain('w-full');
		});

		it('should support custom class on table', () => {
			const wrapper = mount(Table, {
				props: { class: 'striped-table' },
			});
			expect(wrapper.find('table').classes()).toContain('striped-table');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render empty table', () => {
			const wrapper = mount(Table);
			expect(wrapper.find('table').exists()).toBe(true);
		});

		it('should handle many rows', () => {
			const rows = Array.from({ length: 100 }, (_, i) => `<tr><td>Row ${i}</td></tr>`).join('');
			const wrapper = mount(Table, {
				slots: {
					default: `<tbody>${rows}</tbody>`,
				},
			});
			expect(wrapper.findAll('tr')).toHaveLength(100);
		});

		it('should handle many columns', () => {
			const headers = Array.from({ length: 20 }, (_, i) => `<th>Col ${i}</th>`).join('');
			const wrapper = mount(Table, {
				slots: {
					default: `<thead><tr>${headers}</tr></thead>`,
				},
			});
			expect(wrapper.findAll('th')).toHaveLength(20);
		});

		it('should handle nested tables', () => {
			const wrapper = mount(Table, {
				slots: {
					default: `
            <tbody>
              <tr>
                <td>
                  <table class="nested-table">
                    <tr><td>Nested</td></tr>
                  </table>
                </td>
              </tr>
            </tbody>
          `,
				},
			});
			expect(wrapper.findAll('table')).toHaveLength(2);
		});

		it('should handle colspan and rowspan', () => {
			const wrapper = mount(Table, {
				slots: {
					default: `
            <thead>
              <tr><th colspan="2">Merged Header</th></tr>
            </thead>
            <tbody>
              <tr><td rowspan="2">Merged Cell</td><td>Cell 1</td></tr>
              <tr><td>Cell 2</td></tr>
            </tbody>
          `,
				},
			});
			expect(wrapper.find('th[colspan="2"]').exists()).toBe(true);
			expect(wrapper.find('td[rowspan="2"]').exists()).toBe(true);
		});
	});
});
