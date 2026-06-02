import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AvatarGroup from './AvatarGroup.vue';
import type { AvatarGroupItem } from './avatar-group';

const ITEMS: AvatarGroupItem[] = [
	{ name: 'Alice Adams', description: 'alice@acme.io' },
	{ name: 'Bob Brown', description: 'bob@acme.io' },
	{ name: 'Carol Cole', description: 'carol@acme.io' },
	{ name: 'Dan Davis', description: 'dan@acme.io' },
	{ name: 'Eve Evans', description: 'eve@acme.io' },
	{ name: 'Frank Foster', description: 'frank@acme.io' },
];

const buildItems = (n: number): AvatarGroupItem[] =>
	Array.from({ length: n }, (_, i) => ({ name: `User ${i + 1}` }));

describe('AvatarGroup', () => {
	describe('rendering', () => {
		it('should render the root container', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS.slice(0, 2) } });
			expect(wrapper.find('[data-slot="avatar-group"]').exists()).toBe(true);
		});

		it('should render nothing inside when items is empty', () => {
			const wrapper = mount(AvatarGroup, { props: { items: [] } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(0);
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').exists()).toBe(false);
		});

		it('should render all items when count is below max', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS.slice(0, 3), max: 4 } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(3);
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').exists()).toBe(false);
		});

		it('should render exactly max items when count equals max', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS.slice(0, 4), max: 4 } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(4);
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').exists()).toBe(false);
		});
	});

	describe('overflow', () => {
		it('should render overflow badge when items exceed max', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS, max: 4 } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(4);
			const overflow = wrapper.find('[data-slot="avatar-group-overflow"]');
			expect(overflow.exists()).toBe(true);
			expect(overflow.text()).toContain('+2');
		});

		it('should respect a custom max', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS, max: 2 } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(2);
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toContain('+4');
		});

		it('should cap overflow label at default 99', () => {
			const wrapper = mount(AvatarGroup, { props: { items: buildItems(250), max: 4 } });
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toContain('+99');
		});

		it('should cap overflow label at custom overflowCap', () => {
			const wrapper = mount(AvatarGroup, {
				props: { items: buildItems(50), max: 4, overflowCap: 9 },
			});
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toContain('+9');
		});

		it('should not cap when overflow is below the cap', () => {
			const wrapper = mount(AvatarGroup, {
				props: { items: buildItems(54), max: 4, overflowCap: 99 },
			});
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toContain('+50');
		});

		it('should show +1 when one item over max', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS.slice(0, 5), max: 4 } });
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toContain('+1');
		});
	});

	describe('avatar rendering', () => {
		it('should render initials derived from name', () => {
			const wrapper = mount(AvatarGroup, { props: { items: [{ name: 'Alice Adams' }] } });
			expect(wrapper.text()).toContain('AA');
		});

		it('should render explicit initials when provided', () => {
			const wrapper = mount(AvatarGroup, {
				props: { items: [{ name: 'Alice Adams', initials: 'XX' }] },
			});
			expect(wrapper.text()).toContain('XX');
		});

		it('should render an image when src is provided', () => {
			const wrapper = mount(AvatarGroup, {
				props: { items: [{ name: 'Alice', src: 'https://example.com/a.jpg' }] },
			});
			expect(wrapper.find('img').exists()).toBe(true);
		});
	});

	describe('props', () => {
		it('should default to max=4', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(4);
		});

		it('should accept a custom class on the root', () => {
			const wrapper = mount(AvatarGroup, {
				props: { items: ITEMS.slice(0, 2), class: 'custom-group' },
			});
			expect(wrapper.find('[data-slot="avatar-group"]').classes()).toContain('custom-group');
		});

		it('should apply size variant to overlap classes', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS.slice(0, 2), size: 'xs' } });
			const item = wrapper.find('[data-slot="avatar-group-item"]');
			expect(item.classes()).toContain('-ms-1');
		});
	});

	describe('tooltips disabled', () => {
		it('should render plain wrapper when tooltips=false', () => {
			const wrapper = mount(AvatarGroup, {
				props: { items: ITEMS.slice(0, 2), tooltips: false },
			});
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(2);
			expect(wrapper.find('[data-slot="tooltip-trigger"]').exists()).toBe(false);
		});

		it('should still render the overflow badge when tooltips=false', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS, max: 4, tooltips: false } });
			const overflow = wrapper.find('[data-slot="avatar-group-overflow"]');
			expect(overflow.exists()).toBe(true);
			expect(overflow.text()).toContain('+2');
		});
	});

	describe('edge cases', () => {
		it('should treat max=0 as showing only the overflow badge', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS, max: 0 } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(0);
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toContain(
				`+${ITEMS.length}`,
			);
		});

		it('should not render overflow when max exceeds items length', () => {
			const wrapper = mount(AvatarGroup, { props: { items: ITEMS.slice(0, 2), max: 10 } });
			expect(wrapper.findAll('[data-slot="avatar-group-item"]')).toHaveLength(2);
			expect(wrapper.find('[data-slot="avatar-group-overflow"]').exists()).toBe(false);
		});
	});
});
