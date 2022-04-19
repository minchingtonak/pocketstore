import { useState } from 'react';
import { isFn, shouldUpdate, useAvailableEffect } from './utils';

export type SetStoreAction<T> = T | ((prevStore: T) => T);

export type Mapper<StoreType = unknown, MappedType = unknown> = (
	s: StoreType
) => MappedType;

export type Reducer<StoreType, ActionType> = (
	store: StoreType,
	action: ActionType
) => StoreType;

export type StoreFns<T> = {
	getStore: () => T;
	setStore: (newStore: SetStoreAction<T>) => void;
	useStore: {
		(): T;
		<MappedType>(mapper: Mapper<T, MappedType>): MappedType;
	};
};

export type ReducerStoreFns<T, A> = {
	getStore: () => T;
	dispatch: (action: A) => void;
	useStore: {
		(): T;
		<MappedType>(mapper: Mapper<T, MappedType>): MappedType;
	};
};

export type CreateStoreFn = {
	<T = undefined>(): StoreFns<T | undefined>;
	<T>(initialValue: T): StoreFns<T>;
	<T, A>(initialValue: T, reducer: Reducer<T, A>): ReducerStoreFns<T, A>;
};

const createStore: CreateStoreFn = <T, A>(
	initialValue?: T,
	reducer?: Reducer<T | undefined, A>
) => {
	type Listener = {
		mapped: unknown;
		mapper?: Mapper;
		updater: (action: unknown) => void;
	};

	let store = initialValue;
	const listeners = new Set<Listener>();

	const getStore = () => store;

	const updateHooks = () => {
		listeners.forEach(({ mapped, mapper, updater }) => {
			const newMapped = mapper ? mapper(store) : store;
			if (shouldUpdate(mapped, newMapped)) {
				updater(() => newMapped);
			}
		});
	};

	const setStore = (newStore: SetStoreAction<T | undefined>) => {
		store = isFn<(prev: T | undefined) => T | undefined>(newStore)
			? newStore(store)
			: newStore;
		updateHooks();
	};

	const dispatch = (action: A) => {
		if (!reducer) {
			console.error(
				'Please initialize this store with a reducer before calling dispatch()'
			);
			return;
		}
		store = reducer(store, action);
		updateHooks();
	};

	const useStore = <MappedType>(mapper?: Mapper<T | undefined, MappedType>) => {
		const [, updater] = useState<unknown>();
		const mapped = mapper ? mapper(store) : store;

		useAvailableEffect(() => {
			const listener: Listener = {
				mapped,
				mapper: mapper as Mapper,
				updater,
			};

			listeners.add(listener);
			return () => void listeners.delete(listener);
		}, [mapped, mapper]);

		return mapped;
	};

	return {
		getStore,
		setStore,
		dispatch,
		useStore,
	};
};

export default createStore;
