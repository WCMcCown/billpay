import { useEffect, useState } from "react";

export default function EditUpcomingExpense({ expenseId, user, onClose }) {
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const API = "http://127.0.0.1/bill/backend/api";

    useEffect(() => {
        fetch(`${API}/upcoming_expenses.php?id=${expenseId}&user_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                const found = data.expenses?.find(e => e.id == expenseId);
                setExpense(found || null);
                setLoading(false);
            });
    }, [expenseId, user.id]);

    // ENTER TO SAVE
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
    // expense in deps ensures the latest state is saved

    const handleSave = () => {
        setSaving(true);

        fetch(`${API}/upcoming_expenses.php`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...expense, user_id: user.id })
        })
            .then(res => res.json())
            .then(data => {
                onClose(data.expense || null);
            });
    };

    if (loading || !expense) return null;

    return (
        <>
            <h2 style={{ marginBottom: "12px" }}>Edit Upcoming Expense</h2>

            <div className="section">
                <h4>General Info</h4>

                <label className="form-label">Name</label>
                <input
                    className="form-input"
                    value={expense.name}
                    onChange={(e) => setExpense({ ...expense, name: e.target.value })}
                />

                <div className="form-grid">
                    <div>
                        <label className="form-label">Amount</label>
                        <input
                            className="form-input"
                            type="number"
                            step="0.01"
                            value={expense.amount}
                            onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Due Date</label>
                        <input
                            className="form-input"
                            type="date"
                            value={expense.due_date}
                            onChange={(e) => setExpense({ ...expense, due_date: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="section">
                <h4>Notes</h4>
                <textarea
                    className="form-input"
                    rows="3"
                    value={expense.notes}
                    onChange={(e) => setExpense({ ...expense, notes: e.target.value })}
                />
            </div>

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
