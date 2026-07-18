import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Pilah Pilih</Link>
      
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/pickup">Request Pickup</Link>
            <Link to="/history">Riwayat</Link>
            <Link to="/wallet">Wallet</Link>
            <Link to="/withdraw">Withdraw</Link>
            <button className="secondary" onClick={handleLogout} style={{ padding: "0.5rem 1rem", width: "auto" }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
