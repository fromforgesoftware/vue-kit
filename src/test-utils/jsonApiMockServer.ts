/**
 * Framework-agnostic in-memory JSON:API mock server. Use directly with an
 * HttpAdapter for unit tests, or behind MSW for stories — see
 * createJsonApiMockHandler for the HttpAdapter form.
 *
 * Usage:
 *   const { handle, db } = createJsonApiMockServer({
 *     seed: { workspaces: [{ id: 'w1', name: 'A' }] },
 *   })
 *
 *   db.list('workspaces')          // peek/seed dynamically
 *   db.upsert('workspaces', {...}) // mutate
 *
 *   const adapter = createJsonApiMockAdapter(handle)
 *   const api = ApiClient.create({ baseUrl: 'http://test', adapter })
 */

export type MockResource = { id: string } & Record<string, unknown>;

export interface MockDb {
	list(type: string): MockResource[];
	get(type: string, id: string): MockResource | undefined;
	upsert(type: string, resource: MockResource): MockResource;
	remove(type: string, id: string): boolean;
	clear(): void;
}

class InMemoryDb implements MockDb {
	private readonly tables = new Map<string, MockResource[]>();
	private idCounter = 0;

	constructor(seed: SeedData = {}) {
		for (const [type, rows] of Object.entries(seed)) {
			this.tables.set(
				type,
				rows.map((r) => ({ ...r })),
			);
		}
	}

	list(type: string): MockResource[] {
		return [...(this.tables.get(type) ?? [])];
	}

	get(type: string, id: string): MockResource | undefined {
		return this.tables.get(type)?.find((r) => r.id === id);
	}

	upsert(type: string, resource: MockResource): MockResource {
		const row = this.tables.get(type) ?? [];
		const id = resource.id || this.nextId(type);
		const idx = row.findIndex((r) => r.id === id);
		const next = { ...resource, id };
		if (idx === -1) row.push(next);
		else row[idx] = next;
		this.tables.set(type, row);
		return next;
	}

	remove(type: string, id: string): boolean {
		const row = this.tables.get(type) ?? [];
		const idx = row.findIndex((r) => r.id === id);
		if (idx === -1) return false;
		row.splice(idx, 1);
		this.tables.set(type, row);
		return true;
	}

	clear(): void {
		this.tables.clear();
	}

	private nextId(type: string): string {
		this.idCounter += 1;
		return `${type}-${this.idCounter}`;
	}
}

export interface SeedData {
	[type: string]: MockResource[];
}

export interface MockServerOptions {
	seed?: SeedData;
	/** Inject failures, latency, etc. */
	hook?: (req: MockRequest) => MockResponse | void | undefined;
}

export interface MockRequest {
	method: string;
	path: string;
	query: URLSearchParams;
	body: unknown;
}

export interface MockResponse {
	status: number;
	body: unknown;
}

export type MockHandler = (req: MockRequest) => MockResponse;

export interface MockServer {
	db: MockDb;
	handle: MockHandler;
}

export function createJsonApiMockServer(opts: MockServerOptions = {}): MockServer {
	const db = new InMemoryDb(opts.seed);

	function handle(req: MockRequest): MockResponse {
		const hooked = opts.hook?.(req);
		if (hooked) return hooked;

		const [type, id] = req.path.replace(/^\/+/, '').replace(/\/+$/, '').split('/');
		if (!type) return jsonError(404, 'not found');

		if (type === 'operations') {
			return handleAtomic(db, req.body);
		}

		if (req.method === 'GET' && !id) return listResponse(db, type, req.query);
		if (req.method === 'GET' && id) return singleResponse(db, type, id);
		if (req.method === 'POST' && !id) return createResponse(db, type, req.body);
		if (req.method === 'PATCH' && id) return updateResponse(db, type, id, req.body);
		if (req.method === 'DELETE' && id) return deleteResponse(db, type, id);

		return jsonError(405, 'method not allowed');
	}

	return { db, handle };
}

