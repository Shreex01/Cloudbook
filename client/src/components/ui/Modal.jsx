import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 py-6 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`relative w-full ${sizeClasses[size] || sizeClasses.md} flex flex-col max-h-[90vh] rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl my-auto`}
                        >
                            {/* Sticky Header */}
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 flex-shrink-0">
                                <h2 className="text-xl font-semibold text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export { Modal };
