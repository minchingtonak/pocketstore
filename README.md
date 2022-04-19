# tinystore

Tiny, dead-simple, TypeScript-first global state store for react/preact.

## Usage

### createStore

```ts
const initialValue = 'hello world';

// basic
const { getStore, setStore, useStore } = createStore(initalValue);

// with specific type
const { getStore, setStore, useStore } = createStore<string | number>(
	initalValue
);

// with reducer
type StoreAction =
	| {
			type: 'add';
			value: string;
	  }
	| {
			type: 'clear';
	  };

const reducer = (store: string, action: StoreAction) => {
	switch (action.type) {
		case 'add':
			return store + action.value;
		case 'clear':
			return '';
	}
};

// creating a store with a reducer causes a dispatch() function to be returned
// instead of setStore().
const { getStore, dispatch, useStore } = createStore(initialValue, reducer);
```

### useStore hook

```tsx
const { setStore: setUserData, useStore: useUserData } = createStore({
	name: '',
	count: 0,
});

const NameEntryForm = () => {
	// useStore allows mapping stored data to avoid unnecessary rerenders
	// and provide a cleaner way of accessing the stored data
	const name = useUserData(s => s.name);

	const updateName = (e: ChangeEvent<HTMLInputElement>) => {
		setUserData(d => ({ ...d, name: e.target.value }));
	};

	return <input value={name} onChange={updateName} />;
};

const UserInfo = () => {
	const data = useUserData();

	const onCountButtonClick = () =>
		setUserData(d => ({ ...d, count: d.count + 1 }));

	return (
		<div>
			<p>User: {data.name}</p>
			<button onClick={onCountButtonClick}>
				Has clicked this button {data.count} times
			</button>
		</div>
	);
};
```

## Credits

Based heavily on [react-hstore](https://github.com/stevekanger/react-hstore)
