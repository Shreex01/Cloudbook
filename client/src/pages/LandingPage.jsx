import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../features/auth/AuthModal';

export function LandingPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white">
            {/* Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[100px]" />
            </div>

            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <BookOpen size={24} className="text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">CloudBook</span>
                </div>
                <button
                    onClick={() => setIsAuthOpen(true)}
                    className="rounded-full border border-white/20 px-6 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:text-blue-200"
                >
                    Log in
                </button>
            </nav>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 px-6 text-center max-w-3xl mx-auto"
            >
                <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span className="text-xs font-medium text-gray-300">The Future of Digital Libraries</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent drop-shadow-sm">
                    A cloud Library. <br />
                    <span className="text-blue-400">Reimagined.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Store, organize, and access your collection from anywhere.
                    Experience a beautifully crafted interface designed for book lovers.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => setIsAuthOpen(true)}
                        className="group relative overflow-hidden rounded-full border border-blue-500/50 px-8 py-3 font-medium text-white transition-all duration-300 hover:border-transparent"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started Free
                        </span>
                    </button>
                </motion.div>

                {/* Features Grid */}
                <motion.div variants={itemVariants} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        { icon: Shield, title: "Secure Storage", desc: "Your books are encrypted and stored safely in the cloud." },
                        { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed with instant search and retrieval." },
                        { icon: Sparkles, title: "Beautiful UI", desc: "A distracting-free, glassmorphic interface you'll love." }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <feature.icon className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </motion.main>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
}