function listResponse(db: MockDb, type: string, query: URLSearchParams): MockResponse {
	let rows = db.list(type);

	for (const [key, val] of query.entries()) {
		const match = /^filter\[(\w+)\]\[eq\]$/.exec(key);
		if (match) {
			const field = match[1];
			rows = rows.filter((r) => String(r[field]) === val);
		}
	}

	const limit = Number(query.get('page[limit]') ?? '0');
	const offset = Number(query.get('page[offset]') ?? '0');
	const number = Number(query.get('page[number]') ?? '0');
	const size = Number(query.get('page[size]') ?? '0');

	let paginated = rows;
	if (limit > 0) paginated = rows.slice(offset, offset + limit);
	else if (size > 0) paginated = rows.slice(number * size, number * size + size);

	return {
		status: 200,
		body: {
			data: paginated.map((r) => toJsonApi(type, r)),
			meta: { pagination: { totalCount: rows.length } },
		},
	};
}

function singleResponse(db: MockDb, type: string, id: string): MockResponse {
	const row = db.get(type, id);
	if (!row) return jsonError(404, `${type}/${id} not found`);
	return { status: 200, body: { data: toJsonApi(type, row) } };
}

function createResponse(db: MockDb, type: string, body: unknown): MockResponse {
	const attrs =
		(body as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes ?? {};
	const stored = db.upsert(type, { id: '', ...attrs } as MockResource);
	return { status: 201, body: { data: toJsonApi(type, stored) } };
}

function updateResponse(db: MockDb, type: string, id: string, body: unknown): MockResponse {
	const existing = db.get(type, id);
	if (!existing) return jsonError(404, `${type}/${id} not found`);
	const attrs =
		(body as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes ?? {};
	const merged = db.upsert(type, { ...existing, ...attrs, id });
	return { status: 200, body: { data: toJsonApi(type, merged) } };
}

function deleteResponse(db: MockDb, type: string, id: string): MockResponse {
	const ok = db.remove(type, id);
	if (!ok) return jsonError(404, `${type}/${id} not found`);
	return { status: 204, body: null };
}

function handleAtomic(db: MockDb, body: unknown): MockResponse {
	const ops = (body as { 'atomic:operations'?: AtomicOp[] } | null)?.['atomic:operations'] ?? [];
	const results: { data?: unknown }[] = [];
	for (const op of ops) {
		if (op.op === 'add') {
			const attrs = (op.data?.attributes ?? {}) as Record<string, unknown>;
			const stored = db.upsert(op.data.type, { id: '', ...attrs } as MockResource);
			results.push({ data: toJsonApi(op.data.type, stored) });
		} else if (op.op === 'update' && op.ref) {
			const existing = db.get(op.ref.type, op.ref.id);
			if (!existing) return jsonError(404, `${op.ref.type}/${op.ref.id} not found`);
			const attrs = (op.data?.attributes ?? {}) as Record<string, unknown>;
			const merged = db.upsert(op.ref.type, { ...existing, ...attrs, id: op.ref.id });
			results.push({ data: toJsonApi(op.ref.type, merged) });
		} else if (op.op === 'remove' && op.ref) {
			const ok = db.remove(op.ref.type, op.ref.id);
			if (!ok) return jsonError(404, `${op.ref.type}/${op.ref.id} not found`);
			results.push({});
		}
	}
	return { status: 200, body: { 'atomic:results': results } };
}

interface AtomicOp {
	op: 'add' | 'update' | 'remove';
	ref?: { type: string; id: string };
	data: { type: string; attributes?: Record<string, unknown> };
}

function toJsonApi(type: string, row: MockResource): Record<string, unknown> {
	const { id, ...attributes } = row;
	return { type, id, attributes };
}

function jsonError(status: number, title: string): MockResponse {
	return { status, body: { errors: [{ status: String(status), title }] } };
}

/**
 * Convert a `MockHandler` into an HttpAdapter suitable for `ApiClient.create`.
 * Lets tests + stories drive the kit's real client without spinning up a
 * server.
 */
export interface MockAdapter {
	request(req: {
		method: string;
		url: string;
		headers: Record<string, string>;
		body?: unknown;
	}): Promise<{ status: number; headers: Record<string, string>; body: unknown }>;
}

export function createJsonApiMockAdapter(handle: MockHandler, baseUrl?: string): MockAdapter {
	return {
		async request(req) {
			const url = new URL(req.url);
			const path = baseUrl
				? url.pathname.replace(new RegExp(`^${escapeRegex(new URL(baseUrl).pathname)}`), '')
				: url.pathname;
			const res = handle({
				method: req.method,
				path,
				query: url.searchParams,
				body: typeof req.body === 'string' ? JSON.parse(req.body) : req.body,
			});
			return {
				status: res.status,
				headers: { 'content-type': 'application/vnd.api+json' },
				body: res.body,
			};
		},
	};
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
