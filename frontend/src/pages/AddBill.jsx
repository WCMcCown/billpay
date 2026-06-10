import { useState, useEffect, useRef } from "react";

export default function AddBill({ user, onClose }) {
    const [bill, setBill] = useState({
        name: "",
        amount: "",
        due_day: 1,
        type: "recurring",
        category: "Housing",
        link: "",
        frequency: 1,
        autopay: 0,
        remaining: "",
        apr: "",
        notes: ""
    });

    const API = "http://127.0.0.1/bill/backend/api";

    const handleSave = () => {
        fetch(`${API}/bills.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...bill, user_id: user.id })
        })
            .then(res => res.json())
            .then(data => {
                onClose(data.bill || null);
            });
    };

    const isDebt = bill.type === "debt";

    const firstInputRef = useRef(null);

    useEffect(() => {
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSave();
            }}
        >
            <h2 style={{ marginBottom: "12px" }}>Add Bill</h2>

            <div className="section">
                <h4>General Info</h4>

                <label className="form-label">Name</label>
                <input
                    ref={firstInputRef}
                    className="form-input"
                    value={bill.name}
                    onChange={(e) => setBill({ ...bill, name: e.target.value })}
                />

                <div className="form-grid">
                    <div>
                        <label className="form-label">Amount</label>
                        <input
                            className="form-input"
                            type="number"
                            step="0.01"
                            value={bill.amount}
                            onChange={(e) => setBill({ ...bill, amount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Due Day</label>
                        <select
                            className="form-input"
                            value={bill.due_day}
                            onChange={(e) => setBill({ ...bill, due_day: e.target.value })}
                        >
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-grid">
                    <div>
                        <label className="form-label">Type</label>
                        <select
                            className="form-input"
                            value={bill.type}
                            onChange={(e) => setBill({ ...bill, type: e.target.value })}
                        >
                            <option value="recurring">Recurring</option>
                            <option value="debt">Debt</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={bill.category}
                            onChange={(e) => setBill({ ...bill, category: e.target.value })}
                        >
                            <option value="Housing">Housing</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Subscriptions">Subscriptions</option>
                            <option value="Debt">Debt</option>
                            <option value="Savings">Savings</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                        </select>
                    </div>
                </div>

                <label className="form-label">Link</label>
                <input
                    className="form-input"
                    value={bill.link}
                    onChange={(e) => setBill({ ...bill, link: e.target.value })}
                />
            </div>

            <div className="section">
                <h4>Billing Settings</h4>

                <div className="form-grid">
                    <div>
                        <label className="form-label">Frequency (months)</label>
                        <input
                            className="form-input"
                            type="number"
                            step="0.01"
                            value={bill.frequency}
                            onChange={(e) => setBill({ ...bill, frequency: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Autopay</label>
                        <div style={{ marginTop: "6px" }}>
                            <div
                                className={`toggle ${bill.autopay ? "on" : ""}`}
                                onClick={() =>
                                    setBill({ ...bill, autopay: bill.autopay ? 0 : 1 })
                                }
                            >
                                <div className="toggle-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isDebt && (
                <div className="section">
                    <h4>Debt Details</h4>

                    <div className="form-grid">
                        <div>
                            <label className="form-label">Remaining Balance</label>
                            <input
                                className="form-input"
                                type="number"
                                step="0.01"
                                value={bill.remaining}
                                onChange={(e) =>
                                    setBill({ ...bill, remaining: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="form-label">APR (%)</label>
                            <input
                                className="form-input"
                                type="number"
                                step="0.01"
                                value={bill.apr}
                                onChange={(e) =>
                                    setBill({ ...bill, apr: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="section">
                <h4>Notes</h4>
                <textarea
                    className="form-input"
                    rows="3"
                    value={bill.notes}
                    onChange={(e) => setBill({ ...bill, notes: e.target.value })}
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
                <button type="submit" className="btn-primary">Save</button>
            </div>
        </form>
    );
}
