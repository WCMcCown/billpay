function ItemsTable({ items }) {
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
            <td>${item.hold_amount}</td>
            <td>{item.apr}%</td>
            <td>
              <button className="btn btn-sm btn-primary">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ItemsTable;
