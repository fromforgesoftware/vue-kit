import type { AutocompleteFetcher, AutocompleteOption, AutocompleteResolver } from './autocomplete.js';

/**
 * Wires a service into the {@link Autocomplete}'s `fetch` + `resolve` shape so consumers
 * don't repeat boilerplate when binding a tenant-scoped entity service to a picker.
 *
 * The composable is intentionally synchronous and returns plain functions — the
 * Autocomplete component owns its own debounce / abort lifecycle and reactive state.
 *
 * @example
 * ```ts
 * const employees = useEntityPicker({
 *   service: new EmployeeService(),
 *   search: (svc, params) => svc.search(params),
 *   byIds:  (svc, ids)    => svc.getByIDs(ids),
 *   toOption: (e) => ({ value: e.id, label: e.fullName, description: e.externalID ?? undefined }),
 * })
 *
 * // Template:
 * // <Autocomplete v-model="employeeIDs" multiple :fetch="employees.fetch" :resolve="employees.resolve" />
 * ```
 *
 * The `service` is held by the closure, not exposed — consumers keep one
 * `useEntityPicker` per drawer / form they live in.
 */
export interface PickableSearchParams {
	query: string;
	page: number;
	pageSize: number;
}

export interface PickableSearchResult<T> {
	items: T[];
	hasMore: boolean;
}

/**
 * Tuple shape used by the v2 service layer (`AsyncResult<T> = [T | null, Error | null]`).
 * Exported here so feature consumers can type their `search` / `byIds` callbacks without
 * pulling in `@fromforgesoftware/ts-kit` from the UI package.
 */
export type AsyncTuple<T> = Promise<[T | null, unknown | null]>;

export interface UseEntityPickerInput<S, T> {
	service: S;
	/** Server-side search call. The service is passed back so the consumer can scope filters. */
	search: (service: S, params: PickableSearchParams) => AsyncTuple<PickableSearchResult<T>>;
	/** Batch ID resolver for chip / displayValue rendering on form mount. */
	byIds: (service: S, ids: string[]) => AsyncTuple<T[]>;
	/** Domain-to-Autocomplete option mapper. */
	toOption: (item: T) => AutocompleteOption;
	/** Default page size handed to the service. The Autocomplete also has its own default. */
	pageSize?: number;
}

export interface UseEntityPickerResult {
	fetch: AutocompleteFetcher;
	resolve: AutocompleteResolver;
}

export function useEntityPicker<S, T>(input: UseEntityPickerInput<S, T>): UseEntityPickerResult {
	const pageSize = input.pageSize ?? 30;

	const fetch: AutocompleteFetcher = async (query, page, signal) => {
		const [result, err] = await input.search(input.service, {
			query,
			page,
			pageSize,
		});
		if (signal.aborted) {
			throw new DOMException('Aborted', 'AbortError');
		}
		if (err || !result) {
			// Surface as an empty page; the consumer's global error notifier (configured via
			// tryCatch) will have already toasted the failure.
			return { items: [], hasMore: false };
		}
		return {
			items: result.items.map(input.toOption),
			hasMore: result.hasMore,
		};
	};

	const resolve: AutocompleteResolver = async (ids) => {
		if (ids.length === 0) return [];
		const [items, err] = await input.byIds(input.service, ids);
		if (err || !items) return [];
		return items.map(input.toOption);
	};

	return { fetch, resolve };
}
