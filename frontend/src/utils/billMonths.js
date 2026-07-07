// frontend/src/utils/billMonths.js
import { apiFetch } from "../api/http";

/**
 * Fetch all months for a bill
 */
export async function fetchBillMonths(billId, userId) {
  const res = await apiFetch(`get_bill_months.php?bill_id=${billId}&user_id=${userId}`);
  return res.months || [];
}

/**
 * Update a single month (status, marks_current)
 */
export async function updateBillMonth({ billId, userId, year, month, status, marksCurrent = 0 }) {
  return apiFetch("update_bill_month.php", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bill_id: billId,
      user_id: userId,
      year,
      month,
      status,
      marks_current: marksCurrent,
    }),
  });
}

/**
 * Apply a payment to a month
 */
export async function applyPaymentToMonth({
  billId,
  userId,
  year,
  month,
  amount,
  paymentId,
  marksCurrent = 0,
}) {
  return apiFetch("apply_payment_to_month.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bill_id: billId,
      user_id: userId,
      year,
      month,
      amount,
      payment_id: paymentId,
      marks_current: marksCurrent,
    }),
  });
}

/**
 * Generate future months (12–24 months)
 */
export async function generateBillMonths(billId, userId, monthsAhead = 24) {
  return apiFetch(`generate_bill_months.php?bill_id=${billId}&user_id=${userId}&months=${monthsAhead}`);
}

/**
 * Get next due date for a bill
 */
export function getNextDueDate(bill) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  const due = new Date(year, month, bill.due_day);

  // If due date already passed, move to next month
  if (due < today) {
    return new Date(year, month + 1, bill.due_day);
  }

  return due;
}

/**
 * Get the coverage month (month containing next due date)
 */
export function getCoverageMonth(bill) {
  const nextDue = getNextDueDate(bill);
  return {
    year: nextDue.getFullYear(),
    month: nextDue.getMonth() + 1, // 1-based
  };
}

/**
 * Determine the active month based on pay periods
 */
export function getActiveMonth(settings) {
  const today = new Date();
  const nextPayday = new Date(settings.next_payday);

  // If today is before next payday → active month is current month
  if (today < nextPayday) {
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    };
  }

  // If today >= next payday → active month is next month
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return {
    year: nextMonth.getFullYear(),
    month: nextMonth.getMonth() + 1,
  };
}

/**
 * Determine if a bill is current based on bill_months
 */
export function isBillCurrent(bill, months, settings) {
  const active = getActiveMonth(settings);

  const row = months.find(
    (m) => m.year === active.year && m.month === active.month
  );

  if (!row) return false;

  return row.status === "paid" || row.marks_current === 1;
}

/**
 * Calculate hold amount for a bill based on pay periods
 */
export function calculateHoldAmount(bill, settings) {
  const nextDue = getNextDueDate(bill);
  const payFrequency = settings.pay_frequency; // "biweekly", "weekly", etc.
  const nextPayday = new Date(settings.next_payday);

  let remainingPaychecks = 1;

  if (payFrequency === "biweekly") {
    const msPerDay = 86400000;
    const days = Math.ceil((nextDue - nextPayday) / msPerDay);
    remainingPaychecks = Math.max(1, Math.ceil(days / 14));
  }

  if (payFrequency === "weekly") {
    const msPerDay = 86400000;
    const days = Math.ceil((nextDue - nextPayday) / msPerDay);
    remainingPaychecks = Math.max(1, Math.ceil(days / 7));
  }

  return bill.amount / remainingPaychecks;
}

/**
 * Get icon for a month status
 */
export function getMonthStatusIcon(status) {
  switch (status) {
    case "paid":
      return "✔️"; // green check
    case "late":
      return "⚠️"; // yellow caution
    case "partial":
      return "➗"; // half icon
    case "deferred":
      return "⏸️"; // pause
    case "autopay":
      return "⚡"; // lightning
    default:
      return ""; // blank
  }
}

/**
 * Get CSS class for a month status
 */
export function getMonthStatusClass(status) {
  switch (status) {
    case "paid":
      return "month-paid";
    case "late":
      return "month-late";
    case "partial":
      return "month-partial";
    case "deferred":
      return "month-deferred";
    case "autopay":
      return "month-autopay";
    default:
      return "month-unpaid";
  }
}
