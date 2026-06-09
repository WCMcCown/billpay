/**
 * columnConfig.js
 * ----------------
 * Master configuration for all bill table columns.
 *
 * Each column defines:
 * - label: Header text
 * - sortable: Whether clicking the header triggers sorting
 * - width (optional): Suggested width
 * - align (optional): "left" | "center" | "right"
 *
 * TableView.jsx uses this to render headers.
 * Layout components choose which columns to show.
 */

const columnConfig = {
  name: {
    label: "Name",
    sortable: true,
    align: "left",
  },

  amount: {
    label: "Amount",
    sortable: true,
    align: "right",
  },

  hold: {
    label: "Hold",
    sortable: false,
    align: "right",
  },

  due_day: {
    label: "Due Day",
    sortable: true,
    align: "center",
  },

  next_due: {
    label: "Next Due",
    sortable: false,
    align: "center",
  },

  days_left: {
    label: "Days Left",
    sortable: false,
    align: "center",
  },

  monthly: {
    label: "Monthly",
    sortable: false,
    align: "right",
  },

  autopay: {
    label: "Autopay",
    sortable: false,
    align: "center",
  },

  category: {
    label: "Category",
    sortable: false,
    align: "left",
  },

  apr: {
    label: "APR",
    sortable: false,
    align: "right",
  },

  remaining: {
    label: "Remaining",
    sortable: true,
    align: "right",
  },

  months_left: {
    label: "Months Left",
    sortable: false,
    align: "center",
  },

  payoff_date: {
    label: "Payoff Date",
    sortable: false,
    align: "center",
  },

  total_interest: {
    label: "Total Interest Left",
    sortable: false,
    align: "right",
  },

  interest_month: {
    label: "Interest / Mo",
    sortable: false,
    align: "right",
  },

  interest_year: {
    label: "Interest / Yr",
    sortable: false,
    align: "right",
  },

  link: {
    label: "Link",
    sortable: false,
    align: "center",
  },

  notes: {
    label: "Notes",
    sortable: false,
    align: "center",
  },

  actions: {
    label: "",
    sortable: false,
    align: "center",
  },
};

export default columnConfig;
