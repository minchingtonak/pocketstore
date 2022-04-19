import { useEffect, useLayoutEffect } from 'react';

export const isFn = <T = (...args: unknown[]) => unknown>(v: unknown): v is T =>
	typeof v === 'function';

export const isObj = <T = { [k: string]: unknown }>(v: unknown): v is T =>
	typeof v === 'object' && !Array.isArray(v) && v !== null;

export const useAvailableEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

const shouldUpdateBase = (
	check: ShouldUpdateFn,
	state: unknown,
	newState: unknown
): boolean => {
	if (state === newState) {
		return false;
	}

	if (isObj(state) && isObj(newState)) {
		for (const key in state) {
			if (check(state[key], newState[key])) {
				return true;
			}
		}
		return false;
	}

	if (Array.isArray(state) && Array.isArray(newState)) {
		if (state.length !== newState.length) {
			return true;
		}
		return state.findIndex((elt, idx) => check(elt, newState[idx])) !== -1;
	}

	return true;
};

export type ShouldUpdateFn = (state: unknown, newState: unknown) => boolean;

export const shouldUpdate: ShouldUpdateFn = shouldUpdateBase.bind(
	null,
	(a, b) => a !== b
);

export const deepShouldUpdate: ShouldUpdateFn = shouldUpdateBase.bind(
	null,
	(a, b) => deepShouldUpdate(a, b)
);
