import { useEffect, useState } from "react";

function PaymentHistoryModal({ show, item, onClose }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (show && item) {
      fetch(`http://127.0.0.1/bill/backend/api/get_payments.php?item_id=${item.id}`)
        .then(res => res.json())
        .then(data => setPayments(data));
    }
  }, [show, item]);

  if (!show) return null;

  return (
    <div className="modal-backdrop show" style={{ display: "block" }}>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Payment History — {item.name}</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {payments.length === 0 ? (
                <p className="text-muted">No payments recorded.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td>${p.amount}</td>
                        <td>{p.paid_at}</td>
                        <td>{p.note || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentHistoryModal;
