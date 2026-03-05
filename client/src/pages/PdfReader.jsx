import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Moon, Sun, Loader2, ZoomIn, ZoomOut, Download, SunDim } from 'lucide-react';
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

    const [savedPage, setSavedPage] = useState(null);
    const [showResumeBanner, setShowResumeBanner] = useState(false);
    const scrollRafRef = useRef(null);

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0); // Manage Zoom State
    const [theme, setTheme] = useState('day'); // 'day', 'night', 'reading'
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Fetch user details for subscription checks
    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                try {
                    const res = await axios.get(`/api/users/${userId}`);
                    setUser(res.data);
                } catch (err) {
                    console.error("Failed to fetch user data", err);
                }
            }
        };
        fetchUser();
    }, [userId]);

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
    const saveProgress = React.useCallback(async (page) => {
        if (!book?._id || !userId) return;
        try {
            await axios.put(
                `/api/users/${userId}/progress/${book._id}`,
                { currentPage: page }
            );
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    }, [book, userId]);

    // 2. Debounce and save progress when pageNumber changes
    useEffect(() => {
        if (!book || !userId || !numPages) return;
        const timer = setTimeout(() => {
            saveProgress(pageNumber);
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [pageNumber, book, userId, numPages, saveProgress]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const changePage = React.useCallback((offset) => {
        setPageNumber(prevPageNumber => {
            const newPage = prevPageNumber + offset;
            if (numPages && newPage > numPages) return numPages;
            if (newPage < 1) return 1;
            return newPage;
        });
    }, [numPages]);

    // Track visible pages by checking bounding boxes on scroll
    useEffect(() => {
        if (!numPages) return;

        const handleScroll = () => {
            if (scrollRafRef.current) return; // simple requestAnimationFrame throttle

            scrollRafRef.current = requestAnimationFrame(() => {
                const centerY = window.innerHeight / 2;
                let foundPage = pageNumber;

                for (let i = 1; i <= numPages; i++) {
                    const el = document.getElementById(`page_${i}`);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        // If the vertical center of the screen falls within this element's top and bottom
                        if (rect.top <= centerY && rect.bottom >= centerY) {
                            foundPage = i;
                            break;
                        }
                    }
                }

                if (foundPage !== pageNumber) {
                    setPageNumber(foundPage);
                }

                scrollRafRef.current = null;
            });
        };

        // ReactLenis scrolls the window itself when the parent isn't overflow-y-auto hijacking it
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
        };
    }, [numPages, pageNumber]);

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

    const toggleNightMode = () => {
        setTheme(prev => prev === 'night' ? 'day' : 'night');
    };

    const toggleReadingMode = () => {
        if (!hasProFeatures) {
            alert("Reading Mode is a Pro tier feature! Please upgrade.");
            return;
        }
        setTheme(prev => prev === 'reading' ? 'day' : 'reading');
    };

    const handleDownload = () => {
        if (!hasTeamFeatures) {
            alert("Downloading books is a Team tier feature! Please upgrade.");
            return;
        }
        window.open(book.pdfUrl, '_blank');
    };

    const hasProFeatures = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'team';
    const hasTeamFeatures = user?.subscriptionTier === 'team';

    if (!book || !book.pdfUrl) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen ${theme === 'night' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-gray-900'} p-8`}>
                <p className="text-xl mb-4">No book data found.</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        );
    }



    return (
        <div className={`flex flex-col h-screen w-full overflow-hidden absolute inset-0 z-50 transition-colors duration-300 ${theme === 'night' ? 'bg-[#1a1b26]' : 'bg-[#faf9f6]'}`}>

            {/* Reading Mode (Night Light) Overlay */}
            {theme === 'reading' && (
                <div className="fixed inset-0 pointer-events-none z-[9999] bg-orange-500/15 mix-blend-multiply transition-opacity duration-500" />
            )}

            {/* Header / Nav */}
            <div className={`flex items-center p-4 border-b flex-shrink-0 transition-colors duration-300 ${theme === 'night' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className={`mr-4 transition-colors ${theme === 'night' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                    <ChevronLeft size={20} className="mr-1" /> Back
                </Button>
                <div className="flex-1 truncate">
                    <h1 className="text-lg font-bold truncate">{book.title}</h1>
                    <p className={`text-sm truncate ${theme === 'night' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                    <button
                        onClick={toggleNightMode}
                        className={`p-2 rounded-full transition-colors ${theme === 'night' ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/70' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        title={theme === 'night' ? "Switch to Day Mode" : "Switch to Night Mode"}
                    >
                        {theme === 'night' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {hasProFeatures && (
                        <button
                            onClick={toggleReadingMode}
                            className={`p-2 rounded-full transition-colors ${theme === 'reading' ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            title="Toggle Reading Mode (Night Light)"
                        >
                            <SunDim size={20} />
                        </button>
                    )}

                    {hasTeamFeatures && (
                        <button
                            onClick={handleDownload}
                            className={`p-2 rounded-full transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200`}
                            title="Download Book PDF"
                        >
                            <Download size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Resume Banner */}
            {showResumeBanner && savedPage && (
                <div className="flex items-center justify-between gap-4 px-6 py-2.5 bg-indigo-600/20 border-b border-indigo-500/30 text-sm text-indigo-200 flex-shrink-0">
                    <span>📖 You left off at <strong>page {savedPage}</strong>. Resume where you stopped?</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                document.getElementById(`page_${savedPage}`)?.scrollIntoView({ behavior: 'smooth' });
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
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Viewer Area with Lenis Smooth Scrolling Context */}
            <ReactLenis
                className="flex-1 w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center bg-transparent py-8 px-4"
                options={{ smoothTouch: true }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                        <Loader2 size={32} className={`animate-spin ${theme === 'night' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={theme === 'night' ? 'text-gray-400' : 'text-gray-600'}>Loading document...</p>
                    </div>
                )}

                {/* PDF Container with Theme CSS Filters */}
                <div className={`shadow-2xl transition-all duration-300 ${theme === 'night' ? 'pdf-night-mode' : ''}`}>
                    <Document
                        file={book.pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={null} // We handle loading state custom above
                        className="flex flex-col items-center gap-8"
                    >
                        {Array.from(new Array(numPages || 0), (el, index) => (
                            <div key={`page_${index + 1}`} id={`page_${index + 1}`} data-page-number={index + 1}>
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="bg-white max-w-full shadow-lg border border-black/5"
                                    width={Math.min(window.innerWidth * 0.9, 800)} // Responsive base width before scaling
                                />
                            </div>
                        ))}
                    </Document>
                </div>

                <style>{`
                    /* Night Mode */
                    .pdf-night-mode .react-pdf__Page {
                        background-color: #1a1b26 !important;
                    }
                    .pdf-night-mode .react-pdf__Page__canvas {
                        filter: invert(1) hue-rotate(180deg) brightness(85%) contrast(85%);
                    }
                    .pdf-night-mode .react-pdf__Page__textContent {
                        opacity: 0.5;
                    }
                `}</style>
            </ReactLenis>

            {/* Floating Zoom Controls Container */}
            {numPages && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-between px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-300 border z-50 ${theme === 'night'
                    ? 'bg-slate-900/60 border-slate-700/50 text-gray-100 shadow-slate-900/50'
                    : 'bg-white/70 border-white/40 text-gray-900'
                    }`}>

                    {/* Zoom Context */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleZoomOut}
                            disabled={scale <= 0.5}
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${theme === 'night' ? 'hover:bg-white/10' : 'hover:bg-white/50'}`}
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
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${theme === 'night' ? 'hover:bg-white/10' : 'hover:bg-white/50'}`}
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
