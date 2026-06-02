import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import KpiTile from './KpiTile.vue';
import { deltaSentiment } from './kpi-tile.js';

describe('KpiTile', () => {
	it('renders the label + value', () => {
		const w = mount(KpiTile, { props: { label: 'Revenue', value: '$12.4k' } });
		expect(w.find('[data-slot="kpi-tile-label"]').text()).toBe('Revenue');
		expect(w.find('[data-slot="kpi-tile-value"]').text()).toBe('$12.4k');
	});

	it('renders a delta with + sign when positive', () => {
		const w = mount(KpiTile, {
			props: { label: 'Visits', value: 1200, delta: { value: 12 } },
		});
		expect(w.find('[data-slot="kpi-tile-delta"]').text()).toContain('+12%');
	});

	it('renders a delta in absolute format when requested', () => {
		const w = mount(KpiTile, {
			props: {
				label: 'Errors',
				value: 0,
				delta: { value: -5, format: 'absolute', invertSentiment: true },
			},
		});
		expect(w.find('[data-slot="kpi-tile-delta"]').text()).toContain('-5');
	});

	it('renders a sparkline when trend has 2+ values', () => {
		const w = mount(KpiTile, {
			props: { label: 'Users', value: 42, trend: [1, 2, 3, 4, 5] },
		});
		expect(w.find('[data-slot="kpi-tile-sparkline"]').exists()).toBe(true);
	});

	it('skips sparkline when trend is empty or single-point', () => {
		const w = mount(KpiTile, { props: { label: 'Users', value: 42, trend: [4] } });
		expect(w.find('[data-slot="kpi-tile-sparkline"]').exists()).toBe(false);
	});

	it('renders a footnote when provided', () => {
		const w = mount(KpiTile, {
			props: { label: 'NPS', value: 72, footnote: 'vs last quarter' },
		});
		expect(w.find('[data-slot="kpi-tile-footnote"]').text()).toBe('vs last quarter');
	});
});

describe('deltaSentiment', () => {
	it('positive default → good', () => {
		expect(deltaSentiment({ value: 5 })).toBe('good');
	});
	it('negative default → bad', () => {
		expect(deltaSentiment({ value: -5 })).toBe('bad');
	});
	it('inverted positive → bad (e.g. churn)', () => {
		expect(deltaSentiment({ value: 5, invertSentiment: true })).toBe('bad');
	});
	it('zero → neutral', () => {
		expect(deltaSentiment({ value: 0 })).toBe('neutral');
	});
});
