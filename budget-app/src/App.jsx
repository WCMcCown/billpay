import { useEffect, useState } from "react";
import ItemsTable from "./components/ItemsTable";
import EditItemModal from "./components/EditItemModal";

function App() {
  const [items, setItems] = useState([]);

  // Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load items from backend
  const loadItems = () => {
    fetch("http://localhost/bill/backend/api/items.php")
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("API error:", err));
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Inline hold amount update
  const updateHoldAmount = (id, newHold) => {
    fetch("http://localhost/bill/backend/api/update_hold.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hold_amount: newHold })
    })
      .then(res => res.json())
      .then(() => loadItems());
  };

  // Open modal
  const openModal = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // Save full item edit
  const updateFullItem = (id, form) => {
    fetch("http://localhost/bill/backend/api/update_item.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form })
    })
      .then(res => res.json())
      .then(() => {
        closeModal();
        loadItems();
      });
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Budget App</h1>

      <ItemsTable
        items={items}
        onHoldChange={updateHoldAmount}
        onEdit={openModal}
      />

      <EditItemModal
        show={showModal}
        item={editingItem}
        onClose={closeModal}
        onSave={updateFullItem}
      />
    </div>
  );
}

export default App;
