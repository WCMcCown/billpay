import React, { useMemo } from "react";
import * as helpers from "../../utils/helpers";

const DebtProjections = ({ bills }) => {
  const weightedMonths = useMemo(() => {
    const debts = bills.filter((b) => b.type === "debt");
    if (debts.length === 0) return 0;

    let totalRemaining = 0;
    let weighted = 0;

    debts.forEach((b) => {
      const payoff = helpers.payoffEstimate(
        b.remaining,
        b.apr,
        b.amount
      );
      totalRemaining += parseFloat(b.remaining || 0);
      weighted += payoff.months * parseFloat(b.remaining || 0);
    });

    return Math.round(weighted / totalRemaining);
  }, [bills]);

  const avalancheMonths = useMemo(
    () => helpers.simulateAvalanche?.(bills) ?? 0,
    [bills]
  );

  const snowballMonths = useMemo(
    () => helpers.simulateSnowball?.(bills) ?? 0,
    [bills]
  );

  const weightedDate = weightedMonths
    ? helpers.monthsToDate(weightedMonths)
    : "";

  const avalancheDate = helpers.monthsToDate(avalancheMonths);
  const snowballDate = helpers.monthsToDate(snowballMonths);

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: "#f9f9f9",
      }}
    >
      <h3>Debt Payoff Projections</h3>

      <p>
        <strong>Weighted Average Payoff:</strong> {weightedMonths} months{" "}
        {weightedDate && `(${weightedDate})`}
      </p>

      <p>
        <strong>Avalanche Method:</strong> {avalancheMonths} months (
        {avalancheDate})
      </p>

      <p>
        <strong>Snowball Method:</strong> {snowballMonths} months (
        {snowballDate})
      </p>
    </div>
  );
};

export default DebtProjections;
