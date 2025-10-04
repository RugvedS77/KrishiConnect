import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
// Corrected the import path to go up two directories to the `src` folder

import { useAuthStore } from '../authStore.js';
import { 
    Leaf, 
    LayoutDashboard, 
    FlaskConical, 
    Bug, 
    Tractor,
    Users, 
    User,
    LogOut,
    CircleHelp
} from 'lucide-react';

/**
 * A reusable NavLink component that handles active state styling.
 */
const NavLink = ({ to, icon, children }) => (
    <RouterNavLink
        to={to}
        end
        className={({ isActive }) =>
            `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-100 text-blue-800 font-semibold' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
        }
    >
        {icon}
        <span className="ml-4 text-sm">{children}</span>
    </RouterNavLink>
);

/**
 * The sidebar component for the "Farm OS" (daily operations) mode.
 * It provides navigation to all the advisory and resource management tools.
 */
export default function FarmOSSidebar() {
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="h-screen w-72 bg-white border-r border-gray-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <Leaf className="h-8 w-8 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-800 ml-2">KrishiConnect</h1>
                </div>
                <p className="text-xs text-gray-500 ml-11 -mt-1">Farm OS</p>
            </div>

            {/* Main Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <h2 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Farm Operations</h2>
                <NavLink to="/farmer/os/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavLink>
                <NavLink to="/farmer/os/advisory" icon={<FlaskConical size={20} />}>Farm Advisory Center</NavLink>
                <NavLink to="/farmer/os/resources" icon={<Tractor size={20} />}>Resources Hub</NavLink>
                <NavLink to="/farmer/os/community-hub" icon={<Users size={20} />}>Community Hub</NavLink>
            </nav>

            {/* Footer Section with User Links */}
            <div className="p-4 border-t border-gray-200">
                <NavLink to="/farmer/os/profile" icon={<User size={20} />}>My Profile</NavLink>
                <NavLink to="/farmer/os/support" icon={<CircleHelp size={20} />}>Support</NavLink>
                 <button
                    onClick={logout}
                    className="flex items-center w-full p-3 my-1 rounded-lg text-red-500 hover:bg-red-50"
                >
                    <LogOut size={20} />
                    <span className="ml-4 text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
