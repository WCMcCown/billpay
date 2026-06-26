// src/utils/columnConfig.js

const columnConfig = {
  name:        { key: "name",        label: "Name",        sortable: true,  draggable: true,  align: "left" },
  amount:      { key: "amount",      label: "Amount",      sortable: true,  draggable: true,  align: "right" },
  hold_amount: { key: "hold_amount", label: "Hold",        sortable: true,  draggable: true,  align: "right" },
  due_day:     { key: "due_day",     label: "Due Day",     sortable: true,  draggable: true,  align: "center" },
  next_due:    { key: "next_due",    label: "Next Due",    sortable: true,  draggable: true,  align: "center" },

  frequency:   { key: "frequency",   label: "Frequency",   sortable: true,  draggable: true,  align: "center" },
  category:    { key: "category",    label: "Category",    sortable: true,  draggable: true,  align: "left" },
  type:        { key: "type",        label: "Type",        sortable: true,  draggable: true,  align: "left" },
  remaining:   { key: "remaining",   label: "Remaining",   sortable: true,  draggable: true,  align: "right" },
  apr:         { key: "apr",         label: "APR",         sortable: true,  draggable: true,  align: "right" },
  autopay:     { key: "autopay",     label: "Autopay",     sortable: true,  draggable: true,  align: "center" },
  link:        { key: "link",        label: "Link",        sortable: false, draggable: true,  align: "left" },

  interest_month: { key: "interest_month", label: "Interest / Mo", sortable: false, draggable: true, align: "right" },
  interest_year:  { key: "interest_year",  label: "Interest / Yr", sortable: false, draggable: true, align: "right" },
  payoff_months:  { key: "payoff_months",  label: "Months Left",   sortable: false, draggable: true, align: "center" },
  payoff_date:    { key: "payoff_date",    label: "Payoff Date",   sortable: false, draggable: true, align: "center" },

  notes:      { key: "notes",      label: "Notes", sortable: true,  draggable: true,  align: "left" },
  actions:    { key: "actions",    label: "",      sortable: false, draggable: false, align: "center" },
};

export const defaultOrder = [
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
];

export default columnConfig;
