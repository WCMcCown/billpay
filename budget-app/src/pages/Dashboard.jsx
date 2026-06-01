import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ user, ready }) => {
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState(null);
    const [bills, setBills] = useState([]);
    const [upcoming, setUpcoming] = useState([]);

    const [viewMode, setViewMode] = useState("table");

    const [totalBillsHold, setTotalBillsHold] = useState(0);
    const [totalUpcomingHold, setTotalUpcomingHold] = useState(0);

    const API = "http://127.0.0.1/bill/backend/api";

    useEffect(() => {
        if (!ready || !user?.id) return;

        Promise.all([
            fetch(`${API}/settings.php?user_id=${user.id}`).then(r => r.json()),
            fetch(`${API}/bills.php?user_id=${user.id}`).then(r => r.json()),
            fetch(`${API}/upcoming_expenses.php?user_id=${user.id}`).then(r => r.json())
        ])
        .then(([settingsRes, billsRes, upcomingRes]) => {

            if (settingsRes.success) setSettings(settingsRes.settings);
            if (billsRes.success) setBills(billsRes.bills || []);
            if (upcomingRes.success) setUpcoming(upcomingRes.expenses || []);

            setLoading(false);
        })
        .catch(err => {
            console.error("FETCH FAILED:", err);
            setLoading(false);
        });
    }, [ready, user]);

    const updateUpcomingHold = (id, newHold) => {
        const payload = {
            id,
            user_id: user.id,
            hold_amount: parseFloat(newHold)
        };

        fetch(`${API}/upcoming_expenses.php`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(() => {
            setUpcoming(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, hold_amount: newHold } : item
                )
            );
        });
    };

    const updateBillHold = (id, newHold) => {
        const payload = {
            id,
            user_id: user.id,
            hold_amount: parseFloat(newHold)
        };

        fetch(`${API}/bills.php`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(() => {
            setBills(prev =>
                prev.map(b =>
                    b.id === id ? { ...b, hold_amount: newHold } : b
                )
            );
        });
    };

    const deleteUpcoming = (id) => {
        const payload = { id, user_id: user.id };

        fetch(`${API}/upcoming_expenses.php`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(() => {
            setUpcoming(prev => prev.filter(item => item.id !== id));
        });
    };

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this bill?")) return;

        const response = await fetch(`${API}/bills.php`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, user_id: user.id })
        });

        const data = await response.json();

        if (data.success) {
            setBills(prev => prev.filter(b => b.id !== id));
        } else {
            alert("Failed to delete bill");
        }
        }


    useEffect(() => {
        const billsHold = bills.reduce((sum, b) => sum + parseFloat(b.hold_amount || 0), 0);
        const upcomingHold = upcoming.reduce((sum, u) => sum + parseFloat(u.hold_amount || 0), 0);

        setTotalBillsHold(billsHold);
        setTotalUpcomingHold(upcomingHold);
    }, [bills, upcoming]);

    if (loading) return <div>Loading dashboard…</div>;

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <h2>Dashboard</h2>

            <div style={{ marginBottom: "20px" }}>
                <button
                    className={`btn ${viewMode === "table" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setViewMode("table")}
                    style={{ marginRight: "10px" }}
                >
                    Table View
                </button>

                <button
                    className={`btn ${viewMode === "cards" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setViewMode("cards")}
                >
                    Card View
                </button>
            </div>

            {/* UPCOMING EXPENSES */}
            <div style={{ marginBottom: "40px" }}>
                <h3>Upcoming Expenses</h3>

                <Link to="/add-upcoming" className="btn btn-success" style={{ marginBottom: "15px" }}>
                    + Add Upcoming Expense
                </Link>

                {viewMode === "table" ? (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>Hold</th>
                                <th>Due Date</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcoming.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>${parseFloat(item.amount).toFixed(2)}</td>

                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.hold_amount}
                                            onChange={(e) => updateUpcomingHold(item.id, e.target.value)}
                                            style={{ width: "90px" }}
                                        />
                                    </td>

                                    <td>{item.due_date || ""}</td>
                                    <td>{item.notes || ""}</td>

                                    <td>
                                        <Link
                                            to={`/edit-upcoming/${item.id}`}
                                            className="btn btn-sm btn-primary"
                                            style={{ marginRight: "5px" }}
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => deleteUpcoming(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>
                        {upcoming.map(item => (
                            <div
                                key={item.id}
                                className="card"
                                style={{ marginBottom: "15px", padding: "15px" }}
                            >
                                <h4>{item.name}</h4>
                                <p><strong>Amount:</strong> ${parseFloat(item.amount).toFixed(2)}</p>

                                <p>
                                    <strong>Hold:</strong>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.hold_amount}
                                        onChange={(e) => updateUpcomingHold(item.id, e.target.value)}
                                        style={{ width: "100px", marginLeft: "10px" }}
                                    />
                                </p>

                                {item.due_date && <p><strong>Due:</strong> {item.due_date}</p>}
                                {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}

                                <Link
                                    to={`/edit-upcoming/${item.id}`}
                                    className="btn btn-primary"
                                    style={{ marginRight: "10px" }}
                                >
                                    Edit
                                </Link>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => deleteUpcoming(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* BILLS */}
            <div style={{ marginBottom: "40px" }}>
                <h3>Bills</h3>

                <Link to="/add-bill" className="btn btn-success" style={{ marginBottom: "15px" }}>
                    + Add Bill
                </Link>

                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Hold</th>
                            <th>Due Day</th>
                            <th>Frequency</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map(b => (
                            <tr key={b.id}>
                                <td>{b.name}</td>
                                <td>${parseFloat(b.amount).toFixed(2)}</td>

                                <td>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={b.hold_amount}
                                        onChange={(e) => updateBillHold(b.id, e.target.value)}
                                        style={{ width: "90px" }}
                                    />
                                </td>

                                <td>{b.due_day}</td>
                                <td>{b.frequency}</td>

                                <td>
                                    <Link
                                        to={`/edit-bill/${b.id}`}
                                        className="btn btn-sm btn-primary"
                                    >
                                        Edit
                                    </Link>
                                </td>

                                <td>
                                    <button
                                        style={{ background: "red", color: "white" }}
                                        onClick={() => handleDelete(b.id)}
                                    >
                                        Delete
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* TOTALS */}
            <div style={{ marginBottom: "40px" }}>
                <h3>Totals</h3>

                <p><strong>Total Bills Hold:</strong> ${totalBillsHold.toFixed(2)}</p>
                <p><strong>Total Upcoming Hold:</strong> ${totalUpcomingHold.toFixed(2)}</p>

                <h4>
                    Free to Spend: $
                    {(totalBillsHold + totalUpcomingHold).toFixed(2)}
                </h4>
            </div>
        </div>
    );
};

export default Dashboard;
