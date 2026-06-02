/** AM / PM marker used by the 12-hour clock segment. */
export type DayPeriod = 'AM' | 'PM';

/** Which side of the range the call applies to. */
export type RangeSide = 'start' | 'end';

/**
 * Public API exposed by `DayPeriodRangeToggle` via `defineExpose`. Consumers
 * grab a template ref typed as `InstanceType<typeof DayPeriodRangeToggle>`
 * and call these methods to drive the AM/PM segment for either range side
 * without going through Reka's built-in keyboard handler.
 */
export interface DayPeriodRangeToggleApi {
	/** Flip the dayPeriod for the given side. No-op if the field has no dayPeriod segment. */
	toggle(type: RangeSide): void;
	/** Set the dayPeriod for the given side to a specific value (idempotent). */
	setDayPeriod(type: RangeSide, target: DayPeriod): void;
}
