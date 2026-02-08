import React from 'react';
import { BookCard } from './BookCard';
import { motion, AnimatePresence } from 'framer-motion';

export function BookGrid({ books, onDelete }) {
    if (!books?.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                <p className="text-gray-400 text-lg">No books in your library yet.</p>
                <p className="text-gray-600 text-sm mt-1">Upload one to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
            <AnimatePresence>
                {books.map((book) => (
                    <BookCard key={book.id} book={book} onDelete={onDelete} />
                ))}
            </AnimatePresence>
        </div>
    );
}
