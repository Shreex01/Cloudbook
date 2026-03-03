import React, { useState } from 'react';
import { BookGrid } from '../features/books/BookGrid';
import { UploadBook } from '../features/books/UploadBook';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Dashboard() {
    const [books, setBooks] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    React.useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get(`/api/books/my-library/${userId}`);
                // Map _id to id to fit the existing BookCard prop format
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
        };

        if (userId) {
            fetchBooks();
        } else {
            navigate('/');
        }
    }, [userId, navigate]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/books/${id}`);
            setBooks((prev) => prev.filter((book) => book.id !== id));
        } catch (err) {
            console.error("Failed to delete book", err);
        }
    };

    const handleRead = (book) => {
        navigate('/read', { state: { book } });
    };

    const handleUpload = async (data) => {
        // Generating a local Object URL for instant UI response before cloud clears
        const tempCoverUrl = data.coverFile ? URL.createObjectURL(data.coverFile) : '';
        const tempPdfUrl = data.file ? URL.createObjectURL(data.file) : '';

        const tempBook = {
            id: Date.now(), // temporary id
            title: data.title || data.file.name.replace('.pdf', ''),
            author: data.author || 'Unknown',
            coverUrl: tempCoverUrl,
            pdfUrl: tempPdfUrl
        };

        // Optimistic UI update
        setBooks([...books, tempBook]);
        setIsUploadOpen(false);

        // Actual Cloud Upload
        const formData = new FormData();
        formData.append('title', tempBook.title);
        formData.append('author', tempBook.author);
        formData.append('ownerId', userId);
        formData.append('isMarketplace', 'false');

        if (data.file) formData.append('bookFile', data.file);
        if (data.coverFile) formData.append('coverFile', data.coverFile);

        try {
            const res = await axios.post('/api/books/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Replace optimistic book with real db book
            setBooks(prev => prev.map(b => b.id === tempBook.id ? {
                ...res.data,
                id: res.data._id,
                pdfUrl: res.data.fileUrl
            } : b));
        } catch (err) {
            console.error("Upload failed", err);
            // Revert optimistic update on failure
            setBooks(prev => prev.filter(b => b.id !== tempBook.id));
            alert("Upload failed. Please try again.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Library</h1>
                    <p className="text-gray-400 mt-1">Manage and organize your collection</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="mr-2 h-5 w-5" /> Add Book
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin" />
                </div>
            ) : (
                <BookGrid books={books} onDelete={handleDelete} onRead={handleRead} />
            )}

            <Modal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                title="Upload New Book"
            >
                <UploadBook onUpload={handleUpload} />
            </Modal>
        </div >
    );
}
