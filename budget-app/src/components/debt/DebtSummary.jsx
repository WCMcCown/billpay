import React, { useMemo } from "react";
import * as helpers from "../../utils/helpers";

const DebtSummary = ({ bills }) => {
  const totalDebtRemaining = useMemo(
    () =>
      bills
        .filter((b) => b.type === "debt")
        .reduce((sum, b) => sum + parseFloat(b.remaining || 0), 0),
    [bills]
  );

  const totalMonthlyPayments = useMemo(
    () =>
      bills
        .filter((b) => b.type === "debt")
        .reduce(
          (sum, b) =>
            sum +
            parseFloat(
              helpers.monthlyEquivalent(b.amount || 0, b.frequency || 1)
            ),
          0
        ),
    [bills]
  );

  const totalMonthlyInterest = useMemo(
    () =>
      bills
        .filter((b) => b.type === "debt")
        .reduce(
          (sum, b) =>
            sum +
            parseFloat(
              helpers.interestPerPeriod(b.apr || 0, b.remaining || 0)
            ),
          0
        ),
    [bills]
  );

  const totalAnnualInterest = useMemo(
    () =>
      bills
        .filter((b) => b.type === "debt")
        .reduce(
          (sum, b) =>
            sum +
            parseFloat(
              helpers.interestPerYear(b.apr || 0, b.remaining || 0)
            ),
          0
        ),
    [bills]
  );

  return (
    <div style={{ marginBottom: "40px", marginTop: "20px" }}>
      <h3>Debt Summary</h3>

      <p>
        <strong>Total Debt Remaining:</strong>{" "}
        {helpers.money(totalDebtRemaining)}
      </p>

      <p>
        <strong>Total Monthly Payments:</strong>{" "}
        {helpers.money(totalMonthlyPayments)}
      </p>

      <p>
        <strong>Total Monthly Interest:</strong>{" "}
        {helpers.money(totalMonthlyInterest)}
      </p>

      <p>
        <strong>Total Annual Interest:</strong>{" "}
        {helpers.money(totalAnnualInterest)}
      </p>
    </div>
  );
};

export default DebtSummary;