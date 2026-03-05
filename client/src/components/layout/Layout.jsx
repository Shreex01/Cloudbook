import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', sub: 'Welcome back to your library' },
    '/marketplace': { title: 'Marketplace', sub: 'Discover and publish your next favorite book' },
    '/subscription': { title: 'Subscription', sub: 'Manage your plan' },
    '/profile': { title: 'Profile', sub: 'Manage your account and settings' },
};

export function Layout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const page = PAGE_TITLES[location.pathname] || { title: '', sub: '' };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            {/* Background gradients/blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex">
                <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

                {/* Right side: fixed top bar + scrollable content */}
                <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>

                    {/* Top bar — same height as sidebar brand bar (h-[85px]) */}
                    <div className="fixed top-0 right-0 z-30 flex items-center bg-slate-950/80 backdrop-blur-xl h-[85px] px-8"
                        style={{ left: isSidebarCollapsed ? '5rem' : '16rem', transition: 'left 300ms' }}
                    >
                        <div className="flex-1 min-w-0">
                            {page.title && (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-1">{page.title}</h1>
                                    {page.sub && <p className="text-gray-400">{page.sub}</p>}
                                </>
                            )}
                        </div>
                        {/* Slot for page-level action buttons (portaled in by child pages) */}
                        <div id="page-actions" className="flex items-center gap-3 flex-shrink-0" />
                    </div>

                    {/* Scrollable content — padded below the fixed top bar */}
                    <main className="flex-1 pt-[85px]">
                        <div className="p-6 max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
