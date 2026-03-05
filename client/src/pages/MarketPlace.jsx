import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMarketplaceBooks();
  }, []);

  const handlePublish = async (bookData) => {
    try {
      const formData = new FormData();
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('description', bookData.description || '');
      formData.append('category', bookData.category || 'General');
      formData.append('tags', bookData.tags || '');
      formData.append('price', bookData.price || '0');
      formData.append('ownerId', localStorage.getItem('userId'));
      formData.append('isMarketplace', 'true');
      if (bookData.file) formData.append('bookFile', bookData.file);
      if (bookData.coverFile) formData.append('coverFile', bookData.coverFile);

      const token = localStorage.getItem('token');
      const res = await axios.post('/api/books/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

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

  // Safely portal the Publish button into the layout's top bar after mount
  const [actionsSlot, setActionsSlot] = useState(null);
  useEffect(() => {
    const el = document.getElementById('page-actions');
    if (el) setActionsSlot(el);
    return () => {
      // Clean up when navigating away so other pages don't inherit the button
      if (el) el.innerHTML = '';
    };
  }, []);

  return (
    <div className="space-y-5 pb-20">
      {/* Portal Publish button into top bar */}
      {actionsSlot && createPortal(
        <Button
          variant="primary"
          onClick={() => setIsPublishModalOpen(true)}
          className="bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400/30 shadow-lg shadow-indigo-500/20"
        >
          <Upload size={15} className="mr-1.5" />
          Publish
        </Button>,
        actionsSlot
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-slate-800/40 px-4 py-3 rounded-2xl backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by title or author..."
            className="w-full bg-black/20 border border-white/8 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter size={14} className="text-slate-500 min-w-[14px]" />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBooks.map((book) => (
          <div
            key={book._id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedBook(book)}
            style={{ perspective: '1000px' }}
          >
            {/* Glow ring on hover */}
            <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/20 blur-sm" />

            <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-xl shadow-lg group-hover:shadow-indigo-500/10 group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-400 ease-out">

              {/* Cover Image */}
              <div className="aspect-[3/4] w-full overflow-hidden relative">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title || 'Book Cover'}
                    className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-800 to-slate-900">
                    <span className="text-3xl font-light tracking-widest text-white/15 select-none">CB</span>
                  </div>
                )}

                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent" />

                {/* Floating badges */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide text-slate-200/90 bg-slate-900/70 backdrop-blur-md border border-white/10 truncate max-w-[70%]">
                    {book.category || 'General'}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold px-2 py-0.5 bg-slate-900/70 backdrop-blur-md rounded-full border border-amber-400/20 whitespace-nowrap">
                    <Star size={9} fill="currentColor" />
                    <span>{book.rating || 'New'}</span>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="px-3 pt-2.5 pb-3 space-y-2">
                <div>
                  <h3 className="font-semibold text-sm text-white leading-snug line-clamp-1 tracking-tight">
                    {book.title || 'Untitled Book'}
                  </h3>
                  <p className="text-[11px] text-slate-400/80 mt-0.5 line-clamp-1">
                    {book.author || 'Unknown Author'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-indigo-400 tracking-tight leading-none">
                    ${book.price || '0.00'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(book._id);
                    }}
                    className="flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/30 transition-all duration-200 active:scale-95 shadow-md shadow-indigo-500/20"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
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
        size="lg"
      >
        <UploadBook onUpload={handlePublish} showPrice={true} />
      </Modal>

      {/* Book Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedBook(null)}
            title="Book Details"
            size="lg"
          >
            <div className="flex flex-col sm:flex-row gap-6 items-stretch">

              {/* Cover Column */}
              <div className="w-full sm:w-44 flex-shrink-0 mx-auto sm:mx-0">
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 aspect-[3/4] w-full sm:w-44">
                  {selectedBook.coverUrl ? (
                    <img
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-800 to-slate-900 gap-2">
                      <span className="text-4xl font-light tracking-widest text-white/15 select-none">CB</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">No Cover</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Column */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Title & Author */}
                <div>
                  <h2 className="text-xl font-bold text-white leading-snug tracking-tight">
                    {selectedBook.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">by {selectedBook.author}</p>
                </div>

                {/* Category & Rating badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-semibold text-slate-300 border border-white/10 whitespace-nowrap">
                    {selectedBook.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20 whitespace-nowrap">
                    <Star size={11} fill="currentColor" />
                    <span>{selectedBook.rating || 'New Release'}</span>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-white/8 flex-1">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Synopsis</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedBook.description || 'Discover this incredible literary work now available on CloudBook. Join thousands of readers diving into this story today.'}
                  </p>
                </div>

                {/* Price + Buy button — fully separated, no overlap */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider">Price</span>
                    <span className="text-2xl font-bold text-indigo-400 leading-none">
                      ${selectedBook.price || '0.00'}
                    </span>
                  </div>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 font-semibold rounded-xl shadow-lg shadow-indigo-500/30 border border-indigo-400/30 flex-shrink-0"
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
