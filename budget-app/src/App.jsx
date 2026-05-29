import { useEffect, useState } from "react";
import ItemsTable from "./components/ItemsTable";

function App() {
  const [items, setItems] = useState([]);

  const loadItems = () => {
    fetch("http://localhost/bill/backend/api/items.php")
      .then(res => res.json())
      .then(data => setItems(data));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const updateHoldAmount = (id, newHold) => {
    fetch("http://localhost/bill/backend/api/update_hold.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hold_amount: newHold })
    })
      .then(res => res.json())
      .then(() => loadItems());
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Budget App</h1>

      <ItemsTable items={items} onHoldChange={updateHoldAmount} />
    </div>
  );
}

export default App;
