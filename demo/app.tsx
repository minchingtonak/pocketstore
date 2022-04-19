import createStore from '../src';

const { useStore: useCount, setStore: setCount } = createStore(0);

export function App() {
	const count = useCount();

	return (
		<button onClick={() => setCount(count => count + 1)}>Click {count}</button>
	);
}
