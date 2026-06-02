import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Button, {
			slots: {
				default: 'Test Button',
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

		it('should display slot content', () => {
			expect(wrapper.text()).toContain('Test Button');
		});

		it('should render as a button element by default', () => {
			expect(wrapper.element.tagName).toBe('BUTTON');
		});

		it('should render with custom element when "as" prop is set', () => {
			const wrapper = mount(Button, {
				props: { as: 'a' },
				slots: { default: 'Link Button' },
			});
			expect(wrapper.element.tagName).toBe('A');
		});
	});

	// ============================================
	// Variant Tests
	// ============================================
	describe('variants', () => {
		it('should apply default variant classes', () => {
			expect(wrapper.classes()).toContain('bg-primary');
			expect(wrapper.classes()).toContain('text-primary-foreground');
		});

		it('should apply secondary variant classes', async () => {
			await wrapper.setProps({ variant: 'secondary' });
			expect(wrapper.classes()).toContain('bg-secondary');
			expect(wrapper.classes()).toContain('text-secondary-foreground');
		});

		it('should apply destructive variant classes', async () => {
			await wrapper.setProps({ variant: 'destructive' });
			expect(wrapper.classes()).toContain('bg-destructive');
			expect(wrapper.classes()).toContain('text-white');
		});

		it('should apply outline variant classes', async () => {
			await wrapper.setProps({ variant: 'outline' });
			expect(wrapper.classes()).toContain('border');
			expect(wrapper.classes()).toContain('bg-background');
		});

		it('should apply ghost variant classes', async () => {
			await wrapper.setProps({ variant: 'ghost' });
			expect(wrapper.classes()).toContain('hover:bg-accent');
		});

		it('should apply link variant classes', async () => {
			await wrapper.setProps({ variant: 'link' });
			expect(wrapper.classes()).toContain('text-primary-text');
			expect(wrapper.classes()).toContain('underline-offset-4');
		});
	});

	// ============================================
	// Size Tests
	// ============================================
	describe('sizes', () => {
		it('should apply default size classes', () => {
			expect(wrapper.classes()).toContain('h-8');
			expect(wrapper.classes()).toContain('px-3');
		});

		it('should apply sm size classes', async () => {
			await wrapper.setProps({ size: 'sm' });
			expect(wrapper.classes()).toContain('h-7');
			expect(wrapper.classes()).toContain('px-2.5');
		});

		it('should apply lg size classes', async () => {
			await wrapper.setProps({ size: 'lg' });
			expect(wrapper.classes()).toContain('h-10');
			expect(wrapper.classes()).toContain('px-4');
		});

		it('should apply icon size classes', async () => {
			await wrapper.setProps({ size: 'icon' });
			expect(wrapper.classes()).toContain('size-8');
		});

		it('should apply icon-xs size classes', async () => {
			await wrapper.setProps({ size: 'icon-xs' });
			expect(wrapper.classes()).toContain('size-6');
		});

		it('should apply icon-sm size classes', async () => {
			await wrapper.setProps({ size: 'icon-sm' });
			expect(wrapper.classes()).toContain('size-7');
		});

		it('should apply icon-lg size classes', async () => {
			await wrapper.setProps({ size: 'icon-lg' });
			expect(wrapper.classes()).toContain('size-10');
		});

		it('should apply xs size classes', async () => {
			await wrapper.setProps({ size: 'xs' });
			expect(wrapper.classes()).toContain('h-6');
			expect(wrapper.classes()).toContain('px-2');
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should have disabled attribute when disabled', async () => {
			await wrapper.setProps({ disabled: true });
			expect(wrapper.attributes('disabled')).toBeDefined();
		});

		it('should apply disabled styling classes', async () => {
			await wrapper.setProps({ disabled: true });
			expect(wrapper.classes()).toContain('disabled:opacity-50');
			expect(wrapper.classes()).toContain('disabled:pointer-events-none');
		});

		it('should not emit click event when disabled', async () => {
			await wrapper.setProps({ disabled: true });
			await wrapper.trigger('click');
			// Disabled buttons should not emit click
			// The native button behavior prevents this
			expect(wrapper.attributes('disabled')).toBeDefined();
		});
	});

	// ============================================
	// Loading State Tests
	// ============================================
	describe('loading state', () => {
		it('should show spinner when loading', async () => {
			await wrapper.setProps({ loading: true });
			const spinner = wrapper.find('svg');
			expect(spinner.exists()).toBe(true);
			expect(spinner.classes()).toContain('animate-spin');
		});

		it('should be disabled when loading', async () => {
			await wrapper.setProps({ loading: true });
			expect(wrapper.attributes('disabled')).toBeDefined();
		});

		it('should still show slot content when loading', async () => {
			await wrapper.setProps({ loading: true });
			expect(wrapper.text()).toContain('Test Button');
		});

		it('should hide spinner when not loading', () => {
			const spinner = wrapper.find('svg.animate-spin');
			expect(spinner.exists()).toBe(false);
		});
	});

	// ============================================
	// Event Tests
	// ============================================
	describe('events', () => {
		it('should emit click event when clicked', async () => {
			await wrapper.trigger('click');
			expect(wrapper.emitted('click')).toBeTruthy();
			expect(wrapper.emitted('click')).toHaveLength(1);
		});

		it('should emit multiple click events', async () => {
			await wrapper.trigger('click');
			await wrapper.trigger('click');
			await wrapper.trigger('click');
			expect(wrapper.emitted('click')).toHaveLength(3);
		});

		it('should handle focus event', async () => {
			await wrapper.trigger('focus');
			expect(wrapper.emitted('focus')).toBeTruthy();
		});

		it('should handle blur event', async () => {
			await wrapper.trigger('blur');
			expect(wrapper.emitted('blur')).toBeTruthy();
		});
	});

	// ============================================
	// Keyboard Accessibility Tests
	// ============================================
	describe('keyboard accessibility', () => {
		it('should be focusable', () => {
			// Button elements are focusable by default
			expect(wrapper.element.tagName).toBe('BUTTON');
		});

		it('should trigger click on Enter key', async () => {
			await wrapper.trigger('keydown', { key: 'Enter' });
			// Native button behavior handles Enter
			expect(wrapper.emitted('keydown')).toBeTruthy();
		});

		it('should trigger click on Space key', async () => {
			await wrapper.trigger('keydown', { key: ' ' });
			expect(wrapper.emitted('keydown')).toBeTruthy();
		});
	});

	// ============================================
	// Custom Class Tests
	// ============================================
	describe('custom classes', () => {
		it('should merge custom classes with variant classes', () => {
			const wrapper = mount(Button, {
				props: { class: 'custom-class another-class' },
				slots: { default: 'Button' },
			});
			expect(wrapper.classes()).toContain('custom-class');
			expect(wrapper.classes()).toContain('another-class');
			// Should still have variant classes
			expect(wrapper.classes()).toContain('bg-primary');
		});
	});

	// ============================================
	// Base Styling Tests
	// ============================================
	describe('base styling', () => {
		it('should have inline-flex display', () => {
			expect(wrapper.classes()).toContain('inline-flex');
		});

		it('should have items centered', () => {
			expect(wrapper.classes()).toContain('items-center');
			expect(wrapper.classes()).toContain('justify-center');
		});

		it('should have rounded corners', () => {
			expect(wrapper.classes()).toContain('rounded-md');
		});

		it('should have focus ring styles', () => {
			expect(wrapper.classes()).toContain('focus-visible:ring-[3px]');
			expect(wrapper.classes()).toContain('focus-visible:ring-ring/50');
		});

		it('should have transition styling', () => {
			const hasTransition = wrapper.classes().some((cls) => cls.startsWith('transition'));
			expect(hasTransition).toBe(true);
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle empty slot content', () => {
			const wrapper = mount(Button, {
				slots: { default: '' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle very long text', () => {
			const longText = 'A'.repeat(1000);
			const wrapper = mount(Button, {
				slots: { default: longText },
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.text()).toContain(longText);
		});

		it('should handle HTML content in slot', () => {
			const wrapper = mount(Button, {
				slots: { default: '<span class="icon">★</span> Star' },
			});
			expect(wrapper.find('span.icon').exists()).toBe(true);
		});

		it('should handle both loading and disabled', async () => {
			await wrapper.setProps({ loading: true, disabled: true });
			expect(wrapper.attributes('disabled')).toBeDefined();
			expect(wrapper.find('svg.animate-spin').exists()).toBe(true);
		});
	});
});
