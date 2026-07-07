import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

const closeNavbar = () => {
    const navbar = document.getElementById("navbarNav");
    if (!navbar) return;

    // Only close if it's currently open
    if (navbar.classList.contains("show")) {
        const bsCollapse = window.bootstrap.Collapse.getInstance(navbar)
            || new window.bootstrap.Collapse(navbar, { toggle: false });

        bsCollapse.hide();
    }
};

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container-fluid">

                {/* App Name */}
                <Link className="navbar-brand" to="/" onClick={closeNavbar}>
                    BillPilot
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">

                        {/* Only show these if logged in */}
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard" onClick={closeNavbar}>
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/add-upcoming" onClick={closeNavbar}>
                                        Add Upcoming
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/add-bill" onClick={closeNavbar}>
                                        Add Bill
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/settings" onClick={closeNavbar}>
                                        Settings
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        {!user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Login
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <button
                                    className="btn btn-outline-light"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
