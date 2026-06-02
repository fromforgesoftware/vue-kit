import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { Attribute, JsonApi, Resource } from '@fromforgesoftware/ts-kit/jsonapi';
import { ApiClient, Atomic } from '@fromforgesoftware/ts-kit/jsonapi-client';
import { createJsonApiMockAdapter, createJsonApiMockServer } from './jsonApiMockServer';

@JsonApi({ type: 'workspaces' })
class Workspace extends Resource {
	@Attribute() name!: string;
}

function makeClient(seed = {}) {
	const server = createJsonApiMockServer({ seed });
	const adapter = createJsonApiMockAdapter(server.handle);
	const api = ApiClient.create({ baseUrl: 'http://test', adapter });
	return { api, server };
}

describe('createJsonApiMockServer — round-trip through ApiClient', () => {
	it('lists seeded resources with paginated meta', async () => {
		const { api } = makeClient({
			workspaces: [
				{ id: 'w1', name: 'Alpha' },
				{ id: 'w2', name: 'Beta' },
			],
		});

		const res = await api.list(Workspace);

		expect(res.result()).toHaveLength(2);
		expect(res.meta().get('pagination')).toMatchObject({ totalCount: 2 });
	});

	it('round-trips create + get + update + delete', async () => {
		const { api, server } = makeClient();

		const created = await api.create(Workspace, { name: 'New' });
		expect(created.name).toBe('New');
		expect(server.db.list('workspaces')).toHaveLength(1);

		const fetched = await api.get(Workspace, created.id);
		expect(fetched.name).toBe('New');

		await api.update(Workspace, created.id, { name: 'Renamed' });
		expect(server.db.get('workspaces', created.id)?.name).toBe('Renamed');

		await api.delete(Workspace, created.id);
		expect(server.db.list('workspaces')).toHaveLength(0);
	});

	it('routes atomic operations end-to-end', async () => {
		const { api, server } = makeClient({
			workspaces: [{ id: 'old', name: 'Old' }],
		});

		const result = await api.atomic([
			Atomic.add(Workspace, { name: 'Fresh' }),
			Atomic.update(Workspace, 'old', { name: 'Updated' }),
		]);

		expect(result.results).toHaveLength(2);
		expect(server.db.list('workspaces').map((r) => r.name)).toEqual(
			expect.arrayContaining(['Fresh', 'Updated']),
		);
	});

	it('returns 404 with JSON:API error for unknown ids', async () => {
		const { api } = makeClient();
		await expect(api.get(Workspace, 'missing')).rejects.toMatchObject({ status: 404 });
	});

	it('hook can inject failures (e.g. 500 for a path)', async () => {
		const server = createJsonApiMockServer({
			hook: (req) => (req.path.includes('workspaces') ? { status: 500, body: {} } : undefined),
		});
		const api = ApiClient.create({
			baseUrl: 'http://test',
			adapter: createJsonApiMockAdapter(server.handle),
		});

		await expect(api.list(Workspace)).rejects.toMatchObject({ status: 500 });
	});

	it('honours page[limit] + page[offset] in filtered results', async () => {
		const server = createJsonApiMockServer({
			seed: {
				workspaces: Array.from({ length: 7 }, (_, i) => ({ id: `w${i}`, name: `Name${i}` })),
			},
		});
		const res = server.handle({
			method: 'GET',
			path: '/workspaces',
			query: new URLSearchParams({ 'page[limit]': '3', 'page[offset]': '2' }),
			body: null,
		});
		const body = res.body as { data: unknown[]; meta: { pagination: { totalCount: number } } };
		expect(body.data).toHaveLength(3);
		expect(body.meta.pagination.totalCount).toBe(7);
	});
});
