/**
 * Typed pub/sub event bus using mitt.
 *
 * @returns Emit, on, and off methods for typed events
 *
 * @example
 * ```ts
 * // Define event types
 * interface AppEvents {
 *   'user:login': { userId: string; timestamp: number }
 *   'user:logout': void
 *   'notification:show': { message: string; type: 'info' | 'error' }
 * }
 *
 * // Create typed bus (singleton recommended)
 * const bus = useEventBus<AppEvents>()
 *
 * // Subscribe to events
 * bus.on('user:login', (payload) => {
 *   console.log(`User ${payload.userId} logged in`)
 * })
 *
 * // Emit events
 * bus.emit('user:login', { userId: '123', timestamp: Date.now() })
 *
 * // Unsubscribe
 * bus.off('user:login', handler)
 * ```
 */
import mitt, { type Emitter, type EventType, type Handler } from 'mitt';
import { onUnmounted } from 'vue';

export interface UseEventBusReturn<T extends Record<EventType, unknown>> {
	/** Emit an event with payload */
	emit: <K extends keyof T>(event: K, payload: T[K]) => void;
	/** Subscribe to an event */
	on: <K extends keyof T>(event: K, handler: Handler<T[K]>) => void;
	/** Unsubscribe from an event */
	off: <K extends keyof T>(event: K, handler: Handler<T[K]>) => void;
	/** Clear all handlers for an event, or all events if no type provided */
	clear: <K extends keyof T>(event?: K) => void;
}

// Global emitter instance for singleton pattern
let globalEmitter: Emitter<Record<EventType, unknown>> | null = null;

function getGlobalEmitter<T extends Record<EventType, unknown>>(): Emitter<T> {
	if (!globalEmitter) {
		globalEmitter = mitt<Record<EventType, unknown>>();
	}
	return globalEmitter as Emitter<T>;
}

/**
 * Creates a typed event bus.
 *
 * @param options.global - Use a global singleton emitter (default: true)
 * @param options.autoCleanup - Auto-unsubscribe on component unmount (default: true)
 */
export function useEventBus<T extends Record<EventType, unknown>>(
	options: { global?: boolean; autoCleanup?: boolean } = {},
): UseEventBusReturn<T> {
	const { global = true, autoCleanup = true } = options;

	const emitter: Emitter<T> = global ? getGlobalEmitter<T>() : mitt<T>();

	// Track handlers for auto cleanup
	const handlers = new Map<keyof T, Set<Handler<T[keyof T]>>>();

	const emit = <K extends keyof T>(event: K, payload: T[K]): void => {
		emitter.emit(event, payload);
	};

	const on = <K extends keyof T>(event: K, handler: Handler<T[K]>): void => {
		emitter.on(event, handler as Handler<T[keyof T]>);

		if (autoCleanup) {
			if (!handlers.has(event)) {
				handlers.set(event, new Set());
			}
			handlers.get(event)!.add(handler as Handler<T[keyof T]>);
		}
	};

	const off = <K extends keyof T>(event: K, handler: Handler<T[K]>): void => {
		emitter.off(event, handler as Handler<T[keyof T]>);

		if (autoCleanup) {
			handlers.get(event)?.delete(handler as Handler<T[keyof T]>);
		}
	};

	const clear = <K extends keyof T>(event?: K): void => {
		if (event) {
			// Clear all handlers for specific event
			const eventHandlers = handlers.get(event);
			if (eventHandlers) {
				eventHandlers.forEach((handler) => {
					emitter.off(event, handler);
				});
				eventHandlers.clear();
			}
		} else {
			// Clear all handlers
			handlers.forEach((eventHandlers, event) => {
				eventHandlers.forEach((handler) => {
					emitter.off(event, handler);
				});
			});
			handlers.clear();
		}
	};

	// Auto cleanup on unmount
	if (autoCleanup) {
		onUnmounted(() => {
			clear();
		});
	}

	return {
		emit,
		on,
		off,
		clear,
	};
}

/**
 * Reset the global event bus (mainly for testing).
 */
export function resetGlobalEventBus(): void {
	if (globalEmitter) {
		globalEmitter.all.clear();
	}
	globalEmitter = null;
}
