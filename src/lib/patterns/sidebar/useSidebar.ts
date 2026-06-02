import { computed, inject, onMounted, onUnmounted, ref, toRef, type Ref } from 'vue';
import {
	SIDEBAR_CONTEXT_KEY,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_KEYBOARD_SHORTCUT,
	type SidebarCollapsible,
	type SidebarContext,
	type SidebarSide,
	type SidebarState,
} from './sidebar';

const MOBILE_BREAKPOINT = 1024;

// Stable id used by the SidebarTrigger's aria-controls and by the mobile
// drawer DialogContent so screen readers can associate the two.
export const SIDEBAR_DRAWER_ID = 'sidebar-drawer';

/**
 * Consumer composable — use inside any descendant of SidebarProvider.
 */
export function useSidebar(): SidebarContext {
	const ctx = inject(SIDEBAR_CONTEXT_KEY);
	if (!ctx) {
		throw new Error('useSidebar() must be used within a <SidebarProvider>');
	}
	return ctx;
}

/**
 * Creator — used only inside SidebarProvider.vue to build the context object.
 */
export interface CreateSidebarOptions {
	defaultOpen?: boolean;
	open?: Ref<boolean | undefined>;
	collapsible?: Ref<SidebarCollapsible>;
	side?: Ref<SidebarSide>;
	onOpenChange?: (value: boolean) => void;
}

export function createSidebarContext(opts: CreateSidebarOptions): SidebarContext {
	// SSR guard: matchMedia is undefined during server render.
	// Initialise isMobile synchronously to avoid a flash of the wrong layout.
	const mobileQuery =
		typeof window !== 'undefined'
			? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
			: null;
	const isMobile = ref(mobileQuery?.matches ?? false);
	const openMobile = ref(false);

	// SSR guard: localStorage is undefined during server render.
	const stored = typeof window !== 'undefined' ? localStorage.getItem(SIDEBAR_COOKIE_NAME) : null;
	const internalOpen = ref(stored !== null ? stored === 'true' : (opts.defaultOpen ?? true));

	// Mobile detection — listen for changes
	if (mobileQuery) {
		const handler = (e: MediaQueryListEvent) => {
			isMobile.value = e.matches;
		};
		mobileQuery.addEventListener('change', handler);
		onUnmounted(() => mobileQuery.removeEventListener('change', handler));
	}

	// Controlled vs uncontrolled open state
	const isControlled = () => opts.open?.value !== undefined;

	const open = computed({
		get: () => opts.open?.value ?? internalOpen.value,
		set: (val: boolean) => {
			if (isControlled()) {
				opts.onOpenChange?.(val);
			} else {
				internalOpen.value = val;
				localStorage.setItem(SIDEBAR_COOKIE_NAME, String(val));
			}
		},
	});

	// On mobile the sidebar is an overlay drawer — desktop collapse state is irrelevant
	const state = computed<SidebarState>(() =>
		isMobile.value ? 'expanded' : open.value ? 'expanded' : 'collapsed',
	);

	function setOpen(value: boolean) {
		open.value = value;
	}

	function toggleSidebar() {
		if (isMobile.value) {
			openMobile.value = !openMobile.value;
		} else {
			open.value = !open.value;
		}
	}

	function setOpenMobile(value: boolean) {
		openMobile.value = value;
	}

	// Keyboard shortcut: Ctrl+B / Cmd+B
	onMounted(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener('keydown', handler);
		onUnmounted(() => window.removeEventListener('keydown', handler));
	});

	return {
		state,
		open: toRef(open),
		setOpen,
		toggleSidebar,
		openMobile,
		setOpenMobile,
		isMobile,
		collapsible: computed(() => opts.collapsible?.value ?? 'offcanvas'),
		side: computed(() => opts.side?.value ?? 'left'),
	};
}
