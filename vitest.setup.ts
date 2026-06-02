import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import { config } from '@vue/test-utils';

// Explicit registration of jest-dom matchers (toHaveAttribute,
// toBeInTheDocument, toHaveClass, etc.). The auto-extending entry
// `@testing-library/jest-dom/vitest` isn't reliably picked up in our
// vitest workspace setup; this guarantees the matchers exist.
expect.extend(matchers);

// Global configuration for Vue Test Utils
config.global.stubs = {
	// Stub teleport to avoid issues with portals
	teleport: true,
};

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

// Mock ResizeObserver
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;
