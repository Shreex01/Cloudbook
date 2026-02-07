import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Marketplace() {
  const [books, setBooks] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    axios.get('http://localhost:5000/api/books/marketplace').then(res => setBooks(res.data));
  }, []);

  const handleBuy = async (bookId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/buy/${bookId}`);
      alert("Bought!");
    } catch (err) { alert("Already owned or error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Global Marketplace</h2>
        <Link to="/add-book?mode=marketplace"><button>+ Sell Book</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {books.map(book => (
          <div key={book._id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <h3>{book.title}</h3> <p>${book.price}</p>
            <button onClick={() => handleBuy(book._id)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Marketplace;