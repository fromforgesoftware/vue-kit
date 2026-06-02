import { computed, onScopeDispose, shallowRef, type ComputedRef } from 'vue';
import {
	ApiError,
	type ApiClient,
	type CallOptions,
} from '@fromforgesoftware/ts-kit/jsonapi-client';
import {
	ResourceStore,
	type Pagination,
	type ResourceState,
	type ResourceStoreOptions,
} from '@fromforgesoftware/ts-kit/resource-state';
import type { IResource, ModelType, QueryOption } from '@fromforgesoftware/ts-kit/jsonapi';

export interface CreateResourceStoreOptions<R extends IResource> extends ResourceStoreOptions<R> {
	modelType: ModelType<R>;
	api: ApiClient;
	/** Extra query options applied to every list() call (e.g. tenant scoping). */
	scope?: QueryOption[];
}

export interface ResourceStoreView<R extends IResource> {
	items: ComputedRef<R[]>;
	selected: ComputedRef<R | null>;
	loading: ComputedRef<boolean>;
	error: ComputedRef<string | null>;
	pagination: ComputedRef<Pagination>;
	canLoadMore: ComputedRef<boolean>;

	list(...opts: QueryOption[]): Promise<void>;
	loadMore(...opts: QueryOption[]): Promise<void>;
	get(id: string, ...opts: QueryOption[]): Promise<R>;
	create(attrs: Partial<R>): Promise<R>;
	update(id: string, attrs: Partial<R>): Promise<R>;
	remove(id: string): Promise<void>;
	select(item: R | null): void;
	selectById(id: string): void;
	reset(): void;

	/** Escape hatch for advanced consumers — direct access to the underlying store. */
	store: ResourceStore<R>;
}

export function createResourceStore<R extends IResource>(
	opts: CreateResourceStoreOptions<R>,
): ResourceStoreView<R> {
	const { modelType, api, scope = [], ...storeOpts } = opts;
	const store = new ResourceStore<R>(storeOpts);

	const state = shallowRef<ResourceState<R>>(store.state());
	const off = store.subscribe((next: ResourceState<R>) => {
		state.value = next;
	});
	onScopeDispose(off);

	function readTotalCount(res: { meta: () => Map<string, unknown> }, fallback: number): number {
		const meta = res.meta();
		const pagination = meta?.get('pagination') as { totalCount?: number } | undefined;
		return pagination?.totalCount ?? fallback;
	}

	function recordError(e: unknown): never {
		store.setError(e instanceof Error ? e.message : 'unknown');
		throw e;
	}

	async function list(...queryOpts: QueryOption[]): Promise<void> {
		store.setLoading(true);
		store.setError(null);
		try {
			const res = await api.list(modelType, ...scope, ...queryOpts);
			const items = res.result();
			store.setItems(items, { totalCount: readTotalCount(res, items.length), page: 0 });
		} catch (e) {
			recordError(e);
		} finally {
			store.setLoading(false);
		}
	}

	async function loadMore(...queryOpts: QueryOption[]): Promise<void> {
		if (!store.canLoadMore() || store.loading()) return;
		const nextPage = store.nextPage();
		store.setLoading(true);
		try {
			const res = await api.list(modelType, ...scope, ...queryOpts);
			const items = res.result();
			store.appendItems(items);
			const total = readTotalCount(res, store.items().length);
			store.setPagination({ totalCount: total, page: nextPage });
		} catch (e) {
			recordError(e);
		} finally {
			store.setLoading(false);
		}
	}

	async function get(id: string, ...queryOpts: QueryOption[]): Promise<R> {
		const item = await api.get(modelType, id, ...queryOpts);
		store.upsertItem(item);
		return item;
	}

	async function create(attrs: Partial<R>, callOpts?: CallOptions): Promise<R> {
		const created = await api.create(modelType, attrs, callOpts);
		store.upsertItem(created);
		return created;
	}

	async function update(id: string, attrs: Partial<R>, callOpts?: CallOptions): Promise<R> {
		const previous = store.findById(id);
		const updated = await api.update(modelType, id, attrs, callOpts);
		try {
			store.updateItem(updated);
		} catch (e) {
			if (previous) store.updateItem(previous);
			throw e;
		}
		return updated;
	}

	async function remove(id: string, callOpts?: CallOptions): Promise<void> {
		await api.delete(modelType, id, callOpts);
		store.removeItemById(id);
	}

	return {
		items: computed(() => state.value.items),
		selected: computed(() => state.value.selected),
		loading: computed(() => state.value.loading),
		error: computed(() => state.value.error),
		pagination: computed(() => state.value.pagination),
		canLoadMore: computed(() => {
			const s = state.value;
			if (s.items.length === 0) return true;
			return s.items.length < s.pagination.totalCount;
		}),
		list,
		loadMore,
		get,
		create,
		update,
		remove,
		select: (item) => store.select(item),
		selectById: (id) => store.selectById(id),
		reset: () => store.reset(),
		store,
	};
}

export { ApiError };
