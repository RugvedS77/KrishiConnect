import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import { LayoutDashboard, Search, FileText, Banknote } from 'lucide-react';
import ProfilePic from '../assets/9.jpeg';

// ... CustomLink function (no changes needed) ...
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
  const navLinks = [
    // ✅ CHANGED: Use relative paths
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', path: '.' }, // '.' means the index of the parent route
    { icon: <Search size={20} />, name: 'Browse Listings', path: 'browse' },
    { icon: <FileText size={20} />, name: 'Ongoing Contracts', path: 'contracts' },
    { icon: <Banknote size={20} />, name: 'Payments', path: 'payments' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-700">KrishiConnect</h1>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navLinks.map((link) => (
          <CustomLink
            key={link.name}
            to={link.path}
            icon={link.icon}
            // ✅ ADDED: 'end' prop for correct dashboard highlighting
            end={link.path === '.'} 
          >
            {link.name}
          </CustomLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200">
        {/* ✅ CHANGED: Use a relative path for the profile link */}
        <Link to="profile" className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all duration-200">
          <img src={ProfilePic} alt="Buyer Profile" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-sm text-gray-800">Mayuresh Marade</p>
            <p className="text-xs text-gray-500">Wholesaler</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;