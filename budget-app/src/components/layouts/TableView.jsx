import React, { useState, useRef } from "react";

/**
 * TableView (Base Engine)
 * -----------------------
 * A generic, reusable table engine that supports:
 * - Sorting
 * - Sticky headers
 * - Column reordering (drag & drop)
 * - Dynamic column visibility
 * - Custom cell rendering
 *
 * This component does NOT know anything about bills.
 * Layout components (Full, Standard, Compact) pass:
 * - visibleColumns: array of column keys
 * - columnConfig: metadata for each column
 * - data: array of row objects
 * - renderCell: (row, columnKey) => JSX
 * - onSort: (columnKey) => void
 * - sortField, sortDirection
 */

const TableView = ({
  data,
  visibleColumns,
  columnConfig,
  renderCell,
  onSort,
  sortField,
  sortDirection,
}) => {
  const [draggingCol, setDraggingCol] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const headerRefs = useRef({});

  // Sort arrow
  const arrow = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
    };

  // Drag start
  const handleDragStart = (colKey) => {
    setDraggingCol(colKey);
  };

  // Drag over
  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    setDragOverCol(colKey);
  };

  // Drop → reorder columns
  const handleDrop = (colKey) => {
    if (!draggingCol || draggingCol === colKey) return;

    const currentOrder = [...visibleColumns];
    const fromIndex = currentOrder.indexOf(draggingCol);
    const toIndex = currentOrder.indexOf(colKey);

    currentOrder.splice(fromIndex, 1);
    currentOrder.splice(toIndex, 0, draggingCol);

    // Persist globally (localStorage for now)
    localStorage.setItem("columnOrder", JSON.stringify(currentOrder));

    setDraggingCol(null);
    setDragOverCol(null);

    // Reload page or notify parent (parent should re-read order)
    window.dispatchEvent(new Event("columnOrderUpdated"));
  };

  return (
    <table className="table table-striped sticky-table">
      <thead>
        <tr>
          {visibleColumns.map((colKey) => {
            const col = columnConfig[colKey];
            if (!col) return null;

            return (
              <th
                key={colKey}
                ref={(el) => (headerRefs.current[colKey] = el)}
                draggable={true}
                onDragStart={() => handleDragStart(colKey)}
                onDragOver={(e) => handleDragOver(e, colKey)}
                onDrop={() => handleDrop(colKey)}
                style={{
                  cursor: col.sortable ? "pointer" : "grab",
                  background:
                    dragOverCol === colKey ? "rgba(0,0,0,0.05)" : "inherit",
                  userSelect: "none",
                }}
                onClick={() => col.sortable && onSort(colKey)}
              >
                {col.label}
                {col.sortable && arrow(colKey)}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {visibleColumns.map((colKey) => (
              <td key={colKey}>{renderCell(row, colKey)}</td>
            ))}
          </tr>
        ))}

        {data.length === 0 && (
          <tr>
            <td
              colSpan={visibleColumns.length}
              style={{ textAlign: "center", padding: "20px" }}
            >
              No items found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableView;
