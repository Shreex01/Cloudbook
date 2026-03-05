import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Lock, FileText, Save, BookOpen, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';

export function Profile() {
    const userId = localStorage.getItem('userId');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

    const [form, setForm] = useState({
        username: '',
        email: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setUser(res.data);
                setForm(f => ({ ...f, username: res.data.username, email: res.data.email, bio: res.data.bio || '' }));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) fetchUser();
    }, [userId]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            showToast('error', 'New passwords do not match.');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                username: form.username,
                email: form.email,
                bio: form.bio,
            };
            if (form.newPassword) payload.password = form.newPassword;

            const res = await axios.put(`http://localhost:5000/api/users/${userId}`, payload);
            setUser(res.data);
            setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
            showToast('success', 'Profile updated successfully!');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Update failed.');
        } finally {
            setIsSaving(false);
        }
    };

    // Portal Save button to top bar
    const [actionsSlot, setActionsSlot] = useState(null);
    useEffect(() => {
        const el = document.getElementById('page-actions');
        if (el) setActionsSlot(el);
        return () => { if (el) el.innerHTML = ''; };
    }, []);

    if (isLoading) return (
        <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
        </div>
    );

    const initials = user?.username?.substring(0, 2).toUpperCase() || 'U';
    const stats = [
        { icon: BookOpen, label: 'Books Purchased', value: user?.purchasedBooks?.length ?? 0 },
        { icon: ShoppingBag, label: 'Library Size', value: (user?.purchasedBooks?.length ?? 0) },
    ];

    return (
        <div className="space-y-6 max-w-2xl">
            {actionsSlot && createPortal(
                <Button onClick={handleSave} isLoading={isSaving} className="bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400/30 shadow-lg shadow-indigo-500/20">
                    <Save size={15} className="mr-1.5" /> Save Changes
                </Button>,
                actionsSlot
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${toast.type === 'success'
                        ? 'bg-green-900/80 border-green-500/30 text-green-200'
                        : 'bg-red-900/80 border-red-500/30 text-red-200'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Avatar & Stats */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-800/40 rounded-2xl p-6 backdrop-blur-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    {initials}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                    {user?.bio && <p className="text-sm text-slate-300 mt-2">{user.bio}</p>}
                    <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                        {stats.map(s => (
                            <div key={s.label} className="text-center">
                                <s.icon size={16} className="text-indigo-400 mx-auto mb-1" />
                                <p className="text-lg font-bold text-white">{s.value}</p>
                                <p className="text-xs text-slate-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="bg-slate-800/40 rounded-2xl p-6 backdrop-blur-md space-y-5">
                <h3 className="text-base font-semibold text-white">Edit Profile</h3>

                {/* Username */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5">
                        <User size={13} /> Username
                    </label>
                    <input
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5">
                        <Mail size={13} /> Email
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5">
                        <FileText size={13} /> Bio
                    </label>
                    <textarea
                        value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                        rows={2}
                        placeholder="Tell us a little about yourself..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none placeholder:text-slate-600"
                    />
                </div>

                {/* Password Change */}
                <div className="pt-4 border-t border-white/8">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                        <Lock size={13} /> Change Password
                    </h4>
                    <div className="space-y-3">
                        <input
                            type="password"
                            placeholder="New password"
                            value={form.newPassword}
                            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={form.confirmPassword}
                            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
