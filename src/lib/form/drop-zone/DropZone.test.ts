import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DropZone from './DropZone.vue';

function dragEvent(type: string, files: File[] = []): Event {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'dataTransfer', { value: { files } });
	return event;
}

describe('DropZone', () => {
	it('renders the default label', () => {
		const w = mount(DropZone);
		expect(w.find('[data-slot="drop-zone-label"]').text()).toContain('Drag a file');
	});

	it('flips to dropping label on dragenter, back on dragleave', async () => {
		const w = mount(DropZone);
		await w.find('[data-slot="drop-zone"]').trigger('dragenter');
		expect(w.find('[data-slot="drop-zone-label"]').text()).toContain('Drop to upload');
		await w.find('[data-slot="drop-zone"]').trigger('dragleave');
		expect(w.find('[data-slot="drop-zone-label"]').text()).toContain('Drag a file');
	});

	it('emits drop with the dropped files', async () => {
		const w = mount(DropZone);
		const file = new File(['hi'], 'a.txt', { type: 'text/plain' });
		w.find('[data-slot="drop-zone"]').element.dispatchEvent(dragEvent('drop', [file]));

		const emitted = w.emitted('drop') as unknown[][] | undefined;
		expect(emitted?.[0]?.[0]).toEqual(
			expect.arrayContaining([expect.objectContaining({ name: 'a.txt' })]),
		);
	});

	it('respects disabled — no drops, no picker open', async () => {
		const w = mount(DropZone, { props: { disabled: true } });
		await w.find('[data-slot="drop-zone"]').trigger('click');
		await w.find('[data-slot="drop-zone"]').trigger('dragenter');
		expect(w.find('[data-slot="drop-zone-label"]').text()).toContain('Drag a file');
	});

	it('clicking the zone forwards to the hidden file input', async () => {
		const w = mount(DropZone, { attachTo: document.body });
		const input = w.find('input[type="file"]').element as HTMLInputElement;
		let clicked = false;
		input.click = () => {
			clicked = true;
		};
		await w.find('[data-slot="drop-zone"]').trigger('click');
		expect(clicked).toBe(true);
	});
});
