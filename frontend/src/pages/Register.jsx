import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://127.0.0.1/bill/backend/api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      // Debug logging
      console.log("Response status:", res.status);

      const text = await res.text();
      console.log("Raw text:", text);

      const data = JSON.parse(text);

      if (data.success) {
        setSuccess("Account created successfully");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Unable to reach server");
      console.error(err);
    }
  };


  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light px-4">
      <h2 className="fw-bold mb-4">Create Account</h2>

      <form
        onSubmit={handleRegister}
        className="p-4 bg-white shadow rounded"
        style={{ width: "100%", maxWidth: "380px" }}
      >
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
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

        <button className="btn btn-primary w-100 mt-2">Register</button>

        <div className="text-center mt-3">
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
