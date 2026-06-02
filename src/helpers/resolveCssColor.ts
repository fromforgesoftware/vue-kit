/**
 * Chart.js writes colors to a <canvas> `fillStyle`, which doesn't resolve CSS
 * `var(--token)`. Computed values like `oklch(0.646 0.222 41.116)` are valid
 * canvas colors in modern browsers, so we resolve `var()` at runtime and pass
 * the concrete value through. Anything else (`#abc`, `rgb(...)`, named) is
 * returned as-is.
 */
export function resolveCssColor(color: string): string {
	if (typeof window === 'undefined' || !color.startsWith('var(')) return color;
	const match = color.match(/var\(\s*(--[^,)\s]+)/);
	if (!match) return color;
	const computed = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
	return computed || color;
}
