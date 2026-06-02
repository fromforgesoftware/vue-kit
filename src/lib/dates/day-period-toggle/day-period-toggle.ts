/** AM / PM marker used by the 12-hour clock segment. */
export type DayPeriod = 'AM' | 'PM';

/**
 * Public API exposed by `DayPeriodToggle` via `defineExpose`. Consumers grab a
 * template ref typed as `InstanceType<typeof DayPeriodToggle>` and call these
 * methods to drive the AM/PM segment without going through Reka's built-in
 * keyboard handler.
 */
export interface DayPeriodToggleApi {
	/** Flip the dayPeriod between AM and PM. No-op if the field has no dayPeriod segment. */
	toggle(): void;
	/** Set the dayPeriod to a specific value (idempotent — no-op if already set). */
	setDayPeriod(target: DayPeriod): void;
}
