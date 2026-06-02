import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Dialog from './Dialog.vue';
import DialogTrigger from './DialogTrigger.vue';
import DialogHeader from './DialogHeader.vue';
import DialogTitle from './DialogTitle.vue';
import DialogDescription from './DialogDescription.vue';
import DialogFooter from './DialogFooter.vue';

describe('Dialog', () => {
	describe('rendering', () => {
		it('should render Dialog component', () => {
			const wrapper = mount(Dialog);
			expect(wrapper.exists()).toBe(true);
		});

		it('should render DialogTrigger component within Dialog', () => {
			const wrapper = mount(Dialog, {
				slots: {
					default: () => h(DialogTrigger, { asChild: true }, () => h('button', 'Open')),
				},
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.find('button').exists()).toBe(true);
			expect(wrapper.find('button').text()).toBe('Open');
		});

		it('should render DialogHeader component', () => {
			const wrapper = mount(DialogHeader);
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.attributes('data-slot')).toBe('dialog-header');
		});

		it('should render DialogTitle component within Dialog', () => {
			const wrapper = mount(Dialog, {
				props: { defaultOpen: true },
				slots: {
					default: () => h(DialogTitle, null, () => 'Test Title'),
				},
			});
			expect(wrapper.exists()).toBe(true);
			const title = wrapper.findComponent(DialogTitle);
			expect(title.exists()).toBe(true);
			expect(title.text()).toBe('Test Title');
			expect(title.attributes('data-slot')).toBe('dialog-title');
		});

		it('should render DialogDescription component within Dialog', () => {
			const wrapper = mount(Dialog, {
				props: { defaultOpen: true },
				slots: {
					default: () => h(DialogDescription, null, () => 'Test Description'),
				},
			});
			expect(wrapper.exists()).toBe(true);
			const description = wrapper.findComponent(DialogDescription);
			expect(description.exists()).toBe(true);
			expect(description.text()).toBe('Test Description');
			expect(description.attributes('data-slot')).toBe('dialog-description');
		});

		it('should render DialogFooter component', () => {
			const wrapper = mount(DialogFooter);
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.attributes('data-slot')).toBe('dialog-footer');
		});
	});

	describe('styling', () => {
		it('should apply correct header classes', () => {
			const wrapper = mount(DialogHeader);
			expect(wrapper.classes()).toContain('flex');
			expect(wrapper.classes()).toContain('flex-col');
		});

		it('should apply correct footer classes', () => {
			const wrapper = mount(DialogFooter);
			expect(wrapper.classes()).toContain('flex');
		});

		it('should apply correct title classes within Dialog', () => {
			const wrapper = mount(Dialog, {
				props: { defaultOpen: true },
				slots: {
					default: () => h(DialogTitle, null, () => 'Title'),
				},
			});
			const title = wrapper.findComponent(DialogTitle);
			expect(title.classes()).toContain('text-xl');
			expect(title.classes()).toContain('font-semibold');
		});

		it('should apply correct description classes within Dialog', () => {
			const wrapper = mount(Dialog, {
				props: { defaultOpen: true },
				slots: {
					default: () => h(DialogDescription, null, () => 'Description'),
				},
			});
			const description = wrapper.findComponent(DialogDescription);
			expect(description.classes()).toContain('text-sm');
			expect(description.classes()).toContain('text-muted-foreground');
		});

		it('should support custom classes', () => {
			const wrapper = mount(DialogHeader, {
				props: { class: 'custom-header' },
			});
			expect(wrapper.classes()).toContain('custom-header');
		});
	});
});
