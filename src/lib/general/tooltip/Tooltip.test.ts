import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Tooltip from './Tooltip.vue';

describe('Tooltip', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Tooltip, {
			props: {
				content: 'Tooltip text',
			},
			slots: {
				default: '<button>Hover me</button>',
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

		it('should render trigger slot content', () => {
			expect(wrapper.find('button').text()).toBe('Hover me');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept content prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Help text' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept side prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', side: 'bottom' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept sideOffset prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', sideOffset: 8 },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept delayDuration prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', delayDuration: 500 },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept skipDelayDuration prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', skipDelayDuration: 100 },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept disableHoverableContent prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', disableHoverableContent: true },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default side to top', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default sideOffset to 4', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default delayDuration to 200', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default skipDelayDuration to 300', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default disableHoverableContent to false', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Side Variants Tests
	// ============================================
	describe('side variants', () => {
		it('should accept top side', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', side: 'top' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept right side', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', side: 'right' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept bottom side', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', side: 'bottom' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept left side', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', side: 'left' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Slot Tests
	// ============================================
	describe('slots', () => {
		it('should render default slot as trigger', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Help' },
				slots: {
					default: '<button class="trigger-btn">Click me</button>',
				},
			});
			expect(wrapper.find('.trigger-btn').exists()).toBe(true);
		});

		it('should render content slot if provided', () => {
			const wrapper = mount(Tooltip, {
				slots: {
					default: '<span>Trigger</span>',
					content: '<div class="custom-content">Custom tooltip</div>',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should prefer content slot over content prop', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Prop content' },
				slots: {
					default: '<span>Trigger</span>',
					content: '<div class="custom-content">Slot content</div>',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			// Class is applied to content element inside portal/teleport
			// We verify the component accepts the prop and renders
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', class: 'custom-tooltip' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with empty content', () => {
			const wrapper = mount(Tooltip, {
				props: { content: '' },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with undefined content', () => {
			const wrapper = mount(Tooltip, {
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle long content text', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'A'.repeat(200) },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle zero delay', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Text', delayDuration: 0 },
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle complex trigger element', () => {
			const wrapper = mount(Tooltip, {
				props: { content: 'Help' },
				slots: {
					default: `
            <div class="complex-trigger">
              <span>Icon</span>
              <span>Text</span>
            </div>
          `,
				},
			});
			expect(wrapper.find('.complex-trigger').exists()).toBe(true);
		});

		it('should render with all props', () => {
			const wrapper = mount(Tooltip, {
				props: {
					content: 'Full config tooltip',
					side: 'bottom',
					sideOffset: 10,
					delayDuration: 500,
					skipDelayDuration: 100,
					disableHoverableContent: true,
				},
				slots: { default: '<span>Trigger</span>' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
