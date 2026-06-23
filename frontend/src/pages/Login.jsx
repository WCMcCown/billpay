// login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/http";   // ⭐ NEW — centralized API wrapper

function Login() {
  const navigate = useNavigate();

  // -----------------------------
  // State
  // -----------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // -----------------------------
  // Handle login
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ⭐ Correct endpoint: login.php
      const data = await apiFetch("login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid login");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error");
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light px-4">
      <h2 className="fw-bold mb-4">BillPilot</h2>

      <form
        onSubmit={handleLogin}
        className="p-4 bg-white shadow rounded"
        style={{ width: "100%", maxWidth: "380px" }}
      >
        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100 mt-2">Log In</button>

        <div className="text-center mt-3">
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
