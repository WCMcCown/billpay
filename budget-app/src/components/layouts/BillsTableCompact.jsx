import React from "react";

/**
 * BillsTableCompact
 * -----------------
 * Compact, dense table layout for bills.
 * Ideal for tablets, smaller laptops, or users who want a tighter view.
 *
 * Features:
 * - Sticky headers (requires .sticky-table CSS)
 * - Sorting (delegated to parent)
 * - Clean action buttons
 * - No invalid table markup
 *
 * Props:
 * - bills: array of bill objects
 * - helpers: money/date helpers
 * - onEditBill: (id) => void
 * - onDeleteBill: (id) => void
 * - onSort: (field) => void
 * - sortField: string
 * - sortDirection: "asc" | "desc"
 */

const BillsTableCompact = ({
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
  } = helpers;

  // Render sort arrow
  const arrow = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <table className="table table-striped sticky-table compact-table">
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
            Due{arrow("due_day")}
          </th>

          <th>Next</th>
          <th>Left</th>
          <th>Monthly</th>
          <th>Auto</th>
          <th>Cat</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {bills.map((b) => (
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
                style={{ width: "70px" }}
              />
            </td>

            <td>{b.due_day}</td>

            <td>{nextDueDate(b.due_day)}</td>

            <td>{daysUntilDue(b.due_day)}</td>

            <td>{money(monthlyEquivalent(b.amount, b.frequency))}</td>

            <td>{b.autopay ? "Y" : "N"}</td>

            <td>{b.category || ""}</td>

            <td>
              <div className="action-buttons">
                <button
                  className="btn btn-sm btn-primary"
                  style={{ marginRight: "6px" }}
                  onClick={() => onEditBill(b.id)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDeleteBill(b.id)}
                >
                  Del
                </button>
              </div>
            </td>
          </tr>
        ))}

        {bills.length === 0 && (
          <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              No bills found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default BillsTableCompact;
