import React from "react";

/**
 * BillsTableStandard
 * ------------------
 * Balanced table layout for bills.
 * More compact than Full, more detailed than Compact.
 *
 * Features:
 * - Sticky headers (requires .sticky-table CSS)
 * - Sorting (delegated to parent)
 * - Clean action buttons
 * - No invalid table markup
 *
 * Props:
 * - bills: array of bill objects
 * - helpers: money/date/interest/payoff helpers
 * - onEditBill: (id) => void
 * - onDeleteBill: (id) => void
 * - onSort: (field) => void
 * - sortField: string
 * - sortDirection: "asc" | "desc"
 */

const BillsTableStandard = ({
  bills,
  helpers,
  onEditBill,
  onDeleteBill,
  onSort,
  sortField,
  sortDirection,
}) => {
  const {
    money,
    nextDueDate,
    daysUntilDue,
    monthlyEquivalent,
    payoffEstimate,
  } = helpers;

  // Render sort arrow
  const arrow = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <table className="table table-striped sticky-table">
      <thead>
        <tr>
          <th onClick={() => onSort("name")} style={{ cursor: "pointer" }}>
            Name{arrow("name")}
          </th>

          <th onClick={() => onSort("amount")} style={{ cursor: "pointer" }}>
            Amount{arrow("amount")}
          </th>

          <th>Hold</th>

          <th onClick={() => onSort("due_day")} style={{ cursor: "pointer" }}>
            Due Day{arrow("due_day")}
          </th>

          <th>Next Due</th>
          <th>Days Left</th>
          <th>Monthly</th>
          <th>Autopay</th>
          <th>Category</th>
          <th>APR</th>

          <th onClick={() => onSort("remaining")} style={{ cursor: "pointer" }}>
            Remaining{arrow("remaining")}
          </th>

          <th>Months Left</th>
          <th>Payoff Date</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {bills.map((b) => {
          const isDebt = b.type === "debt";
          const payoff = isDebt
            ? payoffEstimate(b.remaining, b.apr, b.amount)
            : null;

          return (
            <tr key={b.id}>
              <td>{b.name}</td>

              <td>{money(b.amount)}</td>

              <td>
                <input
                  type="number"
                  step="0.01"
                  value={b.hold_amount ?? ""}
                  onChange={(e) =>
                    b.updateHold &&
                    b.updateHold(b.id, parseFloat(e.target.value || 0))
                  }
                  style={{ width: "90px" }}
                />
              </td>

              <td>{b.due_day}</td>

              <td>{nextDueDate(b.due_day)}</td>

              <td>{daysUntilDue(b.due_day)}</td>

              <td>{money(monthlyEquivalent(b.amount, b.frequency))}</td>

              <td>{b.autopay ? "Yes" : "No"}</td>

              <td>{b.category || ""}</td>

              <td>{isDebt ? `${b.apr}%` : ""}</td>

              <td>{isDebt ? money(b.remaining) : ""}</td>

              <td>
                {isDebt
                  ? payoff.months === Infinity
                    ? "∞"
                    : payoff.months
                  : ""}
              </td>

              <td>{isDebt ? payoff.date : ""}</td>

              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginRight: "10px" }}
                    onClick={() => onEditBill(b.id)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteBill(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          );
        })}

        {bills.length === 0 && (
          <tr>
            <td colSpan="14" style={{ textAlign: "center", padding: "20px" }}>
              No bills found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default BillsTableStandard;
