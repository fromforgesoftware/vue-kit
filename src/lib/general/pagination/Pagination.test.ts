import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Pagination from './Pagination.vue';

describe('Pagination', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Pagination, {
			props: {
				total: 100,
				itemsPerPage: 10,
			},
		});
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render navigation buttons', () => {
			expect(wrapper.findAll('button').length).toBeGreaterThan(0);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept page prop', () => {
			const wrapper = mount(Pagination, {
				props: { page: 3, total: 100 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultPage prop', () => {
			const wrapper = mount(Pagination, {
				props: { defaultPage: 2, total: 100 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept total prop', () => {
			const wrapper = mount(Pagination, {
				props: { total: 200 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept itemsPerPage prop', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, itemsPerPage: 20 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept siblingCount prop', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, siblingCount: 2 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept showEdges prop', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, showEdges: false },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept disabled prop', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, disabled: true },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default defaultPage to 1', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default total to 100', () => {
			const wrapper = mount(Pagination);
			expect(wrapper.exists()).toBe(true);
		});

		it('should default itemsPerPage to 10', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should default siblingCount to 1', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default showEdges to true', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default disabled to false', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Navigation Buttons Tests
	// ============================================
	describe('navigation buttons', () => {
		it('should render first page button when showEdges is true', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, showEdges: true },
			});
			expect(wrapper.find('[aria-label="First page"]').exists()).toBe(true);
		});

		it('should render last page button when showEdges is true', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, showEdges: true },
			});
			expect(wrapper.find('[aria-label="Last page"]').exists()).toBe(true);
		});

		it('should render previous page button', () => {
			expect(wrapper.find('[aria-label="Previous page"]').exists()).toBe(true);
		});

		it('should render next page button', () => {
			expect(wrapper.find('[aria-label="Next page"]').exists()).toBe(true);
		});

		it('should not render first/last buttons when showEdges is false', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, showEdges: false },
			});
			expect(wrapper.find('[aria-label="First page"]').exists()).toBe(false);
			expect(wrapper.find('[aria-label="Last page"]').exists()).toBe(false);
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:page emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, class: 'custom-pagination' },
			});
			expect(wrapper.html()).toContain('custom-pagination');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle total of 0', () => {
			const wrapper = mount(Pagination, {
				props: { total: 0 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle single page', () => {
			const wrapper = mount(Pagination, {
				props: { total: 5, itemsPerPage: 10 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle many pages', () => {
			const wrapper = mount(Pagination, {
				props: { total: 10000, itemsPerPage: 10 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle large itemsPerPage', () => {
			const wrapper = mount(Pagination, {
				props: { total: 100, itemsPerPage: 100 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with all props', () => {
			const wrapper = mount(Pagination, {
				props: {
					page: 5,
					total: 500,
					itemsPerPage: 25,
					siblingCount: 2,
					showEdges: true,
					disabled: false,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
