import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekdaysPicker from './WeekdaysPicker.vue';
import type { WeekdayValue } from './weekdays-picker.js';

describe('WeekdaysPicker', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(WeekdaysPicker);
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as fieldset', () => {
			const wrapper = mount(WeekdaysPicker);
			expect(wrapper.element.tagName).toBe('FIELDSET');
		});

		it('should have data-slot attribute', () => {
			const wrapper = mount(WeekdaysPicker);
			expect(wrapper.attributes('data-slot')).toBe('weekdays-picker');
		});

		it('should render 7 day buttons', () => {
			const wrapper = mount(WeekdaysPicker);
			const buttons = wrapper.findAll('button');
			expect(buttons).toHaveLength(7);
		});

		it('should display day abbreviations in Mon-Sun order', () => {
			const wrapper = mount(WeekdaysPicker);
			const buttons = wrapper.findAll('button');
			const labels = buttons.map((b) => b.text());
			expect(labels).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
		});
	});

	describe('selection', () => {
		it('should show selected state for model value days', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { modelValue: [1, 3, 5] as WeekdayValue[] },
			});
			const buttons = wrapper.findAll('button');
			expect(buttons[0].attributes('aria-checked')).toBe('true'); // Monday
			expect(buttons[1].attributes('aria-checked')).toBe('false'); // Tuesday
			expect(buttons[2].attributes('aria-checked')).toBe('true'); // Wednesday
			expect(buttons[4].attributes('aria-checked')).toBe('true'); // Friday
		});

		it('should toggle day on click', async () => {
			const wrapper = mount(WeekdaysPicker, {
				props: {
					modelValue: [1] as WeekdayValue[],
					'onUpdate:modelValue': (v: WeekdayValue[]) => wrapper.setProps({ modelValue: v }),
				},
			});
			// Click Tuesday (index 1, value 2)
			await wrapper.findAll('button')[1].trigger('click');
			expect(wrapper.props('modelValue')).toContain(2);
		});

		it('should deselect day on click when selected', async () => {
			const wrapper = mount(WeekdaysPicker, {
				props: {
					modelValue: [1, 2] as WeekdayValue[],
					'onUpdate:modelValue': (v: WeekdayValue[]) => wrapper.setProps({ modelValue: v }),
				},
			});
			// Click Monday (index 0, value 1) to deselect
			await wrapper.findAll('button')[0].trigger('click');
			expect(wrapper.props('modelValue')).not.toContain(1);
		});

		it('should respect minSelection', async () => {
			const wrapper = mount(WeekdaysPicker, {
				props: {
					modelValue: [1] as WeekdayValue[],
					minSelection: 1,
					'onUpdate:modelValue': (v: WeekdayValue[]) => wrapper.setProps({ modelValue: v }),
				},
			});
			// Try to deselect the only selected day
			await wrapper.findAll('button')[0].trigger('click');
			expect(wrapper.props('modelValue')).toContain(1);
		});
	});

	describe('readonly', () => {
		it('should not toggle on click when readonly', async () => {
			const wrapper = mount(WeekdaysPicker, {
				props: {
					modelValue: [1] as WeekdayValue[],
					readonly: true,
					'onUpdate:modelValue': (v: WeekdayValue[]) => wrapper.setProps({ modelValue: v }),
				},
			});
			await wrapper.findAll('button')[1].trigger('click');
			expect(wrapper.props('modelValue')).toEqual([1]);
		});

		it('should set tabindex to -1 when readonly', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { readonly: true },
			});
			const buttons = wrapper.findAll('button');
			buttons.forEach((b) => {
				expect(b.attributes('tabindex')).toBe('-1');
			});
		});
	});

	describe('disabled', () => {
		it('should disable all buttons when disabled', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { disabled: true },
			});
			const buttons = wrapper.findAll('button');
			buttons.forEach((b) => {
				expect(b.attributes('disabled')).toBeDefined();
			});
		});
	});

	describe('accessibility', () => {
		it('should have role group on fieldset', () => {
			const wrapper = mount(WeekdaysPicker);
			expect(wrapper.attributes('role')).toBe('group');
		});

		it('should have aria-label on fieldset', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { label: 'Work days' },
			});
			expect(wrapper.attributes('aria-label')).toBe('Work days');
		});

		it('should have sr-only legend', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { label: 'Days of the week' },
			});
			const legend = wrapper.find('legend');
			expect(legend.exists()).toBe(true);
			expect(legend.classes()).toContain('sr-only');
			expect(legend.text()).toBe('Days of the week');
		});

		it('should have role checkbox on each button', () => {
			const wrapper = mount(WeekdaysPicker);
			const buttons = wrapper.findAll('button');
			buttons.forEach((b) => {
				expect(b.attributes('role')).toBe('checkbox');
			});
		});

		it('should have aria-label with full day name', () => {
			const wrapper = mount(WeekdaysPicker);
			const buttons = wrapper.findAll('button');
			expect(buttons[0].attributes('aria-label')).toBe('Monday');
			expect(buttons[1].attributes('aria-label')).toBe('Tuesday');
			expect(buttons[6].attributes('aria-label')).toBe('Sunday');
		});

		it('should have aria-checked reflecting selection state', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { modelValue: [1] },
			});
			const buttons = wrapper.findAll('button');
			expect(buttons[0].attributes('aria-checked')).toBe('true');
			expect(buttons[1].attributes('aria-checked')).toBe('false');
		});
	});

	describe('sizing', () => {
		it('should apply default size', () => {
			const wrapper = mount(WeekdaysPicker);
			const button = wrapper.find('button');
			expect(button.classes()).toContain('size-9');
		});

		it('should apply sm size', () => {
			const wrapper = mount(WeekdaysPicker, { props: { size: 'sm' } });
			const button = wrapper.find('button');
			expect(button.classes()).toContain('size-7');
		});

		it('should apply lg size', () => {
			const wrapper = mount(WeekdaysPicker, { props: { size: 'lg' } });
			const button = wrapper.find('button');
			expect(button.classes()).toContain('size-11');
		});
	});

	describe('styling', () => {
		it('should support custom classes', () => {
			const wrapper = mount(WeekdaysPicker, {
				props: { class: 'custom-picker' },
			});
			expect(wrapper.classes()).toContain('custom-picker');
		});
	});
});
