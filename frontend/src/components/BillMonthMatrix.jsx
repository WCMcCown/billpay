import React, { useEffect, useState } from "react";
import {
  fetchBillMonths,
  updateBillMonth,
  getMonthStatusIcon,
  getMonthStatusClass,
} from "../../utils/billMonths";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function BillMonthMatrix({ bill, user }) {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    if (!bill?.id || !user?.id) return;
    loadMonths();
  }, [bill, user]);

  async function loadMonths() {
    const data = await fetchBillMonths(bill.id, user.id);
    setMonths(data);
  }

  async function handleClick(m) {
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

    loadMonths();
  }

  return (
    <div className="bill-month-matrix">
      <h4>{bill.name} — Payment Months</h4>

      <table className="table table-bordered small">
        <thead>
          <tr>
            <th>Year</th>
            {MONTH_NAMES.map((m) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {groupByYear(months).map(({ year, rows }) => (
            <tr key={year}>
              <td><strong>{year}</strong></td>

              {MONTH_NAMES.map((_, idx) => {
                const m = rows.find((r) => r.month === idx + 1);
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
          ))}
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
