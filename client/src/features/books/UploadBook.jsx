import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils'; // Keep this import!

export function UploadBook({ onUpload }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

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
        } // Else show error toast (omitted for brevity)
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleUpload = () => {
        if (file) {
            onUpload(file);
            setFile(null);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group",
                            isDragOver
                                ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                                : "border-white/10 hover:border-white/20 hover:bg-white/5 bg-white/5"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="z-10 flex flex-col items-center">
                            <div className={cn(
                                "p-4 rounded-full mb-3 transition-colors duration-300",
                                isDragOver ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10"
                            )}>
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                Click to upload or drag & drop PDF
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Maximum file size 10MB</p>
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

                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleUpload} className="bg-green-600/80 hover:bg-green-600 text-white border-green-400/30">
                                Upload
                            </Button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
