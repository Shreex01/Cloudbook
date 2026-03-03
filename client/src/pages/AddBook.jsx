import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AddBook() {
  const [formData, setFormData] = useState({ title: '', author: '', price: '', genre: '' });
  const [file, setFile] = useState(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMarketplace = searchParams.get('mode') === 'marketplace';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('bookFile', file);
      data.append('ownerId', userId);
      // CRITICAL FLAG
      data.append('isMarketplace', isMarketplace);

      await axios.post('/api/books/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Upload Success!");
      navigate(isMarketplace ? '/marketplace' : '/');
    } catch (err) { alert("Upload Failed"); }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2 style={{ color: isMarketplace ? "purple" : "blue" }}>
        {isMarketplace ? "Sell on Marketplace" : "Add to Private Library"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required style={{ display: "block", width: "100%", margin: "10px 0" }} />
        <input name="author" placeholder="Author" onChange={handleChange} required style={{ display: "block", width: "100%", margin: "10px 0" }} />
        <input name="price" type="number" placeholder="Price" onChange={handleChange} required style={{ display: "block", width: "100%", margin: "10px 0" }} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required style={{ display: "block", width: "100%", margin: "10px 0" }} />
        <button type="submit" style={{ padding: "10px", width: "100%", background: isMarketplace ? "purple" : "blue", color: "white" }}>Upload</button>
      </form>
    </div>
  );
}

export default AddBook;
