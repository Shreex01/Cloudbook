import React, { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, Image as ImageIcon, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const CATEGORIES = ['General', 'Science', 'Productivity', 'Programming', 'Business', 'Self-Help', 'Fiction', 'History', 'Mathematics', 'Other'];

export function UploadBook({ onUpload, showPrice = false }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        category: 'General',
        tags: '',
        price: ''
    });

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
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
        if (selectedImage && selectedImage.type.startsWith('image/')) setCoverFile(selectedImage);
    };

    const handleUpload = () => {
        if (!file) { alert("Please upload a PDF file."); return; }
        if (!formData.title.trim() || !formData.author.trim()) {
            alert("Please provide at least a Title and an Author.");
            return;
        }
        onUpload({ file, coverFile, ...formData });
        setFile(null);
        setCoverFile(null);
        setFormData({ title: '', author: '', description: '', category: 'General', tags: '', price: '' });
    };

    const field = (label, key, placeholder, required = false) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type="text"
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-sm"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Form Fields */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                {field('Title', 'title', 'Enter book title', true)}
                {field('Author', 'author', 'Enter author name', true)}

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-600 text-sm"
                        placeholder="Brief synopsis or overview..."
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                        <Tag size={12} /> Tags <span className="text-slate-600 text-xs font-normal">(comma-separated)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-sm"
                        placeholder="e.g. physics, quantum, beginner"
                    />
                </div>

                {/* Price — only shown for marketplace publish */}
                {showPrice && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Price (USD) <span className="text-red-400">*</span></label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-sm"
                            placeholder="0.00"
                        />
                    </div>
                )}

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image</label>
                    {coverFile ? (
                        <div className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg">
                            <ImageIcon size={18} className="text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-white truncate flex-1">{coverFile.name}</span>
                            <button onClick={() => setCoverFile(null)} className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => coverInputRef.current?.click()}
                            className="w-full bg-black/50 border border-white/10 border-dashed rounded-lg px-4 py-2.5 text-gray-400 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2 group"
                        >
                            <ImageIcon size={16} className="group-hover:text-purple-400 transition-colors" />
                            <span className="text-sm group-hover:text-white transition-colors">Click to upload cover image</span>
                        </div>
                    )}
                    <input type="file" ref={coverInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                </div>
            </div>

            {/* PDF Dropzone */}
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
                            "flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group",
                            isDragOver ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-white/10 hover:border-white/20 hover:bg-white/5 bg-white/5"
                        )}
                    >
                        <div className={cn("p-2.5 rounded-full mb-1.5 transition-colors", isDragOver ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10")}>
                            <UploadCloud size={22} />
                        </div>
                        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Drop PDF here or <span className="text-indigo-400">click to upload</span> <span className="text-red-400">*</span>
                        </p>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf" className="hidden" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="file-preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                            <File size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => { setFile(null); setCoverFile(null); setFormData({ title: '', author: '', description: '', category: 'General', tags: '', price: '' }); }}>
                    Clear
                </Button>
                <Button onClick={handleUpload} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    Upload Book
                </Button>
            </div>
        </div>
    );
}
