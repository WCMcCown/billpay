import { useState } from "react";

function ItemsTable({ items, onHoldChange }) {
  const [editingId, setEditingId] = useState(null);
  const [holdValue, setHoldValue] = useState("");

  const startEditing = (item) => {
    setEditingId(item.id);
    setHoldValue(item.hold_amount);
  };

  const saveHold = (id) => {
    onHoldChange(id, holdValue);
    setEditingId(null);
  };

  return (
    <table className="table table-striped table-hover align-middle">
      <thead className="table-dark">
        <tr>
          <th>Name</th>
          <th>Due Date</th>
          <th>Amount</th>
          <th>Hold</th>
          <th>APR</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.due_date}</td>
            <td>${item.amount}</td>

            <td>
              {editingId === item.id ? (
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={holdValue}
                  onChange={(e) => setHoldValue(e.target.value)}
                  style={{ width: "90px" }}
                />
              ) : (
                `$${item.hold_amount}`
              )}
            </td>

            <td>{item.apr}%</td>

            <td>
              {editingId === item.id ? (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => saveHold(item.id)}
                >
                  Save
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
               ) : (
                <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => onHistory(item)}
                >
                  History
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ItemsTable;
