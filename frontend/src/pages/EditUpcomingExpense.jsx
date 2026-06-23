// EditUpcomingExpense.jsx
// ------------------------
// Cleaned up, modernized, API-wrapper powered version
// Uses centralized apiFetch()
// Removes hard-coded URLs
// Adds clear structure + comments

import { useEffect, useState } from "react";
import { apiFetch } from "../api/http";   // NEW — centralized API wrapper

export default function EditUpcomingExpense({ expenseId, user, onClose }) {
  // -----------------------------
  // State
  // -----------------------------
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // Load expense data
  // -----------------------------
  useEffect(() => {
    async function loadExpense() {
      try {
        const data = await apiFetch(
          `upcoming_expenses.php?id=${expenseId}&user_id=${user.id}`
        );

        const found = data.expenses?.find((e) => e.id == expenseId);
        setExpense(found || null);
      } catch (err) {
        console.error("Failed to load upcoming expense:", err);
      }

      setLoading(false);
    }

    loadExpense();
  }, [expenseId, user.id]);

  // -----------------------------
  // Enter-to-save shortcut
  // -----------------------------
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expense]);

  // -----------------------------
  // Save changes
  // -----------------------------
  const handleSave = async () => {
    setSaving(true);

    try {
      const data = await apiFetch("upcoming_expenses.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...expense, user_id: user.id }),
      });

      onClose(data.expense || null);
    } catch (err) {
      console.error("Failed to save upcoming expense:", err);
    }
  };

  // -----------------------------
  // Loading state
  // -----------------------------
  if (loading || !expense) return null;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      <h2 style={{ marginBottom: "12px" }}>Edit Upcoming Expense</h2>

      {/* ----------------------------- */}
      {/* General Info */}
      {/* ----------------------------- */}
      <div className="section">
        <h4>General Info</h4>

        <label className="form-label">Name</label>
        <input
          className="form-input"
          value={expense.name}
          onChange={(e) =>
            setExpense({ ...expense, name: e.target.value })
          }
        />

        <div className="form-grid">
          <div>
            <label className="form-label">Amount</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={expense.amount}
              onChange={(e) =>
                setExpense({ ...expense, amount: e.target.value })
              }
            />
          </div>

          <div>
            <label className="form-label">Due Date</label>
            <input
              className="form-input"
              type="date"
              value={expense.due_date}
              onChange={(e) =>
                setExpense({ ...expense, due_date: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* Notes */}
      {/* ----------------------------- */}
      <div className="section">
        <h4>Notes</h4>
        <textarea
          className="form-input"
          rows="3"
          value={expense.notes}
          onChange={(e) =>
            setExpense({ ...expense, notes: e.target.value })
          }
        />
      </div>

      {/* ----------------------------- */}
      {/* Buttons */}
      {/* ----------------------------- */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onClose(null)}
        >
          Cancel
        </button>

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}
