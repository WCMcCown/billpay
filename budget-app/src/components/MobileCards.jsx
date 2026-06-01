import React from "react";

function MobileCards({ items }) {
  return (
    <div className="container py-3">
      <h4 className="mb-3">Mobile Cards</h4>

      {items.map(item => (
        <div
          key={item.id}
          className="p-3 mb-4 rounded shadow border bg-white"
          style={{ borderLeft: "5px solid #0d6efd" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{item.name}</h5>
            <span className="badge bg-primary">{item.due_date}</span>
          </div>

          <hr />

          <div className="d-flex justify-content-between text-center">
            <div>
              <div className="fw-bold fs-5">${item.amount}</div>
              <div className="small text-muted">Amount</div>
            </div>

            <div>
              <div className="fw-bold fs-5">${item.hold_amount}</div>
              <div className="small text-muted">Hold</div>
            </div>

            <div>
              <div className="fw-bold fs-5">{item.apr}%</div>
              <div className="small text-muted">APR</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MobileCards;
