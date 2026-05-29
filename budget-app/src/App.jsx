import { useState } from "react";
import ItemsTable from "./components/ItemsTable";

function App() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Car Payment",
      due_date: "2024-06-15",
      amount: 350,
      hold_amount: 50,
      apr: 4.5
    },
    {
      id: 2,
      name: "Credit Card",
      due_date: "2024-06-20",
      amount: 120,
      hold_amount: 20,
      apr: 22.9
    }
  ]);

  return (
    <div className="container py-4">
      <h1 className="mb-4">Budget App</h1>

      <ItemsTable items={items} />
    </div>
  );
}

export default App;
