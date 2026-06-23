import React from "react";

/**
 * ItemsTable
 * ----------
 * A clean, modernized table component for displaying bill items.
 * This is the "legacy" table used before the new multi-layout system.
 *
 * Features:
 * - Sticky headers (requires CSS class .sticky-table)
 * - Column sorting (delegated to parent)
 * - Clean action buttons
 * - No invalid table markup
 *
 * Props:
 * - items: array of bill objects
 * - onEdit: (id) => void
 * - onDelete: (id) => void
 * - onSort: (field) => void
 * - sortField: string
 * - sortDirection: "asc" | "desc"
 */

const ItemsTable = ({
  items,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
}) => {
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

          <th onClick={() => onSort("due_date")} style={{ cursor: "pointer" }}>
            Due Date{arrow("due_date")}
          </th>

          <th onClick={() => onSort("amount")} style={{ cursor: "pointer" }}>
            Amount{arrow("amount")}
          </th>

          <th onClick={() => onSort("hold_amount")} style={{ cursor: "pointer" }}>
            Hold{arrow("hold_amount")}
          </th>

          <th>APR</th>
          <th>Remaining</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>

            <td>
              {item.due_date
                ? new Date(item.due_date).toLocaleDateString("en-US")
                : ""}
            </td>

            <td>${parseFloat(item.amount).toFixed(2)}</td>

            <td>${parseFloat(item.hold_amount || 0).toFixed(2)}</td>

            <td>{item.apr ? `${item.apr}%` : ""}</td>

            <td>
              {item.remaining
                ? `$${parseFloat(item.remaining).toFixed(2)}`
                : ""}
            </td>

            <td>
              <div className="action-buttons">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onEdit(item.id)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}

        {items.length === 0 && (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
              No items found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ItemsTable;
