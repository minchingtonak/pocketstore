import { Dispatch, SetStateAction, useState } from 'react';
import { isFn, shouldUpdate, useAvailableEffect } from './utils';

export type Mapper<StoreType = unknown, MappedType = unknown> = (
	s: StoreType
) => MappedType;

export type Reducer<StoreType, ActionType> = (
	store: StoreType,
	action: ActionType
) => StoreType;

export type StoreFunctions<T> = {
	getStore: () => T;
	setStore: (newStore: SetStateAction<T>) => void;
	useStore: {
		(): T;
		<MappedType>(mapper: Mapper<T, MappedType>): MappedType;
	};
};

export type ReducerStoreFunctions<T, A> = {
	getStore: () => T;
	dispatch: (action: A) => void;
	useStore: {
		(): T;
		<MappedType>(mapper: Mapper<T, MappedType>): MappedType;
	};
};

export type CreateStore = {
	<T = undefined>(): StoreFunctions<T | undefined>;
	<T>(initialValue: T): StoreFunctions<T>;
	<T, A>(initialValue: T, reducer: Reducer<T, A>): ReducerStoreFunctions<T, A>;
};

const createStore: CreateStore = <T, A>(
	initialValue?: T,
	reducer?: Reducer<T | undefined, A>
) => {
	type Listener = {
		mapped: unknown;
		mapper?: Mapper;
		updater: Dispatch<unknown>;
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

	const setStore = (newStore: SetStateAction<T | undefined>) => {
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
