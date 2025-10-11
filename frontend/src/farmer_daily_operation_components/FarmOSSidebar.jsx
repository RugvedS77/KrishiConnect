import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useAuthStore } from '../authStore.js';
import { 
    Leaf, 
    LayoutDashboard, 
    FlaskConical, 
    Tractor,
    Users, 
    User,
    LogOut,
    CircleHelp
} from 'lucide-react';

/**
 * A reusable NavLink component styled for a dark theme.
 */
const NavLink = ({ to, icon, children }) => (
    <RouterNavLink
        to={to}
        end
        className={({ isActive }) =>
            `flex items-center p-3 my-1 rounded-lg transition-all duration-200 ${
                isActive 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`
        }
    >
        {icon}
        <span className="ml-4 text-sm">{children}</span>
    </RouterNavLink>
);

/**
 * The sidebar component with a dark blue theme.
 */
export default function FarmOSSidebar() {
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="h-screen w-72 bg-gradient-to-b from-slate-900 to-blue-950 border-r border-slate-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center">
                    <Leaf className="h-8 w-8 text-sky-400" />
                    <h1 className="text-xl font-bold text-gray-100 ml-2">KrishiConnect</h1>
                </div>
                <p className="text-xs text-gray-400 ml-11 -mt-1">Farm OS</p>
            </div>

            {/* Main Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <h2 className="px-3 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">Farm Operations</h2>
                <NavLink to="/farmer/os/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavLink>
                <NavLink to="/farmer/os/advisory" icon={<FlaskConical size={20} />}>Farm Advisory Center</NavLink>
                <NavLink to="/farmer/os/resources" icon={<Tractor size={20} />}>Resources Hub</NavLink>
                <NavLink to="/farmer/os/community-hub" icon={<Users size={20} />}>Community Hub</NavLink>
            </nav>

            {/* Footer Section with User Links */}
            <div className="p-4 border-t border-slate-700">
                <NavLink to="/farmer/os/profile" icon={<User size={20} />}>My Profile</NavLink>
            </div>
        </div>
    );
}