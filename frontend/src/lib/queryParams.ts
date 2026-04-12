/*
Adi Avraham
CMSC495 Group Golf Capstone Project
queryParams.ts
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Normalizes and builds query-string state used by routed frontend views.
*/

// Normalizes a string query value against an allowed enum set with a safe fallback.
export function normalizeEnumParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
	if (value && allowed.includes(value as T)) {
		return value as T;
	}

	return fallback;
}

// Builds a single-key query object while omitting the default value from the URL.
export function buildSingleParamState(key: string, value: string, defaultValue: string) {
	return value === defaultValue ? {} : { [key]: value };
}

// Checks whether a query parameter is present and contains a non-empty value.
export function hasQueryParam(searchParams: URLSearchParams, key: string) {
	const value = searchParams.get(key);
	return typeof value === 'string' && value.trim() !== '';
}
