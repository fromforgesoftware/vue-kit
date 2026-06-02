import { useBreakpoints } from '@vueuse/core';

/**
 * Pre-configured responsive breakpoints matching Tailwind CSS v4 defaults.
 *
 * Use Tailwind classes (sm:, md:, lg:) for styling. Only use this composable
 * when CSS alone can't express the behaviour: v-if component swaps, dynamic
 * prop values, or computed JS values.
 */
export function useResponsive() {
	const breakpoints = useBreakpoints({
		sm: 640,
		md: 768,
		lg: 1024,
		xl: 1280,
	});

	return {
		/** Raw breakpoint refs — true when viewport ≥ breakpoint */
		sm: breakpoints.greaterOrEqual('sm'),
		md: breakpoints.greaterOrEqual('md'),
		lg: breakpoints.greaterOrEqual('lg'),
		xl: breakpoints.greaterOrEqual('xl'),

		/** Semantic helpers */
		isMobile: breakpoints.smaller('sm'), // < 640px
		isTablet: breakpoints.between('sm', 'lg'), // 640–1023px
		isDesktop: breakpoints.greaterOrEqual('lg'), // ≥ 1024px
	};
}
