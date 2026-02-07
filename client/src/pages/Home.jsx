import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() {
  const [books, setBooks] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/books/my-library/${userId}`)
        .then(res => setBooks(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const handleDelete = async (bookId) => {
    if (window.confirm("Delete this book?")) {
      await axios.delete(`http://localhost:5000/api/books/${bookId}`);
      setBooks(books.filter(b => b._id !== bookId));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Personal Library</h2>
        <Link to="/add-book?mode=private">
          <button style={{ background: "#007bff", color: "white", padding: "10px" }}>+ Upload to My Library</button>
        </Link>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {books.map(book => (
          <div key={book._id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <h3>{book.title}</h3>
            <a href={book.fileUrl} target="_blank" rel="noreferrer">
              <button style={{ width: "100%", background: "green", color: "white", padding: "5px" }}>Read</button>
            </a>
            <button onClick={() => handleDelete(book._id)} style={{ width: "100%", background: "red", color: "white", marginTop: "5px" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;