import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VirtualScrollArea from './VirtualScrollArea.vue';

interface TestItem {
	id: number;
	label: string;
}

function createItems(count: number): TestItem[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		label: `Item ${i + 1}`,
	}));
}

describe('VirtualScrollArea', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(100), estimateSize: 40 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should have data-slot attribute', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(10), estimateSize: 40 },
			});
			expect(wrapper.find('[data-slot="virtual-scroll-area"]').exists()).toBe(true);
		});

		it('should render with empty items', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: [], estimateSize: 40 },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('props', () => {
		it('should accept custom class', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(10), estimateSize: 40, class: 'h-72 custom-class' },
			});
			expect(wrapper.find('[data-slot="virtual-scroll-area"]').classes()).toContain('custom-class');
		});

		it('should accept overscan prop', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(100), estimateSize: 40, overscan: 10 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept showScrollbar prop', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(10), estimateSize: 40, showScrollbar: false },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle large item count', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(10_000), estimateSize: 40 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle single item', () => {
			const wrapper = mount(VirtualScrollArea, {
				props: { items: createItems(1), estimateSize: 40 },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
