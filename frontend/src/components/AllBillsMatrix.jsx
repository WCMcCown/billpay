import React, { useEffect, useState } from "react";
import {
  fetchBillMonths,
  updateBillMonth,
  getMonthStatusIcon,
  getMonthStatusClass,
} from "../../utils/billMonths";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AllBillsMatrix({ bills, user }) {
  const [matrix, setMatrix] = useState({}); // billId → months[]

  useEffect(() => {
    if (!user?.id || !bills.length) return;
    loadAll();
  }, [bills, user]);

  async function loadAll() {
    const out = {};
    for (const bill of bills) {
      out[bill.id] = await fetchBillMonths(bill.id, user.id);
    }
    setMatrix(out);
  }

  async function handleClick(bill, m) {
    const nextStatus =
      m.status === "paid" ? "unpaid" :
      m.status === "unpaid" ? "late" :
      m.status === "late" ? "partial" :
      "paid";

    await updateBillMonth({
      billId: bill.id,
      userId: user.id,
      year: m.year,
      month: m.month,
      status: nextStatus,
      marksCurrent: nextStatus === "paid" ? 1 : 0,
    });

    loadAll();
  }

  return (
    <div className="all-bills-matrix">
      <h3>Monthly Bill Matrix</h3>

      <table className="table table-bordered small">
        <thead>
          <tr>
            <th>Bill</th>
            {MONTH_NAMES.map((m) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {bills.map((bill) => {
            const months = matrix[bill.id] || [];
            const grouped = groupByYear(months);

            // Show only current year (or expand if you want)
            const currentYear = new Date().getFullYear();
            const row = grouped.find((g) => g.year === currentYear);

            return (
              <tr key={bill.id}>
                <td><strong>{bill.name}</strong></td>

                {MONTH_NAMES.map((_, idx) => {
                  const m = row?.rows.find((r) => r.month === idx + 1);
                  if (!m) return <td key={idx}></td>;

                  return (
                    <td
                      key={idx}
                      className={`matrix-cell ${getMonthStatusClass(m.status)}`}
                      onClick={() => openPaymentsModal(bill, { year: m.year, month: m.month })}
                      style={{ cursor: "pointer", textAlign: "center" }}
                    >
                      {getMonthStatusIcon(m.status)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function groupByYear(months) {
  const map = {};
  months.forEach((m) => {
    if (!map[m.year]) map[m.year] = [];
    map[m.year].push(m);
  });
  return Object.keys(map).map((year) => ({
    year: parseInt(year),
    rows: map[year],
  }));
}
