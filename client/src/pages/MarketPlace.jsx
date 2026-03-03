import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Upload, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { UploadBook } from '../features/books/UploadBook';
import axios from 'axios';

export function Marketplace() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // Book Details Modal State

  const categories = ['All', 'Science', 'Productivity', 'Programming', 'Business', 'Self-Help'];

  useEffect(() => {
    fetchMarketplaceBooks();
  }, []);

  const fetchMarketplaceBooks = async () => {
    try {
      // Assuming a GET /api/books endpoint returns all public books.
      // E.g., const res = await axios.get('/api/books/marketplace');
      // For now we'll fetch all books and assume they are public
      // If there's no specific marketplace endpoint, we can fall back to the mock or adjust backend later.
      const res = await axios.get('/api/books/marketplace');
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching marketplace books:", err);
    }
  };

  const handlePublish = async (bookData) => {
    try {
      const formData = new FormData();
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('bookFile', bookData.file);
      if (bookData.coverFile) {
        formData.append('coverFile', bookData.coverFile);
      }

      // Add a flag or field to distinguish this is a marketplace publication
      // formData.append('isMarketplace', 'true');
      // Currently the schema requires price etc., defaulting to 0 for upload
      formData.append('price', '19.99');

      const token = localStorage.getItem('token');
      const res = await axios.post('/api/books/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      // Add the returned book to the list
      setBooks([res.data.book, ...books]);
      setIsPublishModalOpen(false);
    } catch (err) {
      console.error("Failed to publish book:", err);
      alert(err.response?.data?.message || err.message || "Upload failed");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleBuy = async (bookId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert("Please log in to purchase books.");
        return;
      }

      // Load Razorpay script
      const resLoad = await loadRazorpayScript();
      if (!resLoad) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 1. Create order on backend
      const res = await axios.post('/api/payment/create-order', {
        bookId,
        userId
      });

      const { order, bookId: resBookId, userId: resUserId } = res.data;

      // 2. Setup Razorpay options
      const options = {
        key: "rzp_test_SMjIl6jiuay3fa", // Add your Razorpay Key ID here
        amount: order.amount,
        currency: order.currency,
        name: "CloudBook",
        description: "Book Purchase",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment on backend
          try {
            const verifyRes = await axios.post('/api/payment/verify-payment', {
              ...response,
              bookId: resBookId,
              userId: resUserId
            });
            alert(verifyRes.data.message);
          } catch (verifyErr) {
            console.error("Verification failed", verifyErr);
            alert("Payment verification failed. Please contact support.");
          }
        },
        theme: {
          color: "#2563EB", // Tailwind blue-600
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Discover and publish your next favorite book</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Replaced Cart button with Publish button */}
          <Button variant="primary" onClick={() => setIsPublishModalOpen(true)} className="bg-blue-600 hover:bg-blue-500">
            <Upload size={18} className="mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or author..."
            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter size={20} className="text-gray-400 min-w-[20px]" />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <Card
            key={book._id}
            className="group overflow-hidden border-transparent hover:border-white/20 transition-all duration-300 hover:-translate-y-1 bg-white/5 hover:bg-white/10 cursor-pointer"
            onClick={() => setSelectedBook(book)} // Open Modal when clicked
          >
            {/* Image Container */}
            <div className="aspect-[2/3] w-full overflow-hidden relative bg-black/50">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title || 'Book Cover'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
                  <span className="text-4xl text-white/20">CB</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold text-white border border-white/10">
                  {book.category || 'General'}
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
                  <Star size={12} fill="currentColor" />
                  {book.rating || 'New'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-white leading-tight mb-1 truncate">{book.title || 'Untitled Book'}</h3>
                <p className="text-sm text-gray-400 truncate">{book.author || 'Unknown Author'}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xl font-bold text-blue-400">${book.price || '0.00'}</span>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger the card's onClick
                    handleBuy(book._id);
                  }}
                >
                  Buy
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-20 text-gray-500 flex flex-col items-center">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="text-xl">No books found in the marketplace.</p>
          <p className="text-sm mt-2 opacity-70">Be the first to publish one!</p>
        </div>
      )}

      {/* Publish Book Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish to Marketplace"
      >
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-400 mb-6 text-center">
            Upload your PDF and cover image to make your book available to everyone in the CloudBook network.
          </p>
          <UploadBook onUpload={handlePublish} />
        </div>
      </Modal>

      {/* Book Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedBook(null)}
            title="Book Details"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start max-w-2xl mx-auto p-2">
              {/* Img Column */}
              <div className="w-48 flex-shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                {selectedBook.coverUrl ? (
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-full h-[288px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[288px] flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <span className="text-3xl text-white/20">CB</span>
                  </div>
                )}
              </div>

              {/* Details Column */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">{selectedBook.title}</h2>
                  <p className="text-lg text-gray-400 mt-1">by {selectedBook.author}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-semibold text-gray-300 border border-white/10">
                    {selectedBook.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                    <Star size={14} fill="currentColor" />
                    {selectedBook.rating || 'New Release'}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="text-sm font-semibold text-white mb-2">Synopsis</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {selectedBook.description || "Discover this incredible literary work now available on CloudBook. Join thousands of readers diving into this story today."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 flex items-center gap-2">Price</p>
                    <p className="text-3xl font-bold text-blue-400">
                      ${selectedBook.price || '0.00'}
                    </p>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    onClick={() => {
                      setSelectedBook(null);
                      handleBuy(selectedBook._id);
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Marketplace;
