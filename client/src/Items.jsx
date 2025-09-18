import React, { useEffect, useState } from 'react';

function Items() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const addItem = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const newItem = await res.json();
    setItems([...items, newItem]);
    setText('');
  };

  const deleteItem = async id => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    setItems(items.filter(item => item._id !== id));
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h2>Items (MongoDB Atlas)</h2>
      <form onSubmit={addItem} style={{ marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="New item..." />
        <button type="submit">Add</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {items.map(item => (
            <li key={item._id}>
              {item.text} <button onClick={() => deleteItem(item._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Items;
