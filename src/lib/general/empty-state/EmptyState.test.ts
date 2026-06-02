import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from './EmptyState.vue';
import EmptyStateAction from './EmptyStateAction.vue';

// Minimal icon stub
const IconStub = { template: '<svg data-testid="icon-stub" />' };

// ============================================
// EmptyState
// ============================================
describe('EmptyState', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data found' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as section element', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data found' },
			});
			expect(wrapper.element.tagName).toBe('SECTION');
		});

		it('should have correct data-slot', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data found' },
			});
			expect(wrapper.attributes('data-slot')).toBe('empty-state');
		});

		it('should display title text', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data found' },
			});
			expect(wrapper.text()).toContain('No data found');
		});

		it('should display description when provided', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data', description: 'Try creating a new item.' },
			});
			expect(wrapper.text()).toContain('Try creating a new item.');
		});

		it('should not render description when not provided', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data' },
			});
			expect(wrapper.findAll('p').length).toBe(0);
		});
	});

	describe('icon', () => {
		it('should render icon component when provided', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data', icon: IconStub },
			});
			expect(wrapper.find('[data-testid="icon-stub"]').exists()).toBe(true);
		});

		it('should render icon slot content', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data' },
				slots: { icon: '<span class="custom-icon">Custom</span>' },
			});
			expect(wrapper.find('.custom-icon').exists()).toBe(true);
		});

		it('should hide icon area when neither prop nor slot given', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data' },
			});
			expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false);
		});

		it('should mark icon area as aria-hidden', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data', icon: IconStub },
			});
			expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
		});
	});

	describe('slots', () => {
		it('should render default slot (actions)', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data' },
				slots: { default: '<button>Create</button>' },
			});
			expect(wrapper.find('button').text()).toBe('Create');
		});

		it('should render actions slot (card actions)', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data' },
				slots: { actions: '<div class="action-card">Card</div>' },
			});
			expect(wrapper.find('.action-card').exists()).toBe(true);
		});
	});

	describe('sizing', () => {
		it('should apply default size classes', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data' },
			});
			expect(wrapper.classes()).toContain('py-10');
		});

		it('should apply sm size classes', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data', size: 'sm' },
			});
			expect(wrapper.classes()).toContain('py-6');
		});

		it('should apply lg size classes', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data', size: 'lg' },
			});
			expect(wrapper.classes()).toContain('py-16');
		});
	});

	describe('styling', () => {
		it('should support custom classes', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No data', class: 'min-h-96' },
			});
			expect(wrapper.classes()).toContain('min-h-96');
		});
	});

	describe('accessibility', () => {
		it('should have aria-label matching title', () => {
			const wrapper = mount(EmptyState, {
				props: { title: 'No results found' },
			});
			expect(wrapper.attributes('aria-label')).toBe('No results found');
		});
	});
});

// ============================================
// EmptyStateAction
// ============================================
describe('EmptyStateAction', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create account' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create account' },
			});
			expect(wrapper.attributes('data-slot')).toBe('empty-state-action');
		});

		it('should display title', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create new account' },
			});
			expect(wrapper.text()).toContain('Create new account');
		});

		it('should display description when provided', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create account', description: 'Get started now.' },
			});
			expect(wrapper.text()).toContain('Get started now.');
		});

		it('should not render description when not provided', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create account' },
			});
			const paragraphs = wrapper.findAll('p');
			expect(paragraphs.length).toBe(1); // only title
		});
	});

	describe('slots', () => {
		it('should render default slot', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create account' },
				slots: { default: '<button>Go</button>' },
			});
			expect(wrapper.find('button').text()).toBe('Go');
		});
	});

	describe('styling', () => {
		it('should support custom classes', () => {
			const wrapper = mount(EmptyStateAction, {
				props: { title: 'Create account', class: 'border-primary' },
			});
			expect(wrapper.classes()).toContain('border-primary');
		});
	});
});
