import React, { useMemo } from "react";
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
}) => {
  // -----------------------------
  // Drag + Drop handlers
  // -----------------------------
  const moveColumn = (dragKey, hoverKey) => {
    if (dragKey === hoverKey) return;

    const newOrder = [...columnOrder];
    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);

    onColumnOrderChange(newOrder);
  };

  // -----------------------------
  // Header Cell Component
  // -----------------------------
  const HeaderCell = ({ colKey }) => {
    const col = columnConfig[colKey];

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
        onClick={() => col.sortable && onSort(col.key)}
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

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <table className="table table-striped sticky-table">
      <thead>
        <tr>
          {columnOrder.map((colKey) => (
            <HeaderCell key={colKey} colKey={colKey} />
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columnOrder.map((colKey) => (
              <td
                key={colKey}
                style={{ textAlign: columnConfig[colKey].align || "left" }}
              >
                {renderCell(row, colKey)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableView;
