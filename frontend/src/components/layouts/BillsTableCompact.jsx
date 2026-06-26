//frontend/src/components/layouts/BillsTableCompact.jsx

import React from "react";
import TableView from "./TableView";
import * as helpers from "../../utils/helpers";

const BillsTableCompact = (props) => {
  const { money } = helpers;

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
            style={{ width: "70px" }}
          />
        );
      case "due_day": return bill.due_day;
      default: return "";
    }
  };

  return (
    <TableView
      data={props.bills}          // ⭐ REQUIRED
      columnOrder={props.columnOrder}
      onColumnOrderChange={props.onColumnOrderChange}
      onSort={props.onSort}
      sortField={props.sortField}
      sortDirection={props.sortDirection}
      renderCell={renderCell}
      visibleColumns={["name", "amount", "hold_amount", "due_day"]}
    />
  );
};

export default BillsTableCompact;
