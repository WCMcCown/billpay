// frontend/src/components/layouts/TableView.jsx

import React from "react";
import { useDrag, useDrop } from "react-dnd";
import columnConfig from "../../utils/columnConfig";

const DRAG_TYPE = "COLUMN";

const TableView = ({
  data,
  columnOrder,
  onColumnOrderChange,
  onSort,
  sortField,
  sortDirection,
  renderCell,
  visibleColumns, // optional
}) => {
  // ✅ Never let undefined blow up .map()
  const safeData = Array.isArray(data) ? data : [];
  const safeOrder = Array.isArray(columnOrder) ? columnOrder : [];

  // If visibleColumns not provided, show everything in columnOrder
  const safeVisible =
    Array.isArray(visibleColumns) && visibleColumns.length > 0
      ? safeOrder.filter((k) => visibleColumns.includes(k))
      : safeOrder;

  const moveColumn = (dragKey, hoverKey) => {
    if (dragKey === hoverKey) return;
    const newOrder = [...safeOrder];
    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);
    if (dragIndex === -1 || hoverIndex === -1) return;
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);
    onColumnOrderChange && onColumnOrderChange(newOrder);
  };

  const HeaderCell = ({ colKey }) => {
    const col = columnConfig[colKey];
    if (!col) return null;

    const [{ isDragging }, dragRef] = useDrag({
      type: DRAG_TYPE,
      item: { colKey },
      canDrag: col.draggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, dropRef] = useDrop({
      accept: DRAG_TYPE,
      hover: (item) => {
        if (item.colKey !== colKey) {
          moveColumn(item.colKey, colKey);
        }
      },
    });

    const ref = col.draggable ? (node) => dragRef(dropRef(node)) : dropRef;

    return (
      <th
        ref={ref}
        style={{
          opacity: isDragging ? 0.4 : 1,
          cursor: col.draggable ? "grab" : "default",
          textAlign: col.align || "left",
          whiteSpace: "nowrap",
        }}
        onClick={() => col.sortable && onSort && onSort(col.key)}
      >
        {col.label}
        {col.sortable && sortField === col.key && (
          <span style={{ marginLeft: "5px" }}>
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </th>
    );
  };

  return (
    <table className="table table-striped sticky-table">
      <thead>
        <tr>
          {safeVisible.map((colKey) => (
            <HeaderCell key={colKey} colKey={colKey} />
          ))}
        </tr>
      </thead>
      <tbody>
        {safeData.map((row) => (
          <tr key={row.id}>
            {safeVisible.map((colKey) => (
              <td
                key={colKey}
                style={{ textAlign: columnConfig[colKey]?.align || "left" }}
              >
                {renderCell ? renderCell(row, colKey) : row[colKey]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableView;
