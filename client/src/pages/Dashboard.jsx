import React, { useState } from 'react';
import { BookGrid } from '../features/books/BookGrid';
import { UploadBook } from '../features/books/UploadBook';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

// Mock Data
const INITIAL_BOOKS = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800' },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800' },
    { id: 3, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', coverUrl: '' }, // No cover test
];

export function Dashboard() {
    const [books, setBooks] = useState(INITIAL_BOOKS);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleDelete = (id) => {
        setBooks((prev) => prev.filter((book) => book.id !== id));
    };

    const handleUpload = (file) => {
        // Mock upload - in real app, send to server
        const newBook = {
            id: Date.now(),
            title: file.name.replace('.pdf', ''),
            author: 'Unknown',
            coverUrl: '' // No cover for uploaded PDF for now
        };
        setBooks([...books, newBook]);
        setIsUploadOpen(false);
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

            <BookGrid books={books} onDelete={handleDelete} />

            <Modal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                title="Upload New Book"
            >
                <UploadBook onUpload={handleUpload} />
            </Modal>
        </div>
    );
}
