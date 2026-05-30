import { useEffect, useState } from "react";

export default function AppDashboard() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBills() {
      try {
        const response = await fetch(
          "http://127.0.0.1/bill/backend/api/items.php"
        );

        const data = await response.json();
        setBills(data.items || []);
      } catch (err) {
        console.error("Failed to load bills:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBills();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Bills</h1>

      {bills.length === 0 ? (
        <p>You have no bills yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Due Day</th>
              <th>Autopay</th>
              <th>Link</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td>{bill.name}</td>
                <td>${Number(bill.amount).toFixed(2)}</td>
                <td>{bill.due_day}</td>
                <td>{bill.autopay ? "Yes" : "No"}</td>
                <td>
                  {bill.link && (
                    <a href={bill.link} target="_blank" rel="noreferrer">
                      Pay
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
