import { Link } from "react-router-dom";

function Splash() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center px-4">
      <h1 className="display-4 fw-bold mb-3">BillPilot</h1>
      <p className="lead text-muted mb-4">
        Navigate your bills with confidence
      </p>

      <Link to="/login" className="btn btn-primary btn-lg px-4">
        Get Started
      </Link>
    </div>
  );
}

export default Splash;
