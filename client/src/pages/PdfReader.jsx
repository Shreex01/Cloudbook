import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Moon, Sun, Loader2, ZoomIn, ZoomOut, BookmarkCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactLenis } from 'lenis/react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0); // Manage Zoom State
    const [isNightMode, setIsNightMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch initial progress
    useEffect(() => {
        const fetchProgress = async () => {
            if (!book || !userId) return;
            try {
                const res = await axios.get(`/api/users/${userId}/progress/${book._id}`);
                if (res.data) {
                    const savedPg = typeof res.data === 'object' ? res.data.currentPage || res.data.page : res.data;
                    if (savedPg > 1) {
                        setSavedPage(savedPg);
                        setShowResumeBanner(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch reading progress", err);
            }
        };
        fetchProgress();
    }, [book, userId]);

    // Save progress helper
    const saveProgress = async (page) => {
        if (!book?._id || !userId) return;
        try {
            await axios.put(
                `/api/users/${userId}/progress/${book._id}`,
                { currentPage: page }
            );
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    };

    // 2. Debounce and save progress when pageNumber changes
    useEffect(() => {
        if (!book || !userId || !numPages) return;
        const timer = setTimeout(() => {
            saveProgress(pageNumber);
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [pageNumber, book, userId, numPages]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => {
            const newPage = prevPageNumber + offset;
            if (numPages && newPage > numPages) return numPages;
            if (newPage < 1) return 1;
            return newPage;
        });
    };

    // 3. Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                changePage(1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                changePage(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [numPages, changePage]);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    const toggleNightMode = () => setIsNightMode(prev => !prev);

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
        <div className={`flex flex-col h-screen w-full overflow-hidden absolute inset-0 z-50 transition-colors duration-300 ${isNightMode ? 'bg-[#1a1b26]' : 'bg-slate-100'}`}>
            {/* Header / Nav */}
            <div className={`flex items-center p-4 border-b flex-shrink-0 transition-colors duration-300 ${isNightMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className={`mr-4 transition-colors ${isNightMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                    <ChevronLeft size={20} className="mr-1" /> Back
                </Button>
                <div className="flex-1 truncate">
                    <h1 className="text-lg font-bold truncate">{book.title}</h1>
                    <p className={`text-sm truncate ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                </div>

                <div className="flex items-center gap-4 ml-4">
                    <button
                        onClick={toggleNightMode}
                        className={`p-2 rounded-full transition-colors ${isNightMode ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        title={isNightMode ? "Switch to Day Mode" : "Switch to Night Mode"}
                    >
                        {isNightMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                {/* Save Progress Button */}
                <button
                    onClick={() => saveProgress(pageNumber)} // Save current page number
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
                            onClick={() => {
                                setPageNumber(savedPage);
                                setShowResumeBanner(false);
                            }}
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

            {/* PDF Viewer Area with Lenis Smooth Scrolling Context */}
            <ReactLenis
                className="flex-1 w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center py-8 px-4"
                options={{ smoothTouch: true }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                        <Loader2 size={32} className={`animate-spin ${isNightMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={isNightMode ? 'text-gray-400' : 'text-gray-600'}>Loading document...</p>
                    </div>
                )}

                {/* PDF Container with Night Mode CSS Filters */}
                <div className={`shadow-2xl transition-all duration-300 ${isNightMode ? 'pdf-night-mode' : ''}`}>
                    <Document
                        file={book.pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={null} // We handle loading state custom above
                        className="flex flex-col items-center"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="bg-white max-w-full"
                            width={Math.min(window.innerWidth * 0.9, 800)} // Responsive base width before scaling
                        />
                    </Document>
                </div>

                {/* Inline Styles for Night Mode Inversion.
                    We invert the colors, then hue-rotate 180deg to fix the colors of images/links back to normal.
                    Brightness adjustments make the white background a pleasant dark gray automatically! */}
                <style>{`
                    /* Prevent white flash during page load before canvas filter applies */
                    .pdf-night-mode .react-pdf__Page {
                        background-color: #1a1b26 !important;
                    }
                    .pdf-night-mode .react-pdf__Page__canvas {
                        filter: invert(1) hue-rotate(180deg) brightness(85%) contrast(85%);
                    }
                    /* Ensure text layer doesn't flash white on select */
                    .pdf-night-mode .react-pdf__Page__textContent {
                        opacity: 0.5;
                    }
                `}</style>
            </ReactLenis>

            {/* Floating Navigation & Zoom Controls Container */}
            {numPages && (
                <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[350px] flex items-center justify-between px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-300 border z-50 ${isNightMode
                    ? 'bg-slate-900/60 border-slate-700/50 text-gray-100 shadow-slate-900/50'
                    : 'bg-white/70 border-white/40 text-gray-900'
                    }`}>

                    {/* Pagination Context */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-white/50'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <span className="font-medium text-sm w-20 text-center select-none">
                            {pageNumber} / {numPages}
                        </span>

                        <button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= numPages}
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-white/50'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className={`w-[1px] h-6 mx-2 ${isNightMode ? 'bg-slate-600/50' : 'bg-gray-300/50'}`}></div>

                    {/* Zoom Context */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            disabled={scale <= 0.5}
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-white/50'}`}
                            title="Zoom Out"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="font-medium text-xs w-10 text-center select-none">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={scale >= 3.0}
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${isNightMode ? 'hover:bg-white/10' : 'hover:bg-white/50'}`}
                            title="Zoom In"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}

export default PdfReader;
