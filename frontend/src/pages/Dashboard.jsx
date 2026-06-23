import React, { useEffect, useState, useMemo } from "react";

import EditBill from "./EditBill";
import AddBill from "./AddBill";
import AddUpcomingExpense from "./AddUpcomingExpense";
import EditUpcomingExpense from "./EditUpcomingExpense";

import Modal from "../components/Modal";

import BillsTableFull from "../components/layouts/BillsTableFull";
import BillsTableStandard from "../components/layouts/BillsTableStandard";
import BillsTableCompact from "../components/layouts/BillsTableCompact";

import DebtSummary from "../components/debt/DebtSummary";
import DebtProjections from "../components/debt/DebtProjections";

import columnConfig, { defaultOrder } from "../utils/columnConfig";
import { sortData } from "../utils/sorting";
import * as helpers from "../utils/helpers";

import { apiFetch } from "../api/http";   // ⭐ NEW — centralized API wrapper

const Dashboard = ({ user, ready }) => {
  // -----------------------------
  // Core state
  // -----------------------------
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [bills, setBills] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [startingAmount, setStartingAmount] = useState(0);
  const [reserveAmount, setReserveAmount] = useState(0);
  const [columnOrder, setColumnOrder] = useState(defaultOrder);

  const [effectiveLayout, setEffectiveLayout] = useState("full");

  const [sortField, setSortField] = useState("due_day");
  const [sortDirection, setSortDirection] = useState("asc");

  const [editingBillId, setEditingBillId] = useState(null);
  const [addingBill, setAddingBill] = useState(false);
  const [addingUpcoming, setAddingUpcoming] = useState(false);
  const [editingUpcomingId, setEditingUpcomingId] = useState(null);

  // -----------------------------
  // Load settings + bills + upcoming
  // -----------------------------
  useEffect(() => {
    if (!ready || !user?.id) return;

    setLoading(true);

    async function loadAll() {
      try {
        const [settingsRes, billsRes, upcomingRes] = await Promise.all([
          apiFetch(`settings.php?user_id=${user.id}`),
          apiFetch(`bills.php?user_id=${user.id}`),
          apiFetch(`upcoming_expenses.php?user_id=${user.id}`)
        ]);

        // SETTINGS
        if (settingsRes.success) {
          const s = settingsRes.settings;
          setSettings(s);
          setStartingAmount(parseFloat(s.starting_amount || 0));
          setReserveAmount(parseFloat(s.reserve_amount || 0));

          if (s.column_order) {
            try {
              setColumnOrder(JSON.parse(s.column_order));
            } catch {
              setColumnOrder(defaultOrder);
            }
          } else {
            setColumnOrder(defaultOrder);
          }
        }

        // BILLS
        if (billsRes.success) {
          const initialized = (billsRes.bills || []).map((bill) => ({
            ...bill,
            hold_amount:
              bill.hold_amount ??
              helpers.calculateHoldForBill(bill, settingsRes.settings),
          }));
          setBills(initialized);
        }

        // UPCOMING
        if (upcomingRes.success) {
          const initialized = (upcomingRes.expenses || []).map((item) => ({
            ...item,
            hold_amount: item.hold_amount ?? parseFloat(item.amount || 0),
          }));
          setUpcoming(initialized);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      }

      setLoading(false);
    }

    loadAll();
  }, [ready, user]);

  // -----------------------------
  // Determine effective layout
  // -----------------------------
  useEffect(() => {
    if (!settings) return;

    const {
      responsive_mode,
      layout_phone,
      layout_tablet,
      layout_desktop,
      layout_global,
    } = settings;

    if (responsive_mode === 0) {
      setEffectiveLayout(layout_global);
      return;
    }

    const updateLayout = () => {
      const w = window.innerWidth;
      if (w < 768) setEffectiveLayout(layout_phone);
      else if (w < 1200) setEffectiveLayout(layout_tablet);
      else setEffectiveLayout(layout_desktop);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [settings]);

  // -----------------------------
  // Sorting
  // -----------------------------
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedBills = useMemo(
    () => sortData(bills, sortField, sortDirection),
    [bills, sortField, sortDirection]
  );

  const sortedUpcoming = useMemo(
    () =>
      sortData(
        upcoming,
        sortField === "due_day" ? "due_date" : sortField,
        sortDirection
      ),
    [upcoming, sortField, sortDirection]
  );

  // -----------------------------
  // Column order saving
  // -----------------------------
  const saveColumnOrder = async (order) => {
    setColumnOrder(order);

    try {
      await apiFetch("settings.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          column_order: order,
        }),
      });
    } catch (err) {
      console.error("Failed to save column order:", err);
    }
  };

  // -----------------------------
  // Hold updates
  // -----------------------------
  const updateBillHold = (id, newHold) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, hold_amount: parseFloat(newHold || 0) } : b
      )
    );
  };

  const updateUpcomingHold = (id, newHold) => {
    setUpcoming((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, hold_amount: parseFloat(newHold || 0) } : u
      )
    );
  };

  // -----------------------------
  // Totals
  // -----------------------------
  const totalBillsHold = bills.reduce(
    (sum, b) => sum + parseFloat(b.hold_amount || 0),
    0
  );

  const totalUpcomingHold = upcoming.reduce(
    (sum, u) => sum + parseFloat(u.hold_amount || 0),
    0
  );

  const totalHoldPerCheck = totalBillsHold + totalUpcomingHold;

  // -----------------------------
  // Save starting + reserve amounts
  // -----------------------------
  const saveStartingAmount = async (value) => {
    try {
      await apiFetch("settings.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          starting_amount: value,
        }),
      });
    } catch (err) {
      console.error("Failed to save starting amount:", err);
    }
  };

  const saveReserveAmount = async (value) => {
    try {
      await apiFetch("settings.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          reserve_amount: value,
        }),
      });
    } catch (err) {
      console.error("Failed to save reserve amount:", err);
    }
  };

  // -----------------------------
  // Delete handlers
  // -----------------------------
  const deleteUpcoming = async (id) => {
    try {
      await apiFetch("upcoming_expenses.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, user_id: user.id }),
      });

      setUpcoming((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete upcoming expense:", err);
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    try {
      const data = await apiFetch("bills.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, user_id: user.id }),
      });

      if (data.success) {
        setBills((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete bill:", err);
    }
  };

  // -----------------------------
  // Layout rendering
  // -----------------------------
  const renderBills = () => {
    const props = {
      bills: sortedBills,
      columnOrder,
      onColumnOrderChange: saveColumnOrder,
      onSort: handleSort,
      sortField,
      sortDirection,
      onEditBill: setEditingBillId,
      onDeleteBill: handleDeleteBill,
    };

    switch (effectiveLayout) {
      case "compact":
        return <BillsTableCompact {...props} />;
      case "standard":
        return <BillsTableStandard {...props} />;
      case "full":
      default:
        return <BillsTableFull {...props} />;
    }
  };

  // -----------------------------
  // Main render
  // -----------------------------
  if (loading) return <div>Loading dashboard…</div>;

  return (
    <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
      <h2>Dashboard</h2>

      {/* STARTING AMOUNT */}
      <div style={{ marginBottom: "25px" }}>
        <label>
          <strong>Starting Amount (Cash on Hand):</strong>
        </label>
        <input
          type="number"
          step="0.01"
          value={startingAmount}
          onChange={(e) =>
            setStartingAmount(parseFloat(e.target.value || 0))
          }
          onBlur={() => saveStartingAmount(startingAmount)}
          className="form-control"
          style={{ width: "200px" }}
        />
      </div>

      {/* RESERVE AMOUNT */}
      <div style={{ marginBottom: "25px" }}>
        <label>
          <strong>Reserve Amount (Cash Buffer):</strong>
        </label>
        <input
          type="number"
          step="0.01"
          value={reserveAmount}
          onChange={(e) =>
            setReserveAmount(parseFloat(e.target.value || 0))
          }
          onBlur={() => saveReserveAmount(reserveAmount)}
          className="form-control"
          style={{ width: "200px" }}
        />
      </div>

      {/* UPCOMING EXPENSES */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Upcoming Expenses</h3>
        <button
          className="btn btn-success"
          style={{ marginBottom: "15px" }}
          onClick={() => setAddingUpcoming(true)}
        >
          + Add Upcoming Expense
        </button>

        <BillsTableFull
          bills={sortedUpcoming}
          columnOrder={columnOrder}
          onColumnOrderChange={saveColumnOrder}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onEditBill={setEditingUpcomingId}
          onDeleteBill={deleteUpcoming}
        />
      </div>

      {/* BILLS */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Bills</h3>
        <button
          className="btn btn-success"
          onClick={() => setAddingBill(true)}
          style={{ marginBottom: "15px" }}
        >
          + Add Bill
        </button>

        {renderBills()}
      </div>

      {/* TOTALS */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Totals</h3>
        <p>
          <strong>Total Bills Hold:</strong>{" "}
          {helpers.money(totalBillsHold)}
        </p>
        <p>
          <strong>Total Upcoming Hold:</strong>{" "}
          {helpers.money(totalUpcomingHold)}
        </p>
        <p>
          <strong>Total Hold Per Check:</strong>{" "}
          {helpers.money(totalHoldPerCheck)}
        </p>

        <h4>
          Free to Spend:{" "}
          {helpers.money(
            startingAmount -
              reserveAmount -
              (totalBillsHold + totalUpcomingHold)
          )}
        </h4>
      </div>

      {/* DEBT SUMMARY */}
      <div style={{ marginBottom: "40px", marginTop: "20px" }}>
        <DebtSummary bills={bills} />
        <DebtProjections bills={bills} />
      </div>

      {/* MODALS */}
      {editingBillId && (
        <Modal onClose={() => setEditingBillId(null)}>
          <EditBill
            billId={editingBillId}
            onClose={(updatedBill) => {
              setEditingBillId(null);
              if (updatedBill) {
                setBills((prev) =>
                  prev.map((b) =>
                    b.id === updatedBill.id ? updatedBill : b
                  )
                );
              }
            }}
          />
        </Modal>
      )}

      {addingBill && (
        <Modal onClose={() => setAddingBill(false)}>
          <AddBill
            user={user}
            onClose={(newBill) => {
              setAddingBill(false);
              if (newBill) {
                setBills((prev) => [...prev, newBill]);
              }
            }}
          />
        </Modal>
      )}

      {addingUpcoming && (
        <Modal onClose={() => setAddingUpcoming(false)}>
          <AddUpcomingExpense
            user={user}
            onClose={(newExpense) => {
              setAddingUpcoming(false);
              if (newExpense) {
                setUpcoming((prev) => [...prev, newExpense]);
              }
            }}
          />
        </Modal>
      )}

      {editingUpcomingId && (
        <Modal onClose={() => setEditingUpcomingId(null)}>
          <EditUpcomingExpense
            expenseId={editingUpcomingId}
            user={user}
            onClose={(updatedExpense) => {
              setEditingUpcomingId(null);
              if (updatedExpense) {
                setUpcoming((prev) =>
                  prev.map((e) =>
                    e.id === updatedExpense.id
                      ? updatedExpense
                      : e
                  )
                );
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
