import React from "react";
import TableView from "./TableView";
import columnConfig from "../../utils/columnConfig";
import * as helpers from "../../utils/helpers";

const BillsTableFull = ({
  bills,
  columnOrder,
  onColumnOrderChange,
  onSort,
  sortField,
  sortDirection,
  onEditBill,
  onDeleteBill,
}) => {
  const renderCell = (bill, colKey) => {
    switch (colKey) {
      case "name":
        return bill.name;

      case "amount":
        return helpers.money(bill.amount);

      case "hold_amount":
        return (
          <input
            type="number"
            step="0.01"
            value={bill.hold_amount ?? ""}
            onChange={(e) =>
              bill.updateHold(bill.id, parseFloat(e.target.value || 0))
            }
            style={{ width: "90px" }}
          />
        );

      case "due_day":
        return bill.due_day;

      case "next_due":
        return helpers.nextDueDate(bill.due_day);

      case "notes":
        return bill.notes || "";

      case "actions":
        return (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-primary"
              style={{ marginRight: "5px" }}
              onClick={() => onEditBill(bill.id)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onDeleteBill(bill.id)}
            >
              Delete
            </button>
          </div>
        );

      default:
        return "";
    }
  };

  return (
    <TableView
      data={bills}
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      onSort={onSort}
      sortField={sortField}
      sortDirection={sortDirection}
      renderCell={renderCell}
    />
  );
};

export default BillsTableFull;
