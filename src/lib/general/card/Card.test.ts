import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import CardTitle from './CardTitle.vue';
import CardDescription from './CardDescription.vue';
import CardContent from './CardContent.vue';
import CardFooter from './CardFooter.vue';

describe('Card', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(Card);
			expect(wrapper.exists()).toBe(true);
		});

		it('should have correct data-slot attribute', () => {
			const wrapper = mount(Card);
			expect(wrapper.attributes('data-slot')).toBe('card');
		});

		it('should render slot content', () => {
			const wrapper = mount(Card, {
				slots: { default: 'Card content' },
			});
			expect(wrapper.text()).toBe('Card content');
		});
	});

	describe('padding variants', () => {
		it('should apply default padding', () => {
			const wrapper = mount(Card);
			expect(wrapper.classes()).toContain('p-5');
		});

		it('should apply sm padding', () => {
			const wrapper = mount(Card, { props: { padding: 'sm' } });
			expect(wrapper.classes()).toContain('p-3');
		});

		it('should apply none padding', () => {
			const wrapper = mount(Card, { props: { padding: 'none' } });
			expect(wrapper.classes()).not.toContain('p-5');
			expect(wrapper.classes()).not.toContain('p-3');
		});

		it('should apply lg padding', () => {
			const wrapper = mount(Card, { props: { padding: 'lg' } });
			expect(wrapper.classes()).toContain('p-6');
		});
	});

	describe('styling', () => {
		it('should have rounded corners', () => {
			const wrapper = mount(Card);
			expect(wrapper.classes()).toContain('rounded-xl');
		});

		it('should have border', () => {
			const wrapper = mount(Card);
			expect(wrapper.classes()).toContain('border');
		});

		it('should support custom classes', () => {
			const wrapper = mount(Card, { props: { class: 'custom-card' } });
			expect(wrapper.classes()).toContain('custom-card');
		});
	});
});

describe('CardHeader', () => {
	it('should render with data-slot', () => {
		const wrapper = mount(CardHeader);
		expect(wrapper.attributes('data-slot')).toBe('card-header');
	});

	it('should render slot content', () => {
		const wrapper = mount(CardHeader, { slots: { default: 'Header' } });
		expect(wrapper.text()).toBe('Header');
	});
});

describe('CardTitle', () => {
	it('should render as h3 element', () => {
		const wrapper = mount(CardTitle, { slots: { default: 'Title' } });
		expect(wrapper.element.tagName).toBe('H3');
	});

	it('should have data-slot', () => {
		const wrapper = mount(CardTitle);
		expect(wrapper.attributes('data-slot')).toBe('card-title');
	});
});

describe('CardDescription', () => {
	it('should render as p element', () => {
		const wrapper = mount(CardDescription, { slots: { default: 'Description' } });
		expect(wrapper.element.tagName).toBe('P');
	});

	it('should have data-slot', () => {
		const wrapper = mount(CardDescription);
		expect(wrapper.attributes('data-slot')).toBe('card-description');
	});
});

describe('CardContent', () => {
	it('should render with data-slot', () => {
		const wrapper = mount(CardContent);
		expect(wrapper.attributes('data-slot')).toBe('card-content');
	});
});

describe('CardFooter', () => {
	it('should render with data-slot', () => {
		const wrapper = mount(CardFooter);
		expect(wrapper.attributes('data-slot')).toBe('card-footer');
	});
});
