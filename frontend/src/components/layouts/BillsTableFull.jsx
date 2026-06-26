// frontend/src/components/layouts/BillsTableFull.jsx

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
  const {
    money,
    nextDueDate,
    daysUntilDue,
    monthlyEquivalent,
    interestPerPeriod,
    interestPerYear,
    payoffEstimate,
  } = helpers;

  const renderCell = (bill, colKey) => {
    const isDebt = bill.type === "debt";
    const payoff = isDebt
      ? payoffEstimate(bill.remaining, bill.apr, bill.amount)
      : null;

    switch (colKey) {
      case "name":
        return bill.name;

      case "amount":
        return money(bill.amount);

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
            style={{ width: "90px" }}
          />
        );

      case "due_day":
        return bill.due_day;

      case "next_due":
        return nextDueDate(bill.due_day);

      case "frequency":
        return bill.frequency; // months or whatever you store

      case "category":
        return bill.category || "";

      case "type":
        return bill.type || "";

      case "remaining":
        return isDebt ? money(bill.remaining) : "";

      case "apr":
        return bill.apr ? `${bill.apr}%` : "";

      case "autopay":
        return bill.autopay ? "Yes" : "No";

      case "link":
        return bill.link ? (
          <a href={bill.link} target="_blank" rel="noreferrer">
            Open
          </a>
        ) : (
          ""
        );

      case "interest_month":
        return isDebt ? money(interestPerPeriod(bill.apr, bill.remaining)) : "";

      case "interest_year":
        return isDebt ? money(interestPerYear(bill.apr, bill.remaining)) : "";

      case "payoff_months":
        return isDebt && payoff ? payoff.months : "";

      case "payoff_date":
        return isDebt && payoff ? payoff.date : "";

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
      visibleColumns={[
        "name",
        "amount",
        "hold_amount",
        "due_day",
        "next_due",
        "frequency",
        "category",
        "type",
        "remaining",
        "apr",
        "autopay",
        "link",
        "interest_month",
        "interest_year",
        "payoff_months",
        "payoff_date",
        "notes",
        "actions",
      ]}
    />
  );
};

export default BillsTableFull;
