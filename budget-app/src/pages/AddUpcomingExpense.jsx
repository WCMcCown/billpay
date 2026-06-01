import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddUpcomingExpense = ({ user }) => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

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
            user_id: user.id,
            name,
            amount: parseFloat(amount),
            hold_amount: parseFloat(amount), // default behavior
            due_date: dueDate || null,
            notes: notes || null
        };

        fetch("http://127.0.0.1/bill/backend/api/upcoming_expenses.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(async res => {
                const text = await res.text();
                console.log("RAW RESPONSE:", text);

                try {
                    return JSON.parse(text);
                } catch (err) {
                    console.error("JSON PARSE ERROR:", err);
                    throw new Error("Invalid JSON from server");
                }
            })
            .then(data => {
                console.log("PARSED RESPONSE:", data);

                if (data.success) {
                    navigate("/dashboard");
                } else {
                    setMessage("Error saving upcoming expense.");
                }
                setSaving(false);
            })
            .catch(err => {
                console.error("REQUEST FAILED:", err);
                setMessage("Error saving upcoming expense.");
                setSaving(false);
            });
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Add Upcoming Expense</h2>

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
                    {saving ? "Saving…" : "Add Expense"}
                </button>
            </form>
        </div>
    );
};

export default AddUpcomingExpense;
