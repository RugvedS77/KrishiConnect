import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Search, FileText, Banknote, User } from 'lucide-react';
import ProfilePic from '../assets/9.jpeg'; // Add a placeholder image

const Sidebar = () => {
  const navLinks = [
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', path: '/' },
    { icon: <Search size={20} />, name: 'Browse Listings', path: '/browse' },
    { icon: <FileText size={20} />, name: 'Ongoing Contracts', path: '/contracts' },
    { icon: <Banknote size={20} />, name: 'Payments', path: '/payments' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-700">AgriConnect</h1>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-green-100 text-green-800 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200">
        <Link to="/profile" className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all duration-200">
          <img src={ProfilePic} alt="Buyer Profile" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-sm text-gray-800">John Doe</p>
            <p className="text-xs text-gray-500">Wholesaler</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;