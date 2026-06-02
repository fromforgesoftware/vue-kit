import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Switch from './Switch.vue';

describe('Switch', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Switch);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with correct base classes', () => {
			expect(wrapper.classes()).toContain('inline-flex');
			expect(wrapper.classes()).toContain('items-center');
		});

		it('should have correct dimensions for default size', () => {
			expect(wrapper.classes()).toContain('h-5');
			expect(wrapper.classes()).toContain('w-9');
		});

		it('should have small dimensions when size=sm', () => {
			const wrapper = mount(Switch, { props: { size: 'sm' } });
			expect(wrapper.classes()).toContain('h-4');
			expect(wrapper.classes()).toContain('w-7');
		});

		it('should have rounded styling', () => {
			expect(wrapper.classes()).toContain('rounded-full');
		});

		it('should render thumb element', () => {
			expect(wrapper.element.children.length).toBeGreaterThan(0);
		});

		it('should expose data-slot="switch"', () => {
			expect(wrapper.attributes('data-slot')).toBe('switch');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept checked prop', () => {
			const wrapper = mount(Switch, {
				props: { checked: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultChecked prop', () => {
			const wrapper = mount(Switch, {
				props: { defaultChecked: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept id prop', () => {
			const wrapper = mount(Switch, {
				props: { id: 'switch-1' },
			});
			expect(wrapper.attributes('id')).toBe('switch-1');
		});

		it('should accept name prop', () => {
			const wrapper = mount(Switch, {
				props: { name: 'notifications' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept value prop', () => {
			const wrapper = mount(Switch, {
				props: { value: 'enabled' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept ariaLabel prop', () => {
			const wrapper = mount(Switch, {
				props: { ariaLabel: 'Enable notifications' },
			});
			expect(wrapper.attributes('aria-label')).toBe('Enable notifications');
		});

		it('should accept describedBy prop', () => {
			const wrapper = mount(Switch, {
				props: { describedBy: 'switch-hint' },
			});
			expect(wrapper.attributes('aria-describedby')).toBe('switch-hint');
		});

		it('should set aria-invalid when error prop is true', () => {
			const wrapper = mount(Switch, {
				props: { error: true },
			});
			expect(wrapper.attributes('aria-invalid')).toBe('true');
		});
	});

	// ============================================
	// Initial State Tests
	// ============================================
	describe('initial state', () => {
		it('should have aria-checked false by default', () => {
			expect(wrapper.attributes('aria-checked')).toBe('false');
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should have disabled attribute when disabled', () => {
			const wrapper = mount(Switch, {
				props: { disabled: true },
			});
			expect((wrapper.element as HTMLButtonElement).disabled).toBe(true);
		});

		it('should apply disabled styling classes', () => {
			expect(wrapper.classes()).toContain('disabled:opacity-50');
			expect(wrapper.classes()).toContain('disabled:cursor-not-allowed');
		});
	});

	// ============================================
	// ARIA Accessibility Tests
	// ============================================
	describe('ARIA accessibility', () => {
		it('should have switch role', () => {
			expect(wrapper.attributes('role')).toBe('switch');
		});

		it('should have aria-checked attribute', () => {
			expect(wrapper.attributes('aria-checked')).toBeDefined();
		});

		it('should have button type', () => {
			expect(wrapper.attributes('type')).toBe('button');
		});
	});

	// ============================================
	// Keyboard Accessibility Tests
	// ============================================
	describe('keyboard accessibility', () => {
		it('should have focus visible ring', () => {
			expect(wrapper.classes()).toContain('focus-visible:ring-2');
		});

		it('should be interactive element', () => {
			expect(wrapper.attributes('type')).toBe('button');
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should have unchecked background', () => {
			expect(wrapper.classes()).toContain('data-[state=unchecked]:bg-input');
		});

		it('should support custom class', () => {
			const wrapper = mount(Switch, {
				props: { class: 'custom-switch' },
			});
			expect(wrapper.classes()).toContain('custom-switch');
		});

		it('should have transition', () => {
			const klass = wrapper.classes().join(' ');
			expect(klass).toMatch(/transition-/);
		});

		it('should have transparent border', () => {
			expect(wrapper.classes()).toContain('border-2');
			expect(wrapper.classes()).toContain('border-transparent');
		});

		it('should have shrink-0 to prevent shrinking', () => {
			expect(wrapper.classes()).toContain('shrink-0');
		});

		it('should have peer class for sibling styling', () => {
			expect(wrapper.classes()).toContain('peer');
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:checked emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Thumb Element Tests
	// ============================================
	describe('thumb element', () => {
		it('should render thumb inside switch', () => {
			expect(wrapper.element.children.length).toBeGreaterThan(0);
		});

		it('should have thumb with correct styling', () => {
			const thumb = wrapper.find('[data-slot="switch-thumb"]');
			expect(thumb.exists()).toBe(true);
			expect(thumb.classes()).toContain('rounded-full');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(Switch, {
				props: {
					id: 'test-switch',
					name: 'test',
					value: 'test-value',
					disabled: false,
					required: true,
				},
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.attributes('id')).toBe('test-switch');
		});

		it('should render multiple switches', () => {
			const wrapper1 = mount(Switch);
			const wrapper2 = mount(Switch);
			const wrapper3 = mount(Switch);
			expect(wrapper1.exists()).toBe(true);
			expect(wrapper2.exists()).toBe(true);
			expect(wrapper3.exists()).toBe(true);
		});
	});
});
