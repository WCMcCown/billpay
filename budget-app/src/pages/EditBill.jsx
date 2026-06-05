import { useEffect, useState } from "react";

export default function EditBill({ billId, onClose }) {
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

    const money = (n) => `$${parseFloat(n || 0).toFixed(2)}`;

    const payoffEstimate = (remaining, apr, monthlyPayment) => {
        remaining = parseFloat(remaining);
        apr = parseFloat(apr);
        monthlyPayment = parseFloat(monthlyPayment);

        if (monthlyPayment <= 0 || remaining <= 0) {
            return { months: 0, date: "", totalInterest: 0 };
        }

        const monthlyRate = apr / 100 / 12;

        if (monthlyRate === 0) {
            const months = Math.ceil(remaining / monthlyPayment);
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + months);
            return {
                months,
                date: payoffDate.toLocaleDateString("en-US"),
                totalInterest: 0
            };
        }

        const numerator = -Math.log(1 - (monthlyRate * remaining) / monthlyPayment);
        const denominator = Math.log(1 + monthlyRate);

        let months = Math.ceil(numerator / denominator);

        if (!isFinite(months) || months < 0) {
            return { months: Infinity, date: "Never", totalInterest: Infinity };
        }

        const totalPaid = months * monthlyPayment;
        const totalInterest = (totalPaid - remaining).toFixed(2);

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + months);

        return {
            months,
            date: payoffDate.toLocaleDateString("en-US"),
            totalInterest
        };
    };

    useEffect(() => {
        if (!userId) return;

        fetch(`http://127.0.0.1/bill/backend/api/bills.php?id=${billId}&user_id=${userId}`)
            .then(res => res.json())
            .then(data => {
                const found = data.bills?.find(b => b.id == billId);
                setBill(found || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [billId, userId]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [bill]);

    const handleSave = () => {
        setSaving(true);

        fetch("http://127.0.0.1/bill/backend/api/bills.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...bill, user_id: userId })
        })
            .then(res => res.json())
            .then(data => {
                onClose(data.bill || null);
            });
    };

    if (loading || !bill) return null;

    const isDebt = bill.type === "debt";
    const payoff = isDebt
        ? payoffEstimate(bill.remaining, bill.apr, bill.amount)
        : null;

    const frequencyOptions = [
        { label: "Weekly", value: 0.25 },
        { label: "Every 2 weeks", value: 0.5 },
        { label: "Monthly", value: 1 },
        { label: "Every 2 months", value: 2 },
        { label: "Every 3 months", value: 3 },
        { label: "Every 6 months", value: 6 },
        { label: "Yearly", value: 12 },
        { label: "Custom", value: "custom" }
    ];

    const isCustomFrequency =
        bill.frequency !== "" &&
        !frequencyOptions.some(opt => opt.value == bill.frequency);

    return (
        <>
            <h2 style={{ marginBottom: "12px", color: "var(--primary-dark)" }}>
                Edit Bill
            </h2>

            {/* ----------------------------- */}
            {/* General Info */}
            {/* ----------------------------- */}
            <div className="section">
                <h4>General Info</h4>

                <label className="form-label">Name</label>
                <input
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
                        <label className="form-label">Due Date</label>
                        <select
                            className="form-input"
                            value={bill.due_day}
                            onChange={(e) => setBill({ ...bill, due_day: e.target.value })}
                        >
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
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
                    type="text"
                    value={bill.link}
                    onChange={(e) => setBill({ ...bill, link: e.target.value })}
                />
            </div>

            {/* ----------------------------- */}
            {/* Billing Settings */}
            {/* ----------------------------- */}
            <div className="section">
                <h4>Billing Settings</h4>

                <div className="form-grid">
                    <div>
                        <label className="form-label">Frequency</label>
                        <select
                            className="form-input"
                            value={isCustomFrequency ? "custom" : bill.frequency}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "custom") {
                                    setBill({ ...bill, frequency: "" });
                                } else {
                                    setBill({ ...bill, frequency: val });
                                }
                            }}
                        >
                            {frequencyOptions.map(opt => (
                                <option key={opt.label} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {(bill.frequency === "" || isCustomFrequency) && (
                            <input
                                className="form-input"
                                type="number"
                                step="0.01"
                                placeholder="Custom (months)"
                                value={bill.frequency}
                                onChange={(e) =>
                                    setBill({ ...bill, frequency: e.target.value })
                                }
                            />
                        )}
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

            {/* ----------------------------- */}
            {/* Debt Details */}
            {/* ----------------------------- */}
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

                    <div
                        className="full"
                        style={{
                            marginTop: "10px",
                            padding: "12px",
                            background: "var(--accent-blue)",
                            borderRadius: "var(--radius)"
                        }}
                    >
                        <strong>Payoff Estimate</strong>
                        <div>Months Left: {payoff.months}</div>
                        <div>Payoff Date: {payoff.date}</div>
                        <div>Total Interest Left: {money(payoff.totalInterest)}</div>
                    </div>
                </div>
            )}

            {/* ----------------------------- */}
            {/* Notes */}
            {/* ----------------------------- */}
            <div className="section">
                <h4>Notes</h4>
                <textarea
                    className="form-input"
                    rows="3"
                    value={bill.notes || ""}
                    onChange={(e) => setBill({ ...bill, notes: e.target.value })}
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
