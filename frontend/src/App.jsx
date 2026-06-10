import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard";
import AddBill from "./pages/AddBill";
import EditBill from "./pages/EditBill";

import AddUpcomingExpense from "./pages/AddUpcomingExpense";
import EditUpcomingExpense from "./pages/EditUpcomingExpense";
import Settings from "./pages/Settings";

function App() {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setReady(true);
    }, []);


    return (
        <Router>
            <NavBar user={user} setUser={setUser} />

            <Routes>

                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />

                {/* PROTECTED ROUTES */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard user={user} ready={ready} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings user={user} />
                        </ProtectedRoute>
                    }
                />

                {/* Bills */}
                <Route
                    path="/add-bill"
                    element={
                        <ProtectedRoute>
                            <AddBill user={user} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit-bill/:id"
                    element={
                        <ProtectedRoute>
                            <EditBill user={user} />
                        </ProtectedRoute>
                    }
                />

                {/* Upcoming Expenses */}
                <Route
                    path="/add-upcoming"
                    element={
                        <ProtectedRoute>
                            <AddUpcomingExpense user={user} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit-upcoming/:id"
                    element={
                        <ProtectedRoute>
                            <EditUpcomingExpense user={user} />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </Router>
    );
}

export default App;
