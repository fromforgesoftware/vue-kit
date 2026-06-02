import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick } from 'vue';
import { Attribute, JsonApi, Resource } from '@fromforgesoftware/ts-kit/jsonapi';
import {
	ApiClient,
	type HttpAdapter,
	type HttpRequest,
	type HttpResponse,
} from '@fromforgesoftware/ts-kit/jsonapi-client';
import { createResourceStore } from './createResourceStore';

@JsonApi({ type: 'workspaces' })
class Workspace extends Resource {
	@Attribute() name!: string;
}

class StubAdapter implements HttpAdapter {
	calls: HttpRequest[] = [];
	queue: HttpResponse[] = [];
	push(res: HttpResponse): void {
		this.queue.push(res);
	}
	async request(req: HttpRequest): Promise<HttpResponse> {
		this.calls.push(req);
		const next = this.queue.shift();
		if (!next) throw new Error('no queued response');
		return next;
	}
}

function jsonRes(status: number, body: unknown): HttpResponse {
	return { status, headers: { 'content-type': 'application/vnd.api+json' }, body };
}

function single(id: string, attrs: Record<string, unknown>) {
	return { data: { type: 'workspaces', id, attributes: attrs } };
}

function collection(items: { id: string; name: string }[], totalCount: number) {
	return {
		data: items.map((i) => ({ type: 'workspaces', id: i.id, attributes: { name: i.name } })),
		meta: { pagination: { totalCount } },
	};
}

function makeStore() {
	const adapter = new StubAdapter();
	const api = ApiClient.create({ baseUrl: 'https://api.example.com', adapter });
	const scope = effectScope();
	const store = scope.run(() => createResourceStore({ modelType: Workspace, api }))!;
	return { store, adapter, scope };
}

describe('createResourceStore', () => {
	it('list populates items + pagination + clears loading/error', async () => {
		const { store, adapter } = makeStore();
		adapter.push(
			jsonRes(
				200,
				collection(
					[
						{ id: 'a', name: 'A' },
						{ id: 'b', name: 'B' },
					],
					12,
				),
			),
		);

		await store.list();

		expect(store.items.value).toHaveLength(2);
		expect(store.items.value[0].name).toBe('A');
		expect(store.pagination.value.totalCount).toBe(12);
		expect(store.loading.value).toBe(false);
		expect(store.error.value).toBeNull();
	});

	it('list flips loading on/off around the await', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(200, collection([], 0)));

		const promise = store.list();
		await nextTick();
		expect(store.loading.value).toBe(true);
		await promise;
		expect(store.loading.value).toBe(false);
	});

	it('list captures errors into state and rethrows', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(500, { errors: [{ title: 'boom' }] }));

		await expect(store.list()).rejects.toBeDefined();
		expect(store.error.value).toBeTruthy();
		expect(store.loading.value).toBe(false);
	});

	it('loadMore appends instead of replacing + advances the page', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(200, collection([{ id: 'a', name: 'A' }], 3)));
		await store.list();
		adapter.push(jsonRes(200, collection([{ id: 'b', name: 'B' }], 3)));
		await store.loadMore();

		expect(store.items.value.map((w) => w.id)).toEqual(['a', 'b']);
		expect(store.pagination.value.page).toBe(1);
	});

	it('loadMore is a no-op when canLoadMore is false', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(200, collection([{ id: 'a', name: 'A' }], 1)));
		await store.list();
		expect(store.canLoadMore.value).toBe(false);

		await store.loadMore();

		expect(adapter.calls).toHaveLength(1);
	});

	it('create adds the new item to the store + returns it', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(201, single('a', { name: 'A' })));

		const created = await store.create({ name: 'A' });

		expect(created.name).toBe('A');
		expect(store.items.value.map((w) => w.id)).toContain('a');
	});

	it('update replaces the existing item by id', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(200, collection([{ id: 'a', name: 'A' }], 1)));
		await store.list();
		adapter.push(jsonRes(200, single('a', { name: 'Renamed' })));

		await store.update('a', { name: 'Renamed' });

		expect(store.items.value.find((w) => w.id === 'a')?.name).toBe('Renamed');
	});

	it('remove drops the item + decrements totalCount', async () => {
		const { store, adapter } = makeStore();
		adapter.push(
			jsonRes(
				200,
				collection(
					[
						{ id: 'a', name: 'A' },
						{ id: 'b', name: 'B' },
					],
					2,
				),
			),
		);
		await store.list();
		adapter.push({ status: 204, headers: {}, body: null });

		await store.remove('a');

		expect(store.items.value.map((w) => w.id)).toEqual(['b']);
		expect(store.pagination.value.totalCount).toBe(1);
	});

	it('select + selectById set the selected item', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(200, collection([{ id: 'a', name: 'A' }], 1)));
		await store.list();

		store.selectById('a');
		expect(store.selected.value?.id).toBe('a');

		store.select(null);
		expect(store.selected.value).toBeNull();
	});

	it('scope query options are applied to every list call', async () => {
		const adapter = new StubAdapter();
		const api = ApiClient.create({ baseUrl: 'https://api.example.com', adapter });
		const scope = effectScope();
		const fakeQueryOpt = vi.fn(() => undefined);
		const store = scope.run(() =>
			createResourceStore({ modelType: Workspace, api, scope: [fakeQueryOpt as unknown as never] }),
		)!;
		adapter.push(jsonRes(200, collection([], 0)));

		await store.list();

		expect(fakeQueryOpt).toHaveBeenCalled();
		scope.stop();
	});

	it('reset() returns to initial state', async () => {
		const { store, adapter } = makeStore();
		adapter.push(jsonRes(200, collection([{ id: 'a', name: 'A' }], 1)));
		await store.list();

		store.reset();

		expect(store.items.value).toEqual([]);
		expect(store.pagination.value.page).toBe(0);
	});

	it('disposes its subscription when its scope is stopped', async () => {
		const { store, adapter, scope } = makeStore();
		adapter.push(jsonRes(200, collection([{ id: 'a', name: 'A' }], 1)));
		await store.list();
		scope.stop();

		// After scope stop, underlying store can still mutate without Vue
		// observing — view should keep its last snapshot.
		const snapshot = store.items.value;
		store.store.setItems([]);
		expect(store.items.value).toBe(snapshot);
	});
});
