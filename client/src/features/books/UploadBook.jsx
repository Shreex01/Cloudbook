import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

export function UploadBook({ onUpload }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [formData, setFormData] = useState({ title: '', author: '' });

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            if (!formData.title) setFormData(prev => ({ ...prev, title: droppedFile.name.replace('.pdf', '') }));
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!formData.title) setFormData(prev => ({ ...prev, title: selectedFile.name.replace('.pdf', '') }));
        }
    };

    const handleCoverSelect = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage && selectedImage.type.startsWith('image/')) {
            setCoverFile(selectedImage);
        }
    };

    const handleUpload = () => {
        if (!file) {
            alert("Please upload a PDF file.");
            return;
        }
        if (!formData.title.trim() || !formData.author.trim()) {
            alert("Please provide at least a Title and an Author.");
            return;
        }

        // We pass the actual File object for the cover if it exists.
        // It's up to the parent/server to handle the FormData mapping.
        onUpload({ file, coverFile, ...formData });
        setFile(null);
        setCoverFile(null);
        setFormData({ title: '', author: '' });
    };

    const resetForm = (e) => {
        if (e) e.stopPropagation();
        setFile(null);
        setCoverFile(null);
        setFormData({ title: '', author: '' });
    };

    return (
        <div className="w-full flex flex-col gap-5">
            {/* Form Fields Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter book title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Author <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter author name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image (Optional)</label>
                    {coverFile ? (
                        <div className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg">
                            <ImageIcon size={20} className="text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-white truncate flex-1">{coverFile.name}</span>
                            <button
                                onClick={() => setCoverFile(null)}
                                className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => coverInputRef.current?.click()}
                            className="w-full bg-black/50 border border-white/10 border-dashed rounded-lg px-4 py-3 text-gray-400 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            <ImageIcon size={18} className="group-hover:text-purple-400 transition-colors" />
                            <span className="text-sm font-medium group-hover:text-white transition-colors">Click to upload cover image</span>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverSelect}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>

            {/* File Dropzone / Preview Section */}
            <div className="w-full">
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="dropzone"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group",
                                isDragOver
                                    ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                                    : "border-white/10 hover:border-white/20 hover:bg-white/5 bg-white/5"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="z-10 flex flex-col items-center">
                                <div className={cn(
                                    "p-3 rounded-full mb-2 transition-colors duration-300",
                                    isDragOver ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10"
                                )}>
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    Click to upload or drag & drop PDF <span className="text-red-400">*</span>
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="application/pdf"
                                className="hidden"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
                        >
                            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                                <File size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-2">
                <Button variant="ghost" onClick={resetForm}>
                    Clear
                </Button>
                <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-500 text-white">
                    Upload Book
                </Button>
            </div>
        </div>
    );
}
