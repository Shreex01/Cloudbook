import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <nav style={{ background: "#333", padding: "10px 20px", color: "white", display: "flex", justifyContent: "space-between" }}>
      <h2>CloudBook</h2>
      <div>
        {isLoggedIn ? (
          <>
            <Link to="/" style={{ color: "white", marginRight: "15px" }}>My Library</Link>
            <Link to="/marketplace" style={{ color: "lightgreen", marginRight: "15px" }}>Marketplace</Link>
            <button onClick={handleLogout} style={{ background: "red", color: "white" }}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: "white" }}>Login</Link>
        )}
      </div>
    </nav>
  );
}
export default Navbar;
