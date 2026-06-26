// frontend/src/utils/sorting.js
/**
 * frontend/src/utils/sorting.js
 * ----------
 * Generic sorting engine for table data.
 *
 * Provides:
 * - sortData(data, field, direction)
 * - Automatic handling of:
 *    • numbers
 *    • strings
 *    • dates
 *    • null/undefined
 *
 * This file does NOT store sort state — the parent component does.
 */

function normalize(value) {
  if (value === null || value === undefined) return "";

  // Numeric strings → numbers
  if (!isNaN(value) && value !== "") return parseFloat(value);

  // Date strings → timestamps
  const date = new Date(value);
  if (!isNaN(date.getTime())) return date.getTime();

  // Everything else → lowercase string
  return value.toString().toLowerCase();
}

/**
 * Sorts an array of objects by a given field.
 *
 * @param {Array} data - The array to sort
 * @param {string} field - The key to sort by
 * @param {"asc"|"desc"} direction - Sort direction
 * @returns {Array} - New sorted array
 */
export function sortData(data, field, direction = "asc") {
  if (!field) return data;

  const sorted = [...data];

  sorted.sort((a, b) => {
    const av = normalize(a[field]);
    const bv = normalize(b[field]);

    if (av < bv) return direction === "asc" ? -1 : 1;
    if (av > bv) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}
