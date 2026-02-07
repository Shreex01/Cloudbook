import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // 1. Save the Token and User ID
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user._id);

      alert("Login Successful!");

      // 2. Redirect to Home
      navigate('/');
      
      // 3. Force a quick reload so the Navbar updates (shows "Logout" instead of "Login")
      window.location.reload(); 

    } catch (err) {
      console.error(err);
      alert("Login Failed: " + (err.response?.data || "Server Error"));
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>Login to CloudBook</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Enter email..." 
            value={formData.email} 
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            placeholder="Enter password..." 
            value={formData.password} 
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>

        <button type="submit" style={{ width: "100%", padding: "10px", background: "#333", color: "white", border: "none", cursor: "pointer" }}>
          Login
        </button>
      </form>
      
      <p style={{ marginTop: "10px", textAlign: "center" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;