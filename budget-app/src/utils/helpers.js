/**
 * helpers.js
 * ----------
 * Centralized helper utilities for:
 * - Money formatting
 * - Date formatting
 * - Bill due‑date math
 * - Debt payoff calculations
 * - Interest calculations
 * - Hold amount calculations
 * - Avalanche & Snowball simulations
 * - Months → date conversion
 */

// -----------------------------
// Money + formatting
// -----------------------------
export function money(n) {
  return `$${parseFloat(n || 0).toFixed(2)}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US");
}

// -----------------------------
// Due‑date math
// -----------------------------
export function daysUntilDue(dueDay) {
  const today = new Date();
  const currentDay = today.getDate();
  let diff = dueDay - currentDay;
  if (diff < 0) diff += 30;
  return diff;
}

export function nextDueDate(dueDay) {
  const today = new Date();
  let date = new Date(today.getFullYear(), today.getMonth(), dueDay);

  if (date < today) {
    date = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  }

  return date.toLocaleDateString("en-US");
}

// -----------------------------
// Monthly equivalents
// -----------------------------
export function monthlyEquivalent(amount, frequency) {
  return (parseFloat(amount || 0) * parseFloat(frequency || 1)).toFixed(2);
}

// -----------------------------
// Interest calculations
// -----------------------------
export function interestPerPeriod(apr, remaining) {
  const rate = parseFloat(apr || 0) / 100 / 12;
  return (parseFloat(remaining || 0) * rate).toFixed(2);
}

export function interestPerYear(apr, remaining) {
  const rate = parseFloat(apr || 0) / 100;
  return (parseFloat(remaining || 0) * rate).toFixed(2);
}

// -----------------------------
// Debt payoff estimate
// -----------------------------
export function payoffEstimate(remaining, apr, monthlyPayment) {
  remaining = parseFloat(remaining || 0);
  apr = parseFloat(apr || 0);
  monthlyPayment = parseFloat(monthlyPayment || 0);

  if (monthlyPayment <= 0 || remaining <= 0) {
    return { months: 0, date: "", totalInterest: 0 };
  }

  const monthlyRate = apr / 100 / 12;

  // No interest case
  if (monthlyRate === 0) {
    const months = Math.ceil(remaining / monthlyPayment);
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    return {
      months,
      date: payoffDate.toLocaleDateString("en-US"),
      totalInterest: 0,
    };
  }

  // Standard amortization formula
  const numerator = -Math.log(1 - (monthlyRate * remaining) / monthlyPayment);
  const denominator = Math.log(1 + monthlyRate);
  let months = Math.ceil(numerator / denominator);

  if (!isFinite(months) || months < 0) {
    return { months: Infinity, date: "Never", totalInterest: Infinity };
  }

  const totalPaid = months * monthlyPayment;
  const totalInterest = (totalPaid - remaining).toFixed(2);
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    months,
    date: payoffDate.toLocaleDateString("en-US"),
    totalInterest,
  };
}

// -----------------------------
// Convert months → date
// -----------------------------
export function monthsToDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US");
}

// -----------------------------
// Hold amount calculation
// -----------------------------
export function calculateHoldForBill(bill, settings) {
  const amount = parseFloat(bill.amount || 0);
  const frequencyMonths = parseFloat(bill.frequency || 1); // e.g. 1 = monthly, 3 = quarterly

  // Convert user pay frequency into months
  const payFreqMap = {
    weekly: 0.25,
    biweekly: 0.5,
    semimonthly: 0.5,
    monthly: 1,
  };

  const userPayMonths = payFreqMap[settings.pay_frequency] || 1;

  // Paychecks per bill cycle
  const paychecksPerCycle = frequencyMonths / userPayMonths;

  // Amount to save per paycheck
  const amountPerPaycheck = amount / paychecksPerCycle;

  // Determine next due date
  const today = new Date();
  let due = new Date(today.getFullYear(), today.getMonth(), bill.due_day);
  if (due < today) {
    due = new Date(today.getFullYear(), today.getMonth() + 1, bill.due_day);
  }

  // Count paychecks passed since last due date
  let lastDue = new Date(due);
  lastDue.setMonth(lastDue.getMonth() - frequencyMonths);

  let paychecksPassed = 0;
  let temp = new Date(lastDue);

  while (temp <= today) {
    paychecksPassed++;
    temp = new Date(
      temp.getTime() + userPayMonths * 30 * 24 * 60 * 60 * 1000
    );
  }

  const holdAmount = amountPerPaycheck * paychecksPassed;
  return parseFloat(holdAmount.toFixed(2));
}

// -----------------------------
// Avalanche Method Simulation
// -----------------------------
export function simulateAvalanche(debtsInput) {
  let debts = debtsInput
    .filter((d) => d.type === "debt" && d.remaining > 0)
    .map((d) => ({
      name: d.name,
      balance: parseFloat(d.remaining || 0),
      apr: parseFloat(d.apr || 0),
      payment: parseFloat(d.amount || 0),
    }))
    .sort((a, b) => b.apr - a.apr); // highest APR first

  let months = 0;

  while (debts.some((d) => d.balance > 0)) {
    months++;

    for (let i = 0; i < debts.length; i++) {
      let d = debts[i];
      if (d.balance <= 0) continue;

      const interest = d.balance * (d.apr / 100 / 12);
      d.balance = d.balance + interest - d.payment;

      if (d.balance <= 0) {
        d.balance = 0;

        if (i + 1 < debts.length) {
          debts[i + 1].payment += d.payment;
        }
      }
    }

    if (months > 2000) break; // safety
  }

  return months;
}

// -----------------------------
// Snowball Method Simulation
// -----------------------------
export function simulateSnowball(debtsInput) {
  let debts = debtsInput
    .filter((d) => d.type === "debt" && d.remaining > 0)
    .map((d) => ({
      name: d.name,
      balance: parseFloat(d.remaining || 0),
      apr: parseFloat(d.apr || 0),
      payment: parseFloat(d.amount || 0),
    }))
    .sort((a, b) => a.balance - b.balance); // smallest balance first

  let months = 0;

  while (debts.some((d) => d.balance > 0)) {
    months++;

    for (let i = 0; i < debts.length; i++) {
      let d = debts[i];
      if (d.balance <= 0) continue;

      const interest = d.balance * (d.apr / 100 / 12);
      d.balance = d.balance + interest - d.payment;

      if (d.balance <= 0) {
        d.balance = 0;

        if (i + 1 < debts.length) {
          debts[i + 1].payment += d.payment;
        }
      }
    }

    if (months > 2000) break; // safety
  }

  return months;
}
