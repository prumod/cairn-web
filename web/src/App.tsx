import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Vite + React</h1>
      <button onClick={() => setCount((current) => current + 1)}>Count is {count}</button>
    </main>
  );
}
