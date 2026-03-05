import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Google "G" SVG logo
function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
        </svg>
    );
}

export function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const handleAuthSuccess = (token, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        window.dispatchEvent(new Event('storage'));
        onClose();
        navigate('/dashboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (isLogin) {
                const res = await axios.post('/api/auth/login', { email, password });
                handleAuthSuccess(res.data.token, res.data.user._id);
            } else {
                await axios.post('/api/auth/register', { username, email, password });
                const loginRes = await axios.post('/api/auth/login', { email, password });
                handleAuthSuccess(loginRes.data.token, loginRes.data.user._id);
            }
            setEmail(''); setPassword(''); setUsername('');
        } catch (err) {
            console.error('Auth error', err);
            setErrorMsg(err.response?.data || 'An error occurred during authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    // Google sign-in — uses implicit flow to get the credential token
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            setErrorMsg('');
            try {
                // Get user info from Google using the access token
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });

                // Send to our backend to verify + create/find user
                const res = await axios.post('/api/auth/google-token', {
                    email: userInfo.data.email,
                    name: userInfo.data.name,
                    googleId: userInfo.data.sub,
                    picture: userInfo.data.picture,
                });
                handleAuthSuccess(res.data.token, res.data.user._id);
            } catch (err) {
                console.error('Google login error', err);
                setErrorMsg('Google sign-in failed. Please try again.');
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: () => {
            setErrorMsg('Google sign-in was cancelled or failed.');
        },
    });

    const toggleMode = () => { setIsLogin(!isLogin); setErrorMsg(''); };

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
                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Google Sign-In Button */}
            <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 text-white text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mb-5"
            >
                {isGoogleLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                    <GoogleLogo />
                )}
                {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-white/10" />
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
                                <Input
                                    placeholder="John Doe"
                                    className="pl-10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </motion.form>
            </AnimatePresence>

            <div className="mt-5 text-center">
                <p className="text-sm text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </Modal>
    );
}
