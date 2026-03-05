import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Trash2, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function BookCard({ book, onDelete, onRead }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => book.pdfUrl && onRead && onRead(book)} // open reader if pdf exists
            className={`group relative w-full aspect-[2/3] perspective-1000 ${book.pdfUrl ? 'cursor-pointer' : ''}`}
        >
            <Card className="w-full h-full overflow-hidden transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                {/* Cover Image */}
                <div className="w-full h-full relative">
                    {book.coverUrl ? (
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
                            <BookOpen size={48} className="mb-2 opacity-50" />
                            <span className="text-xs font-medium px-4 text-center">{book.title}</span>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Content (Title/Author) */}
                    <div className="absolute bottom-0 left-0 w-full p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
                            {book.title}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1 mb-3 line-clamp-1">
                            {book.author || "Unknown Author"}
                        </p>
                    </div>
                </div>

                {/* Actions Overlay */}
                <div className={`absolute top-2 right-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(book.id);
                        }}
                        className="rounded-full w-8 h-8 p-0 shadow-lg"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
