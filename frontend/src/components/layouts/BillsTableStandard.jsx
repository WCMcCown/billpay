// frontend/src/components/layouts/BillsTableStandard.jsx

import React from "react";
import TableView from "./TableView";
import * as helpers from "../../utils/helpers";

const BillsTableStandard = (props) => {
  const { money, nextDueDate } = helpers;

  const renderCell = (bill, colKey) => {
    switch (colKey) {
      case "name": return bill.name;
      case "amount": return money(bill.amount);
      case "hold_amount":
        return (
          <input
            type="number"
            step="0.01"
            value={bill.hold_amount ?? ""}
            onChange={(e) =>
              bill.updateHold &&
              bill.updateHold(bill.id, parseFloat(e.target.value || 0))
            }
            style={{ width: "80px" }}
          />
        );
      case "due_day": return bill.due_day;
      case "next_due": return nextDueDate(bill.due_day);
      case "actions":
        return (
          <div className="action-buttons">
            <button className="btn btn-sm btn-primary" onClick={() => props.onEditBill(bill.id)}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={() => props.onDeleteBill(bill.id)}>Delete</button>
          </div>
        );
      default: return "";
    }
  };

  return (
    <TableView
      data={props.bills}
      columnOrder={props.columnOrder}
      onColumnOrderChange={props.onColumnOrderChange}
      onSort={props.onSort}
      sortField={props.sortField}
      sortDirection={props.sortDirection}
      renderCell={renderCell}
      visibleColumns={[
        "name",
        "amount",
        "hold_amount",
        "due_day",
        "next_due",
        "actions",
      ]}
    />
  );
};

export default BillsTableStandard;
