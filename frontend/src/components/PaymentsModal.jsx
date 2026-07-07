// frontend/src/components/PaymentsModal.jsx

import React, { useState, useEffect } from "react";
import Modal from "./Modal";

import {
    fetchBillMonths,
    updateBillMonth,
    applyPaymentToMonth,
    getMonthStatusIcon,
    getMonthStatusClass,
} from "../utils/billMonths";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PaymentsModal = ({
    bill,
    user,
    selectedMonth,     // ⭐ NEW
    onClose,
    onAddPayment,
    fetchPayments
}) => {

    // -----------------------------
    // Existing Payment Modal State
    // -----------------------------
    const [payments, setPayments] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("card");
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [isPartial, setIsPartial] = useState(false);
    const [markCurrent, setMarkCurrent] = useState(true);

    // -----------------------------
    // NEW: Month Details State
    // -----------------------------
    const [months, setMonths] = useState([]);
    const [monthRow, setMonthRow] = useState(null);

    // -----------------------------
    // Load payments (existing)
    // -----------------------------
    useEffect(() => {
        const load = async () => {
            const data = await fetchPayments(bill.id);
            setPayments(data || []);
        };
        load();
    }, [bill.id, fetchPayments]);

    // -----------------------------
    // NEW: Load bill_months + selected month
    // -----------------------------
    useEffect(() => {
        if (!bill?.id || !user?.id) return;
        loadMonths();
    }, [bill, user, selectedMonth]);

    async function loadMonths() {
        const data = await fetchBillMonths(bill.id, user.id);
        setMonths(data);

        if (selectedMonth) {
            const row = data.find(
                (m) => m.year === selectedMonth.year && m.month === selectedMonth.month
            );
            setMonthRow(row || null);
        }
    }

    // -----------------------------
    // Existing Add Payment Handler
    // -----------------------------
    const handleSubmit = async () => {
        if (!amount) return;

        await onAddPayment({
            bill_id: bill.id,
            amount: parseFloat(amount),
            method,
            notes,
            paid_at: date,
            is_partial: isPartial,
            mark_current: markCurrent,
        });

        const data = await fetchPayments(bill.id);
        setPayments(data || []);

        setAmount("");
        setNotes("");
        setIsPartial(false);
    };

    // -----------------------------
    // NEW: Save Month Details
    // -----------------------------
    async function saveMonthDetails() {
        if (!monthRow) return;

        await updateBillMonth({
            billId: bill.id,
            userId: user.id,
            year: monthRow.year,
            month: monthRow.month,
            status: monthRow.status,
            marksCurrent: monthRow.marks_current,
        });

        if (monthRow.paid_amount > 0 || monthRow.paid_at) {
            await applyPaymentToMonth({
                billId: bill.id,
                userId: user.id,
                year: monthRow.year,
                month: monthRow.month,
                amount: monthRow.paid_amount || 0,
                paymentId: monthRow.payment_id || null,
                marksCurrent: monthRow.marks_current,
            });
        }

        await loadMonths();

        if (typeof window.refreshMatrix === "function") {
            window.refreshMatrix();
        }
    }

    // -----------------------------
    // Existing Calendar Row (simple)
    // -----------------------------
    const buildCalendarRow = () => {
        const months = Array(12).fill("○");

        payments.forEach((p) => {
            const m = new Date(p.paid_at).getMonth();
            months[m] = "✔";
        });

        return months;
    };

    const calendar = buildCalendarRow();

    // -----------------------------
    // Render Modal
    // -----------------------------
    return (
        <Modal onClose={onClose}>
            <h2 style={{ marginBottom: "10px" }}>
                Payments — {bill.name}
            </h2>

            {bill.link && (
                <p>
                    <a
                        href={bill.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-info"
                    >
                        Pay Online
                    </a>
                </p>
            )}

            {/* Add Payment Form */}
            <div className="section">
                <h4>Add Payment</h4>

                <label className="form-label">Amount</label>
                <input
                    type="number"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <label className="form-label">Method</label>
                <select
                    className="form-input"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <option value="card">Card</option>
                    <option value="bank">Bank Draft</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                </select>

                <label className="form-label">Date</label>
                <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <label className="form-label">Notes</label>
                <textarea
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                <div style={{ marginTop: "10px" }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isPartial}
                            onChange={() => setIsPartial(!isPartial)}
                        />
                        &nbsp;Partial Payment
                    </label>
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={markCurrent}
                            onChange={() => setMarkCurrent(!markCurrent)}
                        />
                        &nbsp;Mark bill current
                    </label>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ marginTop: "12px" }}
                    onClick={handleSubmit}
                >
                    Add Payment
                </button>
            </div>

            {/* Calendar Row */}
            <div className="section">
                <h4>Monthly Status</h4>
                <div style={{ display: "flex", gap: "10px", fontSize: "1.2rem" }}>
                    {calendar.map((c, i) => (
                        <span key={i}>{c}</span>
                    ))}
                </div>
            </div>

            {/* NEW: Month Details Panel */}
            {monthRow && (
                <div className="section" style={{ marginTop: "20px" }}>
                    <h4>
                        Month Details — {MONTH_NAMES[monthRow.month - 1]} {monthRow.year}
                    </h4>

                    <label className="form-label">Status</label>
                    <select
                        className="form-input"
                        value={monthRow.status}
                        onChange={(e) =>
                            setMonthRow({ ...monthRow, status: e.target.value })
                        }
                    >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="late">Late</option>
                        <option value="partial">Partial</option>
                        <option value="deferred">Deferred</option>
                        <option value="autopay">Autopay</option>
                    </select>

                    <label className="form-label">Paid Amount</label>
                    <input
                        type="number"
                        className="form-input"
                        value={monthRow.paid_amount || ""}
                        onChange={(e) =>
                            setMonthRow({ ...monthRow, paid_amount: e.target.value })
                        }
                    />

                    <label className="form-label">Paid At</label>
                    <input
                        type="datetime-local"
                        className="form-input"
                        value={monthRow.paid_at ? monthRow.paid_at.replace(" ", "T") : ""}
                        onChange={(e) =>
                            setMonthRow({ ...monthRow, paid_at: e.target.value })
                        }
                    />

                    <div style={{ marginTop: "10px" }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={monthRow.marks_current === 1}
                                onChange={(e) =>
                                    setMonthRow({
                                        ...monthRow,
                                        marks_current: e.target.checked ? 1 : 0,
                                    })
                                }
                            />
                            &nbsp;Mark Current
                        </label>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: "12px" }}
                        onClick={saveMonthDetails}
                    >
                        Save Month
                    </button>
                </div>
            )}

            {/* History */}
            <div className="section">
                <h4
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowHistory(!showHistory)}
                >
                    Payment History {showHistory ? "▲" : "▼"}
                </h4>

                {showHistory && (
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {payments.length === 0 && <p>No payments yet.</p>}

                        {payments.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    padding: "8px 0",
                                    borderBottom: "1px solid #ddd",
                                }}
                            >
                                <strong>${Number(p.amount || 0).toFixed(2)}</strong>
                                &nbsp;— {new Date(p.paid_at).toLocaleDateString()}
                                <br />
                                <span style={{ color: "#666" }}>
                                    {p.method} {p.notes ? `— ${p.notes}` : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                className="btn btn-secondary"
                style={{ marginTop: "10px" }}
                onClick={onClose}
            >
                Close
            </button>
        </Modal>
    );
};

export default PaymentsModal;
