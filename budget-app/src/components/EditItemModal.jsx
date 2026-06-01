import { useState, useEffect } from "react";

function EditItemModal({ show, item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    due_date: "",
    amount: "",
    hold_amount: "",
    apr: ""
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        due_date: item.due_date,
        amount: item.amount,
        hold_amount: item.hold_amount,
        apr: item.apr
      });
    }
  }, [item]);

  if (!show) return null;

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const save = () => {
    onSave(item.id, form);
  };

  return (
    <div className="modal-backdrop show" style={{ display: "block" }}>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Edit Item</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.due_date}
                  onChange={(e) => updateField("due_date", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Hold Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.hold_amount}
                  onChange={(e) => updateField("hold_amount", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">APR</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.apr}
                  onChange={(e) => updateField("apr", e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EditItemModal;
