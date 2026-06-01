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

    // Format currency
    const money = (n) => `$${parseFloat(n).toFixed(2)}`;

    // Format date from YYYY-MM-DD → MM/DD/YYYY
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US");
    };

    // Days until due (simple version)
    const daysUntilDue = (dueDay) => {
        const today = new Date();
        const currentDay = today.getDate();
        let diff = dueDay - currentDay;
        if (diff < 0) diff += 30;
        return diff;
    };

    // Next due date
    const nextDueDate = (dueDay) => {
        const today = new Date();
        let date = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (date < today) date = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
        return date.toLocaleDateString("en-US");
    };

    // Monthly equivalent (frequency = times per month)
    const monthlyEquivalent = (amount, frequency) => {
        return (parseFloat(amount) * parseFloat(frequency)).toFixed(2);
    };

    // Interest per period (for debts)
    const interestPerPeriod = (apr, remaining) => {
        const rate = parseFloat(apr) / 100 / 12;
        return (remaining * rate).toFixed(2);
    };

    // Interest per year (for debts)
    const interestPerYear = (apr, remaining) => {
        const rate = parseFloat(apr) / 100;
        return (remaining * rate).toFixed(2);
    };

    // Roughly estimated pay off month
    const payoffEstimate = (remaining, apr, monthlyPayment) => {
        remaining = parseFloat(remaining);
        apr = parseFloat(apr);
        monthlyPayment = parseFloat(monthlyPayment);

        if (monthlyPayment <= 0 || remaining <= 0) {
            return { months: 0, date: "", totalInterest: 0 };
        }

        const monthlyRate = apr / 100 / 12;

        // If APR is 0, payoff is simple
        if (monthlyRate === 0) {
            const months = Math.ceil(remaining / monthlyPayment);
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + months);
            return {
                months,
                date: payoffDate.toLocaleDateString("en-US"),
                totalInterest: 0
            };
        }

        // Standard amortization formula:
        // n = -log(1 - r*P/B) / log(1+r)
        const numerator = -Math.log(1 - (monthlyRate * remaining) / monthlyPayment);
        const denominator = Math.log(1 + monthlyRate);

        let months = Math.ceil(numerator / denominator);

        // Prevent infinite loops if payment is too small
        if (!isFinite(months) || months < 0) {
            return { months: Infinity, date: "Never", totalInterest: Infinity };
        }

        // Calculate total interest
        const totalPaid = months * monthlyPayment;
        const totalInterest = (totalPaid - remaining).toFixed(2);

        // Calculate payoff date
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + months);

        return {
            months,
            date: payoffDate.toLocaleDateString("en-US"),
            totalInterest
        };
    };



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

                                    <td>{formatDate(item.due_date || "")}</td>
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
                            <th>Next Due</th>
                            <th>Days Left</th>
                            <th>Monthly</th>
                            <th>Autopay</th>
                            <th>Category</th>
                            <th>APR</th>
                            <th>Remaining</th>
                            <th>Months Left</th>
                            <th>Payoff Date</th>
                            <th>Total Interest Left</th>
                            <th>Interest / Mo</th>
                            <th>Interest / Yr</th>
                            <th>Link</th>
                            <th>Notes</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {bills.map(b => {
                            const isDebt = b.type === "debt";

                            return (
                                <tr key={b.id}>
                                    <td>{b.name}</td>

                                    <td>{money(b.amount)}</td>

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

                                    <td>{nextDueDate(b.due_day)}</td>

                                    <td>{daysUntilDue(b.due_day)}</td>

                                    <td>{money(monthlyEquivalent(b.amount, b.frequency))}</td>

                                    <td>{b.autopay ? "Yes" : "No"}</td>

                                    <td>{b.category || ""}</td>

                                    {/* Debt-only fields */}
                                    <td>{isDebt ? `${b.apr}%` : ""}</td>

                                    <td>{isDebt ? money(b.remaining) : ""}</td>

                                    {(() => {
                                        if (!isDebt) return (
                                            <>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </>
                                        );

                                        const payoff = payoffEstimate(b.remaining, b.apr, b.amount);

                                        return (
                                            <>
                                                <td>{payoff.months === Infinity ? "∞" : payoff.months}</td>
                                                <td>{payoff.date}</td>
                                                <td>{money(payoff.totalInterest)}</td>
                                            </>
                                        );
                                    })()}

                                    <td>{isDebt ? money(interestPerPeriod(b.apr, b.remaining)) : ""}</td>

                                    <td>{isDebt ? money(interestPerYear(b.apr, b.remaining)) : ""}</td>

                                    <td>
                                        {b.link ? (
                                            <a href={b.link} target="_blank" rel="noreferrer" className="btn btn-sm btn-info">
                                                Pay
                                            </a>
                                        ) : ""}
                                    </td>

                                    <td>
                                        {b.notes ? (
                                            <span title={b.notes} style={{ cursor: "help" }}>📝</span>
                                        ) : ""}
                                    </td>

                                    <td>
                                        <Link
                                            to={`/edit-bill/${b.id}`}
                                            className="btn btn-sm btn-primary"
                                            style={{ marginRight: "10px" }}
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(b.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
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
