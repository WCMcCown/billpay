import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddBill() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    user_id: user.id,
    name: "",
    amount: "",
    due_day: "",
    type: "recurring",
    frequency: 1,
    hold_amount: 0,
    autopay: false,
    link: "",
    apr: 0,
    remaining: "",
    category: "",
    notes: ""
  });

  function updateField(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Default remaining = amount for debts
    const payload = {
      ...form,
      remaining: form.remaining || form.amount
    };

    const response = await fetch(
      "http://127.0.0.1/bill/backend/api/bills.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (data.success) {
      navigate("/dashboard");
    } else {
      alert("Failed to add bill");
      console.error(data);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Add Bill</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={updateField}
          required
        />

        <label>Amount</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={updateField}
          required
        />

        <label>Due Day (1–31)</label>
        <input
          name="due_day"
          type="number"
          min="1"
          max="31"
          value={form.due_day}
          onChange={updateField}
          required
        />

        <label>Type</label>
        <select name="type" value={form.type} onChange={updateField}>
          <option value="recurring">Recurring</option>
          <option value="debt">Debt</option>
        </select>

        <label>Frequency (months)</label>
        <input
          name="frequency"
          type="number"
          step="0.01"
          value={form.frequency}
          onChange={updateField}
        />

        <label>Hold Amount</label>
        <input
          name="hold_amount"
          type="number"
          step="0.01"
          value={form.hold_amount}
          onChange={updateField}
        />

        <label>
          <input
            type="checkbox"
            name="autopay"
            checked={form.autopay}
            onChange={updateField}
          />
          Autopay
        </label>

        <label>Payment Link (optional)</label>
        <input
          name="link"
          value={form.link}
          onChange={updateField}
        />

        {form.type === "debt" && (
          <>
            <label>APR (for debts)</label>
            <input
              name="apr"
              type="number"
              step="0.01"
              value={form.apr}
              onChange={updateField}
            />

            <label>Remaining Balance (for debts)</label>
            <input
              name="remaining"
              type="number"
              step="0.01"
              value={form.remaining}
              onChange={updateField}
            />
          </>
        )}

        <label>Category</label>
        <select name="category" value={form.category} onChange={updateField}>
          <option value="">Select a category</option>
          <option value="Housing">Housing</option>
          <option value="Utilities">Utilities</option>
          <option value="Insurance">Insurance</option>
          <option value="Transportation">Transportation</option>
          <option value="Medical">Medical</option>
          <option value="Loans">Loans</option>
          <option value="Credit Cards">Credit Cards</option>
          <option value="Investments">Investments</option>
          <option value="Savings">Savings</option>
          <option value="Subscriptions">Subscriptions</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>

        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={updateField}
          rows="4"
        />

        <button type="submit" style={{ marginTop: "20px" }}>
          Add Bill
        </button>
      </form>
    </div>
  );
}
