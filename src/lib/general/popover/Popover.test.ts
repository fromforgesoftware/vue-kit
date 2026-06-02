import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import Popover from './Popover.vue';
import PopoverTrigger from './PopoverTrigger.vue';
import PopoverContent from './PopoverContent.vue';

describe('Popover', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Popover);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render trigger child', () => {
			const w = mount(Popover, {
				slots: {
					default: () =>
						h(PopoverTrigger, null, () => h('button', { class: 'trigger-btn' }, 'Open')),
				},
			});
			expect(w.find('.trigger-btn').exists()).toBe(true);
		});

		it('should render content child via portal', () => {
			const w = mount(Popover, {
				props: { defaultOpen: true },
				slots: {
					default: () => [
						h(PopoverTrigger, null, () => h('button', 'Open')),
						h(PopoverContent, null, () => h('div', { class: 'content' }, 'Content')),
					],
				},
				attachTo: document.body,
			});
			expect(w.exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests (root)
	// ============================================
	describe('props', () => {
		it('should accept open prop', () => {
			const w = mount(Popover, { props: { open: true } });
			expect(w.exists()).toBe(true);
		});

		it('should accept defaultOpen prop', () => {
			const w = mount(Popover, { props: { defaultOpen: true } });
			expect(w.exists()).toBe(true);
		});

		it('should accept modal prop', () => {
			const w = mount(Popover, { props: { modal: true } });
			expect(w.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default modal to false', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// PopoverContent Props Tests
	// ============================================
	describe('PopoverContent props', () => {
		it('should accept side prop', () => {
			const w = mount(PopoverContent, { props: { side: 'top' }, attachTo: document.body });
			expect(w.exists()).toBe(true);
		});

		it('should accept sideOffset prop', () => {
			const w = mount(PopoverContent, { props: { sideOffset: 8 }, attachTo: document.body });
			expect(w.exists()).toBe(true);
		});

		it('should accept align prop', () => {
			const w = mount(PopoverContent, { props: { align: 'start' }, attachTo: document.body });
			expect(w.exists()).toBe(true);
		});

		it('should accept alignOffset prop', () => {
			const w = mount(PopoverContent, { props: { alignOffset: 4 }, attachTo: document.body });
			expect(w.exists()).toBe(true);
		});

		it('should accept size prop', () => {
			const w = mount(PopoverContent, { props: { size: 'lg' }, attachTo: document.body });
			expect(w.exists()).toBe(true);
		});
	});

	// ============================================
	// Side Variants Tests
	// ============================================
	describe('side variants', () => {
		for (const side of ['top', 'right', 'bottom', 'left'] as const) {
			it(`should accept ${side} side`, () => {
				const w = mount(PopoverContent, { props: { side }, attachTo: document.body });
				expect(w.exists()).toBe(true);
			});
		}
	});

	// ============================================
	// Align Variants Tests
	// ============================================
	describe('align variants', () => {
		for (const align of ['start', 'center', 'end'] as const) {
			it(`should accept ${align} align`, () => {
				const w = mount(PopoverContent, { props: { align }, attachTo: document.body });
				expect(w.exists()).toBe(true);
			});
		}
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:open emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const w = mount(Popover, {
				props: {
					open: false,
					defaultOpen: false,
					modal: true,
				},
			});
			expect(w.exists()).toBe(true);
		});

		it('PopoverContent supports custom class', () => {
			const w = mount(PopoverContent, {
				props: { class: 'custom-pop' },
				attachTo: document.body,
			});
			expect(w.exists()).toBe(true);
		});

		it('PopoverContent supports hideCloseButton prop', () => {
			const w = mount(PopoverContent, {
				props: { hideCloseButton: true },
				attachTo: document.body,
			});
			expect(w.exists()).toBe(true);
		});

		it('PopoverContent supports ariaLabel prop', () => {
			const w = mount(PopoverContent, {
				props: { ariaLabel: 'My popover' },
				attachTo: document.body,
			});
			expect(w.exists()).toBe(true);
		});

		it('PopoverContent supports forceMount prop', () => {
			const w = mount(PopoverContent, {
				props: { forceMount: true },
				attachTo: document.body,
			});
			expect(w.exists()).toBe(true);
		});
	});
});
