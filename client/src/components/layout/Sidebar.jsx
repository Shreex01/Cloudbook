import React from 'react';
import { Home, ShoppingBag, CreditCard, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NavItem = ({ icon: Icon, label, to, active, isCollapsed }) => (
    <Link
        to={to}
        title={isCollapsed ? label : undefined}
        className={cn(
            "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
            isCollapsed ? "justify-center" : "gap-3",
            active
                ? "bg-blue-600/20 text-blue-400 font-medium"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
        )}
    >
        <Icon size={20} className={cn("transition-colors flex-shrink-0", active ? "text-blue-400" : "group-hover:text-white")} />
        {!isCollapsed && <span>{label}</span>}
        {active && !isCollapsed && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        )}
    </Link>
);

export function Sidebar({ isCollapsed, toggleCollapse }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const res = await axios.get(`/api/users/${userId}`);
                    setUser(res.data);
                } catch (err) {
                    console.error("Failed to fetch user data", err);
                }
            }
        };
        fetchUser();
    }, []);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col z-40 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Brand */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 h-[85px]">
                {!isCollapsed && (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate break-all">
                        CloudBook
                    </h1>
                )}
                {isCollapsed && (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold mx-auto flex-shrink-0 text-sm">
                        CB
                    </div>
                )}
                {!isCollapsed && (
                    <button
                        onClick={toggleCollapse}
                        className="text-gray-400 hover:text-white ml-2 p-1 rounded-md hover:bg-white/5 transition-colors hidden md:block flex-shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* Toggle Button for Collapsed State */}
            {isCollapsed && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={toggleCollapse}
                        className="text-gray-400 hover:text-white p-2 text-center rounded-md hover:bg-white/5 transition-colors"
                        title="Expand Sidebar"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                <NavItem icon={Home} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} isCollapsed={isCollapsed} />
                <NavItem icon={ShoppingBag} label="Marketplace" to="/marketplace" active={isActive('/marketplace')} isCollapsed={isCollapsed} />
                <NavItem icon={CreditCard} label="Subscription" to="/subscription" active={isActive('/subscription')} isCollapsed={isCollapsed} />
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-white/5 bg-black/10">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 p-2 rounded-lg transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'Loading...'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10 cursor-pointer"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0" title={user?.username || 'User'}>
                            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-400 transition-colors p-2 text-center rounded-md hover:bg-red-500/10 cursor-pointer"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
