import { useState, useEffect } from "react";

export default function AddUpcomingExpense({ user, onClose }) {
    const [expense, setExpense] = useState({
        name: "",
        amount: "",
        due_date: "",
        notes: ""
    });

    const API = "http://127.0.0.1/bill/backend/api";

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


    const handleSave = () => {
        fetch(`${API}/upcoming_expenses.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...expense, user_id: user.id })
        })
            .then(res => res.json())
            .then(data => {
                onClose(data.expense || null);   // ⭐ send new expense back to Dashboard
            });
    };

    return (
        <>
            <h2 style={{ marginBottom: "12px" }}>Add Upcoming Expense</h2>

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
                <button type="button" className="btn-secondary" onClick={() => onClose(null)}>
                    Cancel
                </button>
                <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
        </>
    );
}
