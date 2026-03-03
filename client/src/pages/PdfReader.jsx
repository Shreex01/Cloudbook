import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PdfReader() {
    const location = useLocation();
    const navigate = useNavigate();
    const book = location.state?.book;

    if (!book || !book.pdfUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
                <p className="text-xl mb-4">No book data found.</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden absolute inset-0 z-50">
            {/* Header / Nav */}
            <div className="flex items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mr-4 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" /> Back
                </Button>
                <div>
                    <h1 className="text-lg font-bold">{book.title}</h1>
                    <p className="text-sm text-gray-400">{book.author}</p>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 w-full relative bg-slate-900">
                <object
                    data={book.pdfUrl}
                    type="application/pdf"
                    className="w-full h-full absolute inset-0"
                >
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Your browser doesn't support PDF viewing. <a href={book.pdfUrl} download className="text-blue-400 hover:underline">Download it here</a>.</p>
                    </div>
                </object>
            </div>
        </div>
    );
}
