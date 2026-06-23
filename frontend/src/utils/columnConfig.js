// src/utils/columnConfig.js

const columnConfig = {
  name: {
    key: "name",
    label: "Name",
    sortable: true,
    draggable: true,
    align: "left",
  },

  amount: {
    key: "amount",
    label: "Amount",
    sortable: true,
    draggable: true,
    align: "right",
  },

  hold_amount: {
    key: "hold_amount",
    label: "Hold",
    sortable: true,
    draggable: true,
    align: "right",
  },

  due_day: {
    key: "due_day",
    label: "Due Day",
    sortable: true,
    draggable: true,
    align: "center",
  },

  next_due: {
    key: "next_due",
    label: "Next Due",
    sortable: true,
    draggable: true,
    align: "center",
  },

  notes: {
    key: "notes",
    label: "Notes",
    sortable: true,
    draggable: true,
    align: "left",
  },

  actions: {
    key: "actions",
    label: "",
    sortable: false,
    draggable: false, // LOCKED
    align: "center",
  },
};

// Default column order (used if DB has none)
export const defaultOrder = [
  "name",
  "amount",
  "hold_amount",
  "due_day",
  "next_due",
  "notes",
  "actions",
];

export default columnConfig;
