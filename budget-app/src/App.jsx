import { useEffect, useState } from "react";
import ItemsTable from "./components/ItemsTable";
import EditItemModal from "./components/EditItemModal";
import PaymentHistoryModal from "./components/PaymentHistoryModal";
import MobileCards from "./components/MobileCards";

function App() {
  const [items, setItems] = useState([]);
  const [view, setView] = useState("auto"); // auto | table | mobile
  const [isMobile, setIsMobile] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);

  // Detect mobile screen
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch items
  useEffect(() => {
    fetch("http://localhost/bill/backend/api/get_items.php")
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  // Modal handlers
  const openModal = item => {
    setEditItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const openHistory = item => {
    setHistoryItem(item);
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setHistoryItem(null);
  };

  // Decide what to show
  const showMobile = view === "mobile" || (view === "auto" && isMobile);

  return (
    <div className="container py-3">

      {/* Toggle Buttons */}
      <div className="mb-3">
        <button
          className={`btn btn-sm me-2 ${view === "table" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setView("table")}
        >
          Table
        </button>

        <button
          className={`btn btn-sm me-2 ${view === "mobile" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setView("mobile")}
        >
          Mobile Cards
        </button>

        <button
          className={`btn btn-sm ${view === "auto" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setView("auto")}
        >
          Auto
        </button>
      </div>

      {/* Layout Switch */}
      {showMobile ? (
        <MobileCards items={items} />
      ) : (
        <ItemsTable
          items={items}
          onEdit={openModal}
          onHistory={openHistory}
        />
      )}

      {/* Modals */}
      <EditItemModal show={showModal} item={editItem} onClose={closeModal} />
      <PaymentHistoryModal show={showHistory} item={historyItem} onClose={closeHistory} />
    </div>
  );
}

export default App;
