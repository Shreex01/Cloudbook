import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BookGrid } from '../features/books/BookGrid';
import { UploadBook } from '../features/books/UploadBook';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CATEGORIES = ['All', 'General', 'Science', 'Productivity', 'Programming', 'Business', 'Self-Help', 'Fiction', 'History', 'Mathematics', 'Other'];

export function Dashboard() {
    const [books, setBooks] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const fetchBooks = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (selectedCategory !== 'All') params.set('category', selectedCategory);


            const res = await axios.get(`/api/books/my-library/${userId}?${params}`);
            const mappedBooks = res.data.map(book => ({
                ...book,
                id: book._id,
                pdfUrl: book.fileUrl
            }));
            setBooks(mappedBooks);
        } catch (err) {
            console.error("Failed to fetch books", err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, searchQuery, selectedCategory]);

    useEffect(() => {
        if (!userId) { navigate('/'); return; }
        // Debounce search 400ms
        const t = setTimeout(fetchBooks, 400);
        return () => clearTimeout(t);
    }, [userId, navigate, fetchBooks]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/books/${id}`);
            setBooks((prev) => prev.filter((book) => book.id !== id));
        } catch (err) {
            console.error("Failed to delete book", err);
        }
    };

    const handleRead = (book) => navigate('/read', { state: { book } });

    const handleUpload = async (data) => {
        const tempCoverUrl = data.coverFile ? URL.createObjectURL(data.coverFile) : '';
        const tempPdfUrl = data.file ? URL.createObjectURL(data.file) : '';
        const tempBook = {
            id: Date.now(),
            title: data.title || data.file.name.replace('.pdf', ''),
            author: data.author || 'Unknown',
            category: data.category || 'General',
            coverUrl: tempCoverUrl,
            pdfUrl: tempPdfUrl
        };

        setBooks(prev => [...prev, tempBook]);
        setIsUploadOpen(false);

        const formData = new FormData();
        formData.append('title', tempBook.title);
        formData.append('author', tempBook.author);
        formData.append('description', data.description || '');
        formData.append('category', data.category || 'General');
        formData.append('tags', data.tags || '');
        formData.append('ownerId', userId);
        formData.append('isMarketplace', 'false');
        formData.append('price', '0');
        if (data.file) formData.append('bookFile', data.file);
        if (data.coverFile) formData.append('coverFile', data.coverFile);

        try {
            const res = await axios.post('/api/books/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setBooks(prev => prev.map(b => b.id === tempBook.id ? {
                ...res.data.book,
                id: res.data.book._id,
                pdfUrl: res.data.book.fileUrl
            } : b));
        } catch (err) {
            console.error("Upload failed", err);
            setBooks(prev => prev.filter(b => b.id !== tempBook.id));
            alert("Upload failed. Please try again.");
        }
    };

    // Portal the Add Book button into the layout top bar
    const [actionsSlot, setActionsSlot] = useState(null);
    useEffect(() => {
        const el = document.getElementById('page-actions');
        if (el) setActionsSlot(el);
        return () => { if (el) el.innerHTML = ''; };
    }, []);

    return (
        <div className="space-y-6">
            {actionsSlot && createPortal(
                <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400/30 shadow-lg shadow-indigo-500/20">
                    <Plus size={15} className="mr-1.5" /> Add Book
                </Button>,
                actionsSlot
            )}

            {/* Search + Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-slate-800/40 px-4 py-3 rounded-2xl backdrop-blur-md">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search your library..."
                        className="w-full bg-black/20 border border-white/8 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <Filter size={14} className="text-slate-500 min-w-[14px]" />
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Book Grid */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <Search size={48} className="mb-4 opacity-20" />
                    {searchQuery || selectedCategory !== 'All'
                        ? <p className="text-xl">No books match your search.</p>
                        : <p className="text-xl">Your library is empty. Upload your first book!</p>
                    }
                </div>
            ) : (
                <BookGrid books={books} onDelete={handleDelete} onRead={handleRead} />
            )}

            <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload New Book" size="lg">
                <UploadBook onUpload={handleUpload} />
            </Modal>
        </div>
    );
}
