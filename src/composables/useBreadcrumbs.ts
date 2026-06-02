/**
 * Auto-generates breadcrumbs from route meta with manual override support.
 *
 * @param options - Configuration options
 * @param options.home - Home breadcrumb item (optional)
 * @returns Computed breadcrumbs and override methods
 *
 * @example
 * ```ts
 * // Route meta setup:
 * // { path: '/users', meta: { breadcrumb: 'Users' } }
 * // { path: '/users/:id', meta: { breadcrumb: 'User Details' } }
 *
 * const { breadcrumbs, override, append, reset } = useBreadcrumbs({
 *   home: { label: 'Home', path: '/', icon: 'home' }
 * })
 *
 * // Auto-generated breadcrumbs from route:
 * // [{ label: 'Home', path: '/' }, { label: 'Users', path: '/users' }, { label: 'User Details' }]
 *
 * // Override for custom breadcrumbs
 * override([
 *   { label: 'Dashboard', path: '/dashboard' },
 *   { label: 'Settings' }
 * ])
 *
 * // Append to auto-generated
 * append({ label: 'Edit' })
 *
 * // Reset to auto-generated
 * reset()
 * ```
 */
import { ref, computed, watch, onUnmounted, type ComputedRef } from 'vue';
import { useRoute, type RouteLocationMatched } from 'vue-router';

export interface Breadcrumb {
	/** Display label */
	label: string;
	/** Navigation path (optional for current page) */
	path?: string;
	/** Icon identifier (optional) */
	icon?: string;
}

export interface UseBreadcrumbsOptions {
	/** Home breadcrumb item (prepended to all breadcrumbs) */
	home?: Breadcrumb;
}

export interface UseBreadcrumbsReturn {
	/** Computed breadcrumb items */
	breadcrumbs: ComputedRef<Breadcrumb[]>;
	/** Override all breadcrumbs with custom items */
	override: (items: Breadcrumb[]) => void;
	/** Append item to breadcrumbs */
	append: (item: Breadcrumb) => void;
	/** Reset to auto-generated breadcrumbs */
	reset: () => void;
}

interface RouteMeta {
	breadcrumb?: string | ((route: RouteLocationMatched) => string);
	breadcrumbIcon?: string;
}

export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): UseBreadcrumbsReturn {
	const { home } = options;
	const route = useRoute();

	// Manual overrides
	const overrideItems = ref<Breadcrumb[] | null>(null);
	const appendedItems = ref<Breadcrumb[]>([]);

	const generateBreadcrumbs = (): Breadcrumb[] => {
		const items: Breadcrumb[] = [];

		// Add home if provided
		if (home) {
			items.push(home);
		}

		// Generate from matched routes
		const matched = route.matched;

		for (let i = 0; i < matched.length; i++) {
			const matchedRoute = matched[i];
			const meta = matchedRoute.meta as RouteMeta;

			if (!meta.breadcrumb) continue;

			const label =
				typeof meta.breadcrumb === 'function' ? meta.breadcrumb(matchedRoute) : meta.breadcrumb;

			const breadcrumb: Breadcrumb = {
				label,
			};

			// Add path for all except last item (current page)
			if (i < matched.length - 1) {
				breadcrumb.path = matchedRoute.path;
			}

			// Add icon if provided
			if (meta.breadcrumbIcon) {
				breadcrumb.icon = meta.breadcrumbIcon;
			}

			items.push(breadcrumb);
		}

		// Add appended items
		items.push(...appendedItems.value);

		return items;
	};

	const breadcrumbs = computed<Breadcrumb[]>(() => {
		if (overrideItems.value !== null) {
			return home ? [home, ...overrideItems.value] : overrideItems.value;
		}
		return generateBreadcrumbs();
	});

	const override = (items: Breadcrumb[]): void => {
		overrideItems.value = items;
		appendedItems.value = [];
	};

	const append = (item: Breadcrumb): void => {
		// Only append if not overridden
		if (overrideItems.value === null) {
			appendedItems.value = [...appendedItems.value, item];
		} else {
			overrideItems.value = [...overrideItems.value, item];
		}
	};

	const reset = (): void => {
		overrideItems.value = null;
		appendedItems.value = [];
	};

	// Reset when route changes
	const stopWatch = watch(
		() => route.path,
		() => {
			reset();
		},
	);

	onUnmounted(() => {
		stopWatch();
	});

	return {
		breadcrumbs,
		override,
		append,
		reset,
	};
}
