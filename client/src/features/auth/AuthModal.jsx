import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Mock form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onClose(); // Close modal on success (mock)
            navigate('/dashboard');
        }, 1500);
    };

    const toggleMode = () => setIsLogin(!isLogin);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-sm">
                    {isLogin
                        ? 'Enter your credentials to access your library'
                        : 'Join CloudBook and start your collection today'}
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.form
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                <Input placeholder="John Doe" className="pl-10" required />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input type="email" placeholder="name@example.com" className="pl-10" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input type="password" placeholder="••••••••" className="pl-10" required />
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </motion.form>
            </AnimatePresence>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </Modal>
    );
}
