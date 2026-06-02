import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import FileInput from './FileInput.vue';

function makeFile(name = 'doc.pdf'): File {
	return new File([new Blob(['hi'])], name, { type: 'application/pdf' });
}

describe('FileInput', () => {
	it('renders the default button label when no file selected', () => {
		const w = mount(FileInput);
		expect(w.find('[data-slot="file-input-label"]').text()).toBe('Choose file');
	});

	it('shows the file name once a single file is set', () => {
		const file = makeFile('photo.png');
		const w = mount(FileInput, { props: { modelValue: file } });
		expect(w.find('[data-slot="file-input-label"]').text()).toBe('photo.png');
	});

	it('emits update:modelValue (single) on input change', async () => {
		const w = mount(FileInput);
		const input = w.find('input[type="file"]').element as HTMLInputElement;
		Object.defineProperty(input, 'files', { value: [makeFile('one.pdf')] });
		await w.find('input[type="file"]').trigger('change');

		const emitted = w.emitted('update:modelValue') as unknown[][] | undefined;
		const file = emitted?.[0]?.[0] as File | undefined;
		expect(file?.name).toBe('one.pdf');
	});

	it('emits update:modelValue (array) when multiple is set', async () => {
		const w = mount(FileInput, { props: { multiple: true } });
		const input = w.find('input[type="file"]').element as HTMLInputElement;
		Object.defineProperty(input, 'files', { value: [makeFile('a'), makeFile('b')] });
		await w.find('input[type="file"]').trigger('change');

		const emitted = w.emitted('update:modelValue') as unknown[][] | undefined;
		const files = emitted?.[0]?.[0] as File[] | undefined;
		expect(files).toHaveLength(2);
	});

	it('renders "<n> files" label for multi-select', () => {
		const w = mount(FileInput, {
			props: { multiple: true, modelValue: [makeFile('a'), makeFile('b'), makeFile('c')] },
		});
		expect(w.find('[data-slot="file-input-label"]').text()).toBe('3 files');
	});
});
