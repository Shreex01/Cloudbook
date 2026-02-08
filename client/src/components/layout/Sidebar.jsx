import React from 'react';
import { Home, LayoutGrid, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            active
                ? "bg-blue-600/20 text-blue-400 font-medium"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
        )}
    >
        <Icon size={20} className={cn("transition-colors", active ? "text-blue-400" : "group-hover:text-white")} />
        <span>{label}</span>
        {active && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        )}
    </Link>
);

export function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col z-40">
            {/* Brand */}
            <div className="p-6 border-b border-white/5">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    CloudBook
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavItem icon={Home} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} />
                <NavItem icon={LayoutGrid} label="My Books" to="/books" active={isActive('/books')} />
                <NavItem icon={Settings} label="Settings" to="/settings" active={isActive('/settings')} />
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-white/5 bg-black/10">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">John Doe</p>
                        <p className="text-xs text-gray-500 truncate">Pro Account</p>
                    </div>
                    <button className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
