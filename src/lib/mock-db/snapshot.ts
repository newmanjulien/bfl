function deepFreeze<T>(value: T): T {
	if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}

	Object.freeze(value);

	for (const key of Reflect.ownKeys(value)) {
		deepFreeze((value as Record<PropertyKey, unknown>)[key]);
	}

	return value;
}

function cloneValue<T>(value: T): T {
	if (typeof globalThis.structuredClone === 'function') {
		return globalThis.structuredClone(value);
	}

	return JSON.parse(JSON.stringify(value)) as T;
}

export function createSnapshot<T>(value: T): T {
	return deepFreeze(cloneValue(value));
}
