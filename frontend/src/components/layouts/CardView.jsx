//frontend/src/components/layouts/CardView.jsx
import React, { useState } from "react";

/**
 * CardView (Unified + Responsive)
 * -------------------------------
 * A single responsive card layout for ALL devices.
 *
 * Uses CSS Grid:
 * - 1 column on phones
 * - 2–3 columns on tablets
 * - 4+ columns on desktops
 *
 * Props:
 * - bills: array of bill objects
 * - helpers: money/date/interest/payoff helpers
 * - onEditBill: (id) => void
 * - onDeleteBill: (id) => void
 */

const CardView = ({ bills, helpers, onEditBill, onDeleteBill }) => {
  const {
    money,
    nextDueDate,
    daysUntilDue,
    monthlyEquivalent,
    interestPerPeriod,
    interestPerYear,
    payoffEstimate,
  } = helpers;

  const [expanded, setExpanded] = useState({});

  const toggle = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="card-grid">
      {bills.map((b) => {
        const isDebt = b.type === "debt";
        const payoff = isDebt
          ? payoffEstimate(b.remaining, b.apr, b.amount)
          : null;

        return (
          <div
            key={b.id}
            className="card"
            style={{
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => toggle(b.id)}
            >
              <h3 style={{ margin: 0 }}>{b.name}</h3>

              <button className="btn btn-sm btn-secondary">
                {expanded[b.id] ? "▲" : "▼"}
              </button>
            </div>

            {/* Summary */}
            <div style={{ marginTop: "10px" }}>
              <p>
                <strong>Amount:</strong> {money(b.amount)}
              </p>

              <p>
                <strong>Hold:</strong>
                <input
                  type="number"
                  step="0.01"
                  value={b.hold_amount ?? ""}
                  onChange={(e) =>
                    b.updateHold &&
                    b.updateHold(b.id, parseFloat(e.target.value || 0))
                  }
                  style={{ width: "100px", marginLeft: "10px" }}
                />
              </p>

              <p>
                <strong>Due Day:</strong> {b.due_day}
              </p>

              <p>
                <strong>Days Left:</strong> {daysUntilDue(b.due_day)}
              </p>
            </div>

            {/* Expanded details */}
            {expanded[b.id] && (
              <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
                <p>
                  <strong>Next Due:</strong> {nextDueDate(b.due_day)}
                </p>

                <p>
                  <strong>Monthly:</strong>{" "}
                  {money(monthlyEquivalent(b.amount, b.frequency))}
                </p>

                {isDebt && (
                  <>
                    <p>
                      <strong>APR:</strong> {b.apr}%
                    </p>
                    <p>
                      <strong>Remaining:</strong> {money(b.remaining)}
                    </p>
                    <p>
                      <strong>Months Left:</strong> {payoff.months}
                    </p>
                    <p>
                      <strong>Payoff Date:</strong> {payoff.date}
                    </p>
                    <p>
                      <strong>Total Interest:</strong>{" "}
                      {money(payoff.totalInterest)}
                    </p>
                    <p>
                      <strong>Interest / Mo:</strong>{" "}
                      {money(interestPerPeriod(b.apr, b.remaining))}
                    </p>
                    <p>
                      <strong>Interest / Yr:</strong>{" "}
                      {money(interestPerYear(b.apr, b.remaining))}
                    </p>
                  </>
                )}

                {b.link && (
                  <p>
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-info"
                    >
                      Pay
                    </a>
                  </p>
                )}

                {b.notes && (
                  <p>
                    <strong>Notes:</strong> {b.notes}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: "15px" }}>
              <button
                className="btn btn-primary"
                style={{ marginRight: "10px" }}
                onClick={() => onEditBill(b.id)}
              >
                Edit
              </button>

              <button
                className="btn btn-danger"
                onClick={() => onDeleteBill(b.id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardView;
