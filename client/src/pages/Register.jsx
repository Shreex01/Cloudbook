import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
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
      await axios.post('/api/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert("Registration Failed: " + (err.response?.data || "Server Error"));
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Username:</label>
          <input type="text" name="username" onChange={handleChange} style={{ width: "100%", padding: "8px" }} required />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input type="email" name="email" onChange={handleChange} style={{ width: "100%", padding: "8px" }} required />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input type="password" name="password" onChange={handleChange} style={{ width: "100%", padding: "8px" }} required />
        </div>

        <button type="submit" style={{ width: "100%", padding: "10px", background: "blue", color: "white", border: "none" }}>
          Register
        </button>
      </form>
      
      <p style={{ marginTop: "10px", textAlign: "center" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
