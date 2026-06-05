import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import EditBill from "./EditBill";
import AddBill from "./AddBill";
import AddUpcomingExpense from "./AddUpcomingExpense";
import EditUpcomingExpense from "./EditUpcomingExpense";
import Modal from "../components/Modal";


const Dashboard = ({ user, ready }) => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    const [bills, setBills] = useState([]);
    const [expandedBills, setExpandedBills] = useState({});
    const [upcoming, setUpcoming] = useState([]);
    const [startingAmount, setStartingAmount] = useState(0);

    const [viewMode, setViewMode] = useState(null);

    const [totalBillsHold, setTotalBillsHold] = useState(0);
    const [totalUpcomingHold, setTotalUpcomingHold] = useState(0);

    const [editingBillId, setEditingBillId] = useState(null);
    const [addingBill, setAddingBill] = useState(false);

    const [addingUpcoming, setAddingUpcoming] = useState(false);
    const [editingUpcomingId, setEditingUpcomingId] = useState(null);

    const API = "http://127.0.0.1/bill/backend/api";

    const toggleBillExpand = (id) => {
            setExpandedBills(prev => ({
                ...prev,
                [id]: !prev[id]
            }));
        };

    // Load settings + bills + upcoming
    useEffect(() => {
        if (!ready || !user?.id) return;

        Promise.all([
            fetch(`${API}/settings.php?user_id=${user.id}`).then(r => r.json()),
            fetch(`${API}/bills.php?user_id=${user.id}`).then(r => r.json()),
            fetch(`${API}/upcoming_expenses.php?user_id=${user.id}`).then(r => r.json())
        ])
            .then(([settingsRes, billsRes, upcomingRes]) => {
                if (settingsRes.success) {
                    setSettings(settingsRes.settings);
                    setStartingAmount(parseFloat(settingsRes.settings.starting_amount || 0));
                }
                if (billsRes.success) {
                    const initialized = (billsRes.bills || []).map(bill => ({
                        ...bill,
                        hold_amount: bill.hold_amount ?? calculateHoldForBill(bill, settingsRes.settings)
                    }));
                    setBills(initialized);
                }
                if (upcomingRes.success) {
                    const initialized = (upcomingRes.expenses || []).map(item => ({
                        ...item,
                        hold_amount: item.hold_amount ?? parseFloat(item.amount)
                    }));
                    setUpcoming(initialized);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("FETCH FAILED:", err);
                setLoading(false);
            });
    }, [ready, user]);


    // Apply view mode from settings + auto responsive behavior
    useEffect(() => {
        if (!settings) return;

        if (settings.view_mode === "auto") {
            const update = () => {
                if (window.innerWidth < 768) {
                    setViewMode("cards");
                } else {
                    setViewMode("table");
                }
            };

            update();
            window.addEventListener("resize", update);
            return () => window.removeEventListener("resize", update);
        }

        setViewMode(settings.view_mode);
    }, [settings]);


    // Update hold amounts
    const updateUpcomingHold = (id, newHold) => {
        setUpcoming(prev =>
            prev.map(u =>
                u.id === id ? { ...u, hold_amount: newHold } : u
            )
        );
    };

    const updateBillHold = (id, newHold) => {
        setBills(prev =>
            prev.map(b =>
                b.id === id ? { ...b, hold_amount: newHold } : b
            )
        );
    };

    const saveStartingAmount = (value) => {
        fetch(`${API}/settings.php`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                starting_amount: value
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setSettings(prev => ({
                    ...prev,
                    starting_amount: value
                }));
            }
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

    // Helpers
    const money = (n) => `$${parseFloat(n).toFixed(2)}`;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US");
    };

    const daysUntilDue = (dueDay) => {
        const today = new Date();
        const currentDay = today.getDate();
        let diff = dueDay - currentDay;
        if (diff < 0) diff += 30;
        return diff;
    };

    const nextDueDate = (dueDay) => {
        const today = new Date();
        let date = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (date < today) date = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
        return date.toLocaleDateString("en-US");
    };

    const monthlyEquivalent = (amount, frequency) =>
        (parseFloat(amount) * parseFloat(frequency)).toFixed(2);

    const interestPerPeriod = (apr, remaining) => {
        const rate = parseFloat(apr) / 100 / 12;
        return (remaining * rate).toFixed(2);
    };

    const interestPerYear = (apr, remaining) => {
        const rate = parseFloat(apr) / 100;
        return (remaining * rate).toFixed(2);
    };

    const payoffEstimate = (remaining, apr, monthlyPayment) => {
        remaining = parseFloat(remaining);
        apr = parseFloat(apr);
        monthlyPayment = parseFloat(monthlyPayment);

        if (monthlyPayment <= 0 || remaining <= 0) {
            return { months: 0, date: "", totalInterest: 0 };
        }

        const monthlyRate = apr / 100 / 12;

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

        const numerator = -Math.log(1 - (monthlyRate * remaining) / monthlyPayment);
        const denominator = Math.log(1 + monthlyRate);

        let months = Math.ceil(numerator / denominator);

        if (!isFinite(months) || months < 0) {
            return { months: Infinity, date: "Never", totalInterest: Infinity };
        }

        const totalPaid = months * monthlyPayment;
        const totalInterest = (totalPaid - remaining).toFixed(2);

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + months);

        return {
            months,
            date: payoffDate.toLocaleDateString("en-US"),
            totalInterest
        };
    };

    function calculateHoldForBill(bill, settings) {
        const amount = parseFloat(bill.amount);
        const frequencyMonths = parseFloat(bill.frequency); // e.g. 1 = monthly, 3 = quarterly

        // Convert user pay frequency into months
        const payFreqMap = {
            weekly: 0.25,
            biweekly: 0.5,
            semimonthly: 0.5,
            monthly: 1
        };

        const userPayMonths = payFreqMap[settings.pay_frequency];

        // Paychecks per bill cycle
        const paychecksPerCycle = frequencyMonths / userPayMonths;

        // Amount to save per paycheck
        const amountPerPaycheck = amount / paychecksPerCycle;

        // Determine next due date
        const today = new Date();
        let due = new Date(today.getFullYear(), today.getMonth(), bill.due_day);
        if (due < today) {
            due = new Date(today.getFullYear(), today.getMonth() + 1, bill.due_day);
        }

        // Determine next payday
        let nextPayday = new Date(settings.next_payday);

        // Count paychecks passed since last due date
        let lastDue = new Date(due);
        lastDue.setMonth(lastDue.getMonth() - frequencyMonths);

        let paychecksPassed = 0;
        let temp = new Date(lastDue);

        while (temp <= today) {
            paychecksPassed++;
            temp = new Date(temp.getTime() + userPayMonths * 30 * 24 * 60 * 60 * 1000);
        }

        // Hold amount = amountPerPaycheck * paychecksPassed
        const holdAmount = amountPerPaycheck * paychecksPassed;

        return parseFloat(holdAmount.toFixed(2));
    }

    const weightedDebtFreeMonths = () => {
    const debts = bills.filter(b => b.type === "debt");
    if (debts.length === 0) return 0;

    let totalRemaining = 0;
    let weightedMonths = 0;

    debts.forEach(b => {
        const payoff = payoffEstimate(b.remaining, b.apr, b.amount);
        totalRemaining += parseFloat(b.remaining);
        weightedMonths += payoff.months * parseFloat(b.remaining);
    });

    return Math.round(weightedMonths / totalRemaining);
};

    const simulateAvalanche = (debts) => {
        // Clone debts so we don't mutate state
        debts = debts
            .filter(d => d.type === "debt" && d.remaining > 0)
            .map(d => ({
                name: d.name,
                balance: parseFloat(d.remaining),
                apr: parseFloat(d.apr),
                payment: parseFloat(d.amount)
            }))
            .sort((a, b) => b.apr - a.apr); // highest APR first

        let months = 0;

        while (debts.some(d => d.balance > 0)) {
            months++;

            for (let i = 0; i < debts.length; i++) {
                let d = debts[i];
                if (d.balance <= 0) continue;

                // Monthly interest
                const interest = d.balance * (d.apr / 100 / 12);

                // Apply payment
                d.balance = d.balance + interest - d.payment;

                // If paid off this month
                if (d.balance <= 0) {
                    d.balance = 0;

                    // Roll payment into next debt
                    if (i + 1 < debts.length) {
                        debts[i + 1].payment += d.payment;
                    }
                }
            }

            // Safety limit
            if (months > 2000) break;
        }

        return months;
    };



    const simulateSnowball = (debts) => {
        debts = debts
            .filter(d => d.type === "debt" && d.remaining > 0)
            .map(d => ({
                name: d.name,
                balance: parseFloat(d.remaining),
                apr: parseFloat(d.apr),
                payment: parseFloat(d.amount)
            }))
            .sort((a, b) => a.balance - b.balance); // smallest balance first

        let months = 0;

        while (debts.some(d => d.balance > 0)) {
            months++;

            for (let i = 0; i < debts.length; i++) {
                let d = debts[i];
                if (d.balance <= 0) continue;

                const interest = d.balance * (d.apr / 100 / 12);
                d.balance = d.balance + interest - d.payment;

                if (d.balance <= 0) {
                    d.balance = 0;

                    if (i + 1 < debts.length) {
                        debts[i + 1].payment += d.payment;
                    }
                }
            }

            if (months > 2000) break;
        }

        return months;
    };



    const monthsToDate = (months) => {
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toLocaleDateString("en-US");
    };

    const hasDebts = bills.some(b => b.type === "debt");

    const weightedMonths = useMemo(() => {
        if (!hasDebts) return 0;
        return weightedDebtFreeMonths();
    }, [bills]);

    const avalancheMonths = useMemo(() => simulateAvalanche(bills), [bills]);
    const snowballMonths = useMemo(() => simulateSnowball(bills), [bills]);

    const avalancheDate = monthsToDate(avalancheMonths);
    const snowballDate = monthsToDate(snowballMonths);

    const weightedDate = weightedMonths ? monthsToDate(weightedMonths) : "";


    // Totals
    useEffect(() => {
        const billsHold = bills.reduce((sum, b) => sum + parseFloat(b.hold_amount || 0), 0);
        const upcomingHold = upcoming.reduce((sum, u) => sum + parseFloat(u.hold_amount || 0), 0);

        setTotalBillsHold(billsHold);
        setTotalUpcomingHold(upcomingHold);
    }, [bills, upcoming]);

    // Total amount to hold per check
    const totalHoldPerCheck = totalBillsHold + totalUpcomingHold;

    // Total debt remaining
    const totalDebtRemaining = bills
        .filter(b => b.type === "debt")
        .reduce((sum, b) => sum + parseFloat(b.remaining || 0), 0);

    // Total monthly payments (sum of monthly equivalents for debts)
    const totalMonthlyPayments = bills
        .filter(b => b.type === "debt")
        .reduce((sum, b) => sum + parseFloat(monthlyEquivalent(b.amount, b.frequency)), 0);

    // Total monthly interest
    const totalMonthlyInterest = bills
        .filter(b => b.type === "debt")
        .reduce((sum, b) => sum + parseFloat(interestPerPeriod(b.apr, b.remaining)), 0);

    // Total annual interest
    const totalAnnualInterest = bills
        .filter(b => b.type === "debt")
        .reduce((sum, b) => sum + parseFloat(interestPerYear(b.apr, b.remaining)), 0);



    if (loading) return <div>Loading dashboard…</div>;

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <h2>Dashboard</h2>

            <div style={{ marginBottom: "25px" }}>
                <label><strong>Starting Amount (Cash on Hand):</strong></label>
                <input
                    type="number"
                    step="0.01"
                    value={startingAmount}
                    onChange={(e) => setStartingAmount(parseFloat(e.target.value))}
                    onBlur={() => saveStartingAmount(startingAmount)}
                    className="form-control"
                    style={{ width: "200px" }}
                />
            </div>

            {/* UPCOMING EXPENSES */}
            <div style={{ marginBottom: "40px" }}>
                <h3>Upcoming Expenses</h3>

                <button
                    className="btn btn-success"
                    style={{ marginBottom: "15px" }}
                    onClick={() => setAddingUpcoming(true)}
                >
                    + Add Upcoming Expense
                </button>

                {/* TABLE VIEW */}
                {viewMode === "table" && (
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
                                            value={item.hold_amount ?? ""}
                                            onChange={(e) => updateUpcomingHold(item.id, e.target.value)}
                                            style={{ width: "90px" }}
                                        />
                                    </td>
                                    <td>{formatDate(item.due_date || "")}</td>
                                    <td>{item.notes || ""}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            style={{ marginRight: "5px" }}
                                            onClick={() => setEditingUpcomingId(item.id)}
                                        >
                                            Edit
                                        </button>
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
                )}

                {/* CARD VIEW */}
                {viewMode === "cards" && (
                    <div>
                        {bills.map(b => {
                            const isDebt = b.type === "debt";
                            const payoff = isDebt
                                ? payoffEstimate(b.remaining, b.apr, b.amount)
                                : null;

                            const expanded = expandedBills[b.id];

                            return (
                                <div
                                    key={b.id}
                                    className="card"
                                    style={{
                                        marginBottom: "15px",
                                        padding: "15px",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px"
                                    }}
                                >
                                    {/* COLLAPSED HEADER */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => toggleBillExpand(b.id)}
                                    >
                                        <h4 style={{ margin: 0 }}>{b.name}</h4>

                                        <button className="btn btn-sm btn-secondary">
                                            {expanded ? "▲" : "▼"}
                                        </button>
                                    </div>

                                    {/* SUMMARY ROW */}
                                    <div style={{ marginTop: "10px" }}>
                                        <p><strong>Amount:</strong> {money(b.amount)}</p>

                                        <p>
                                            <strong>Hold:</strong>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={b.hold_amount ?? ""}
                                                onChange={(e) => updateBillHold(b.id, e.target.value)}
                                                style={{ width: "100px", marginLeft: "10px" }}
                                            />
                                        </p>

                                        <p><strong>Due Day:</strong> {b.due_day}</p>
                                        <p><strong>Days Left:</strong> {daysUntilDue(b.due_day)}</p>
                                    </div>

                                    {/* EXPANDED DETAILS */}
                                    {expanded && (
                                        <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
                                            <p><strong>Next Due:</strong> {nextDueDate(b.due_day)}</p>
                                            <p><strong>Monthly:</strong> {money(monthlyEquivalent(b.amount, b.frequency))}</p>

                                            {isDebt && (
                                                <>
                                                    <p><strong>APR:</strong> {b.apr}%</p>
                                                    <p><strong>Remaining:</strong> {money(b.remaining)}</p>
                                                    <p><strong>Months Left:</strong> {payoff.months}</p>
                                                    <p><strong>Payoff Date:</strong> {payoff.date}</p>
                                                    <p><strong>Total Interest:</strong> {money(payoff.totalInterest)}</p>
                                                    <p><strong>Interest / Mo:</strong> {money(interestPerPeriod(b.apr, b.remaining))}</p>
                                                    <p><strong>Interest / Yr:</strong> {money(interestPerYear(b.apr, b.remaining))}</p>
                                                </>
                                            )}

                                            {b.link && (
                                                <p>
                                                    <a
                                                        href={b.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-info"
                                                    >
                                                        Pay
                                                    </a>
                                                </p>
                                            )}

                                            {b.notes && (
                                                <p><strong>Notes:</strong> {b.notes}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* ACTION BUTTONS */}
                                    <div style={{ marginTop: "15px" }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ marginRight: "10px" }}
                                            onClick={() => setEditingBillId(b.id)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(b.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* BILLS */}
            <div style={{ marginBottom: "40px" }}>
                <h3>Bills</h3>

                <button
                    className="btn btn-success"
                    onClick={() => setAddingBill(true)}
                >
                    + Add Bill
                </button>

                {/* TABLE VIEW */}
                {viewMode === "table" && (
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
                                const payoff = isDebt
                                    ? payoffEstimate(b.remaining, b.apr, b.amount)
                                    : null;

                                return (
                                    <tr key={b.id}>
                                        <td>{b.name}</td>
                                        <td>{money(b.amount)}</td>

                                        <td>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={b.hold_amount ?? ""}
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

                                        <td>{isDebt ? `${b.apr}%` : ""}</td>
                                        <td>{isDebt ? money(b.remaining) : ""}</td>

                                        {isDebt ? (
                                            <>
                                                <td>{payoff.months === Infinity ? "∞" : payoff.months}</td>
                                                <td>{payoff.date}</td>
                                                <td>{money(payoff.totalInterest)}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </>
                                        )}

                                        <td>{isDebt ? money(interestPerPeriod(b.apr, b.remaining)) : ""}</td>
                                        <td>{isDebt ? money(interestPerYear(b.apr, b.remaining)) : ""}</td>

                                        <td>
                                            {b.link ? (
                                                <a
                                                    href={b.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-sm btn-info"
                                                >
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
                                            <button
                                                className="btn btn-sm btn-primary"
                                                style={{ marginRight: "10px" }}
                                                onClick={() => setEditingBillId(b.id)}
                                            >
                                                Edit
                                            </button>

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
                )}

                {/* CARD VIEW */}
                {viewMode === "cards" && (
                    <div>
                        {bills.map(b => {
                            const isDebt = b.type === "debt";
                            const payoff = isDebt
                                ? payoffEstimate(b.remaining, b.apr, b.amount)
                                : null;

                            return (
                                <div
                                    key={b.id}
                                    className="card"
                                    style={{ marginBottom: "15px", padding: "15px" }}
                                >
                                    <h4>{b.name}</h4>
                                    <p><strong>Amount:</strong> {money(b.amount)}</p>

                                    <p>
                                        <strong>Hold:</strong>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={b.hold_amount ?? ""}
                                            onChange={(e) => updateBillHold(b.id, e.target.value)}
                                            style={{ width: "100px", marginLeft: "10px" }}
                                        />
                                    </p>

                                    <p><strong>Due Day:</strong> {b.due_day}</p>
                                    <p><strong>Next Due:</strong> {nextDueDate(b.due_day)}</p>
                                    <p><strong>Days Left:</strong> {daysUntilDue(b.due_day)}</p>
                                    <p><strong>Monthly:</strong> {money(monthlyEquivalent(b.amount, b.frequency))}</p>

                                    {isDebt && (
                                        <>
                                            <p><strong>APR:</strong> {b.apr}%</p>
                                            <p><strong>Remaining:</strong> {money(b.remaining)}</p>
                                            <p><strong>Months Left:</strong> {payoff.months}</p>
                                            <p><strong>Payoff Date:</strong> {payoff.date}</p>
                                            <p><strong>Total Interest:</strong> {money(payoff.totalInterest)}</p>
                                        </>
                                    )}

                                    {b.link && (
                                        <a
                                            href={b.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-info"
                                            style={{ marginRight: "10px" }}
                                        >
                                            Pay
                                        </a>
                                    )}

                                    <button
                                        className="btn btn-primary"
                                        style={{ marginRight: "10px" }}
                                        onClick={() => setEditingBillId(b.id)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(b.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>


            {/* TOTALS */}
            <div style={{ marginBottom: "40px" }}>
                <h3>Totals</h3>

                <p><strong>Total Bills Hold:</strong> ${totalBillsHold.toFixed(2)}</p>

                <p><strong>Total Upcoming Hold:</strong> ${totalUpcomingHold.toFixed(2)}</p>

                <p><strong>Total Hold Per Check:</strong> ${totalHoldPerCheck.toFixed(2)}</p>

                <h4>
                    Free to Spend: $
                    {(startingAmount - (totalBillsHold + totalUpcomingHold)).toFixed(2)}
                </h4>
            </div>

            <div style={{ marginBottom: "40px", marginTop: "20px" }}>
                <h3>Debt Summary</h3>

                <p><strong>Total Debt Remaining:</strong> ${totalDebtRemaining.toFixed(2)}</p>

                <p><strong>Total Monthly Payments:</strong> ${totalMonthlyPayments.toFixed(2)}</p>

                <p><strong>Total Monthly Interest:</strong> ${totalMonthlyInterest.toFixed(2)}</p>

                <p><strong>Total Annual Interest:</strong> ${totalAnnualInterest.toFixed(2)}</p>
            </div>

            <div style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#f9f9f9"
            }}>
                <h3>Debt Payoff Projections</h3>

                <p><strong>Weighted Average Payoff:</strong> {weightedMonths} months ({weightedDate})</p>

                <p><strong>Avalanche Method:</strong> {avalancheMonths} months ({avalancheDate})</p>

                <p><strong>Snowball Method:</strong> {snowballMonths} months ({snowballDate})</p>
            </div>





            {/* EDIT BILL MODAL */}
            {editingBillId && (
                <Modal onClose={() => setEditingBillId(null)}>
                    <EditBill
                        billId={editingBillId}
                        onClose={(updatedBill) => {
                            setEditingBillId(null);

                            if (updatedBill) {
                                setBills(prev =>
                                    prev.map(b =>
                                        b.id === updatedBill.id ? updatedBill : b
                                    )
                                );
                            }
                        }}
                    />
                </Modal>
            )}

            {/* ADD BILL MODAL */}
            {addingBill && (
                <Modal onClose={() => setAddingBill(false)}>
                    <AddBill
                        user={user}
                        onClose={(newBill) => {
                            setAddingBill(false);

                            if (newBill) {
                                setBills(prev => [...prev, newBill]);
                            }
                        }}
                    />
                </Modal>
            )}

            {/* ADD UPCOMING EXPENSE MODAL */}
            {addingUpcoming && (
                <Modal onClose={() => setAddingUpcoming(false)}>
                    <AddUpcomingExpense
                        user={user}
                        onClose={(newExpense) => {
                            setAddingUpcoming(false);

                            if (newExpense) {
                                setUpcoming(prev => [...prev, newExpense]);
                            }
                        }}
                    />
                </Modal>
            )}

            {/* EDIT UPCOMING EXPENSE MODAL */}
            {editingUpcomingId && (
                <Modal onClose={() => setEditingUpcomingId(null)}>
                    <EditUpcomingExpense
                        expenseId={editingUpcomingId}
                        user={user}
                        onClose={(updatedExpense) => {
                            setEditingUpcomingId(null);

                            if (updatedExpense) {
                                setUpcoming(prev =>
                                    prev.map(e =>
                                        e.id === updatedExpense.id ? updatedExpense : e
                                    )
                                );
                            }
                        }}
                    />
                </Modal>
            )}


        </div>
    );
};

export default Dashboard;
