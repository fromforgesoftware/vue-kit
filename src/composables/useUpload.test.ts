import { describe, expect, it, vi } from 'vitest';
import { useUpload } from './useUpload.js';

function makeFile(name = 'f.txt', size = 100): File {
	const blob = new Blob([new Uint8Array(size)], { type: 'application/octet-stream' });
	return new File([blob], name, { type: 'application/octet-stream' });
}

describe('useUpload', () => {
	it('runs the uploader and tracks success state + final progress', async () => {
		const uploader = vi.fn(
			async (
				file: File,
				report: (p: { loaded: number; total: number; percent: number }) => void,
			) => {
				report({ loaded: file.size / 2, total: file.size, percent: 50 });
				return { id: '1', name: file.name };
			},
		);
		const up = useUpload<{ id: string; name: string }>({ uploader });

		const file = makeFile('x.txt', 200);
		const result = await up.upload(file);

		expect(uploader).toHaveBeenCalled();
		expect(result.id).toBe('1');
		expect(up.state.value).toBe('success');
		expect(up.progress.value.percent).toBe(100);
		expect(up.result.value?.name).toBe('x.txt');
		expect(up.error.value).toBeNull();
	});

	it('captures errors + flips state to error', async () => {
		const up = useUpload({
			uploader: async () => {
				throw new Error('boom');
			},
		});

		await expect(up.upload(makeFile())).rejects.toThrow('boom');
		expect(up.state.value).toBe('error');
		expect(up.error.value?.message).toBe('boom');
	});

	it('cancel() aborts the in-flight upload + leaves state cancelled', async () => {
		const up = useUpload({
			uploader: (_, _report, signal) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener('abort', () => reject(new Error('aborted')));
				}),
		});

		const promise = up.upload(makeFile());
		up.cancel();
		await expect(promise).rejects.toThrow('aborted');
		expect(up.state.value).toBe('cancelled');
	});

	it('reset() returns the composable to idle', async () => {
		const up = useUpload({ uploader: async () => 'ok' });
		await up.upload(makeFile());
		up.reset();
		expect(up.state.value).toBe('idle');
		expect(up.progress.value.percent).toBe(0);
		expect(up.result.value).toBeNull();
	});

	it('starting a new upload aborts the previous one', async () => {
		const onAbort = vi.fn();
		const up = useUpload({
			uploader: (file, _report, signal) =>
				new Promise<string>((resolve, reject) => {
					signal.addEventListener('abort', () => {
						onAbort();
						reject(new Error('aborted'));
					});
					if (file.name === 'second') resolve('second-ok');
				}),
		});

		const first = up.upload(makeFile('first'));
		first.catch(() => undefined);
		const second = await up.upload(makeFile('second'));

		expect(onAbort).toHaveBeenCalled();
		expect(second).toBe('second-ok');
	});
});
