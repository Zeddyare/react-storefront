import { useState, useEffect } from 'react';

export default function Home() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetch('/api/items');
      const items = await response.json();
      setItems(items);
    };

    fetchItems();
  }, []);



  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to our store</p>
    </div>
  );
}