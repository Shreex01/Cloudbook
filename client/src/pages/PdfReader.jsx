import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, BookmarkCheck, Maximize2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';

export function PdfReader() {
    const location = useLocation();
    const navigate = useNavigate();
    const book = location.state?.book;
    const userId = localStorage.getItem('userId');

    const iframeRef = useRef(null);
    const [savedPage, setSavedPage] = useState(null);
    const [showResumeBanner, setShowResumeBanner] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const saveTimerRef = useRef(null);

    // Load saved progress on mount
    useEffect(() => {
        if (!book?._id || !userId) return;

        const fetchProgress = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/users/${userId}/progress/${book._id}`
                );
                if (res.data && res.data.page > 1) {
                    setSavedPage(res.data.page);
                    setShowResumeBanner(true);
                }
            } catch (err) {
                console.error("Could not load reading progress", err);
            }
        };
        fetchProgress();
    }, [book?._id, userId]);

    // Save progress (debounced) when user interacts with iframe
    const saveProgress = async (page) => {
        if (!book?._id || !userId) return;
        try {
            await axios.put(
                `http://localhost:5000/api/users/${userId}/progress/${book._id}`,
                { page }
            );
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    };

    // Listen for page changes from iframe via postMessage (works with some PDF viewers)
    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data && typeof e.data.page === 'number') {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = setTimeout(() => saveProgress(e.data.page), 1500);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(saveTimerRef.current);
        };
    }, [book?._id, userId]);

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

    // Build PDF URL — if savedPage and user chose to resume, append page hash
    const pdfSrc = savedPage && showResumeBanner === false
        ? `${book.pdfUrl}#page=${savedPage}`
        : book.pdfUrl;

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden absolute inset-0 z-50">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-black/40 backdrop-blur-md flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-white/10 transition-colors flex-shrink-0">
                    <ChevronLeft size={18} className="mr-1" /> Back
                </Button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-base font-bold text-white leading-tight truncate">{book.title}</h1>
                    <p className="text-xs text-gray-400 truncate">{book.author}</p>
                </div>

                {/* Save Progress Button */}
                <button
                    onClick={() => saveProgress(1)}
                    title="Save reading position"
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                    <BookmarkCheck size={15} className={isSaved ? 'text-indigo-400' : ''} />
                    {isSaved ? 'Saved!' : 'Save Progress'}
                </button>
            </div>

            {/* Resume Banner */}
            {showResumeBanner && savedPage && (
                <div className="flex items-center justify-between gap-4 px-6 py-2.5 bg-indigo-600/20 border-b border-indigo-500/30 text-sm text-indigo-200 flex-shrink-0">
                    <span>📖 You left off at <strong>page {savedPage}</strong>. Resume where you stopped?</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowResumeBanner(false)}
                            className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                        >
                            Resume (p.{savedPage})
                        </button>
                        <button
                            onClick={() => { setSavedPage(null); setShowResumeBanner(false); }}
                            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                        >
                            Start from beginning
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Viewer */}
            <div className="flex-1 w-full relative bg-slate-900">
                <iframe
                    ref={iframeRef}
                    src={pdfSrc}
                    title={book.title}
                    className="w-full h-full absolute inset-0 border-none"
                >
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <p>Your browser can't display this PDF inline.</p>
                        <a href={book.pdfUrl} download className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
                            Download PDF
                        </a>
                    </div>
                </iframe>
            </div>
        </div>
    );
}
