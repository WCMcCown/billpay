import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditUpcomingExpense = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [holdAmount, setHoldAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.id || !id) return;

        fetch(`http://127.0.0.1/api/upcoming_expenses.php?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const expense = data.expenses.find(e => e.id === id || e.id === parseInt(id));
                    if (expense) {
                        setName(expense.name);
                        setAmount(expense.amount);
                        setHoldAmount(expense.hold_amount);
                        setDueDate(expense.due_date || "");
                        setNotes(expense.notes || "");
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user, id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user?.id) return;

        if (!name || !amount) {
            setMessage("Name and amount are required.");
            return;
        }

        setSaving(true);
        setMessage("");

        const payload = {
            id: parseInt(id),
            user_id: user.id,
            name,
            amount: parseFloat(amount),
            hold_amount: parseFloat(holdAmount),
            due_date: dueDate || null,
            notes: notes || null
        };

        fetch("http://127.0.0.1/api/upcoming_expenses.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    navigate("/dashboard");
                } else {
                    setMessage("Error updating upcoming expense.");
                }
                setSaving(false);
            })
            .catch(() => {
                setMessage("Error updating upcoming expense.");
                setSaving(false);
            });
    };

    if (loading) return <div>Loading expense…</div>;

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Edit Upcoming Expense</h2>

            {message && (
                <div style={{ marginBottom: "10px", color: "red" }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Name */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Amount */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>

                {/* Hold Amount */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Hold Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={holdAmount}
                        onChange={(e) => setHoldAmount(e.target.value)}
                        required
                    />
                </div>

                {/* Due Date (optional) */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Due Date (optional)</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dueDate || ""}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Notes (optional)</label>
                    <textarea
                        className="form-control"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                >
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default EditUpcomingExpense;
