import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import { LayoutDashboard, Search, FileText, Banknote, User, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../authStore'; // Adjust path as needed

// CustomLink function (Unchanged)
function CustomLink({ to, icon, children, end = false }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end });

  const commonClasses = 'flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200';
  const activeClasses = 'bg-green-100 text-green-800 font-semibold';
  const inactiveClasses = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  return (
    <Link
      to={to}
      className={`${commonClasses} ${match ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  // Fetch user data for the profile section
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:8000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user for sidebar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);


  const navLinks = [
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', path: '.' },
    { icon: <Search size={20} />, name: 'Browse Listings', path: 'browse' },
    { icon: <FileText size={20} />, name: 'My Contracts', path: 'contracts' },
    { icon: <Banknote size={20} />, name: 'Payments', path: 'payments' },
  ];

  return (
    // The parent container will control the height, so this component just needs to fill it.
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-700">KrishiConnect</h1>
      </div>

      {/* The navigation links will now grow to push the profile section down */}
      <nav className="flex-grow py-6 px-4 space-y-2">
        {navLinks.map((link) => (
          <CustomLink
            key={link.name}
            to={link.path}
            icon={link.icon}
            end={link.path === '.'} 
          >
            {link.name}
          </CustomLink>
        ))}
      </nav>

      {/* This div is now reliably at the bottom */}
      <div className="p-4 border-t border-gray-200">
        <Link to="profile" className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all duration-200">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            {loading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <User size={20} className="text-green-700"/>}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">
                {loading ? 'Loading...' : (user?.full_name || 'Buyer Profile')}
            </p>
            <p className="text-xs text-gray-500">
                {user?.business_type || 'View Profile'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

