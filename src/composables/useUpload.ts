import { computed, ref, shallowRef, type ComputedRef, type Ref } from 'vue';

export type UploadState = 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadProgress {
	loaded: number;
	total: number;
	percent: number;
}

export interface UploadOptions<TResult> {
	/**
	 * Single-file upload function. Receives the file plus a progress reporter
	 * and an AbortSignal so the composable can drive cancellation.
	 *
	 * The classic implementation is XHR-based (see `xhrUploader` below) because
	 * `fetch` lacks progress events on the request body.
	 */
	uploader: (
		file: File,
		report: (p: UploadProgress) => void,
		signal: AbortSignal,
	) => Promise<TResult>;
}

export interface UseUploadReturn<TResult> {
	state: ComputedRef<UploadState>;
	progress: Readonly<Ref<UploadProgress>>;
	result: Readonly<Ref<TResult | null>>;
	error: ComputedRef<Error | null>;

	upload(file: File): Promise<TResult>;
	cancel(): void;
	reset(): void;
}

export function useUpload<TResult = unknown>(
	opts: UploadOptions<TResult>,
): UseUploadReturn<TResult> {
	const state = ref<UploadState>('idle');
	const progress = ref<UploadProgress>({ loaded: 0, total: 0, percent: 0 });
	const result = shallowRef<TResult | null>(null);
	const error = shallowRef<Error | null>(null);
	let controller: AbortController | null = null;

	async function upload(file: File): Promise<TResult> {
		controller?.abort();
		controller = new AbortController();
		state.value = 'uploading';
		progress.value = { loaded: 0, total: file.size, percent: 0 };
		result.value = null;
		error.value = null;
		try {
			const res = await opts.uploader(
				file,
				(p) => {
					progress.value = p;
				},
				controller.signal,
			);
			result.value = res;
			state.value = 'success';
			progress.value = { loaded: file.size, total: file.size, percent: 100 };
			return res;
		} catch (e) {
			if (controller.signal.aborted) {
				state.value = 'cancelled';
				throw e;
			}
			error.value = e instanceof Error ? e : new Error(String(e));
			state.value = 'error';
			throw e;
		}
	}

	function cancel(): void {
		controller?.abort();
	}

	function reset(): void {
		controller?.abort();
		state.value = 'idle';
		progress.value = { loaded: 0, total: 0, percent: 0 };
		result.value = null;
		error.value = null;
	}

	return {
		state: computed(() => state.value),
		progress,
		result,
		error: computed(() => error.value),
		upload,
		cancel,
		reset,
	};
}

/**
 * XHR-based uploader factory. Returns an `uploader` suitable for `useUpload`,
 * with real upload-progress events (which `fetch` doesn't currently expose).
 */
export function xhrUploader<TResult>(opts: {
	url: string;
	method?: 'POST' | 'PUT';
	headers?: () => Record<string, string>;
	fieldName?: string;
	extraFields?: () => Record<string, string>;
	parseResponse?: (xhr: XMLHttpRequest) => TResult;
}): UploadOptions<TResult>['uploader'] {
	return (file, report, signal) => {
		return new Promise<TResult>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const fd = new FormData();
			fd.append(opts.fieldName ?? 'file', file);
			const extras = opts.extraFields?.() ?? {};
			for (const [k, v] of Object.entries(extras)) fd.append(k, v);

			xhr.open(opts.method ?? 'POST', opts.url);
			const headers = opts.headers?.() ?? {};
			for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);

			xhr.upload.onprogress = (e) => {
				if (!e.lengthComputable) return;
				report({
					loaded: e.loaded,
					total: e.total,
					percent: Math.round((e.loaded / e.total) * 100),
				});
			};
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(opts.parseResponse ? opts.parseResponse(xhr) : (xhr.response as TResult));
				} else {
					reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
				}
			};
			xhr.onerror = () => reject(new Error('Network error'));
			xhr.onabort = () => reject(new Error('Upload aborted'));
			signal.addEventListener('abort', () => xhr.abort(), { once: true });
			xhr.send(fd);
		});
	};
}
