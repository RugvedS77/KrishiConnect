import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Inbox, 
  FileSignature, 
  History, 
  Truck, 
  Sprout, 
  UserCircle, 
  HelpCircle,
  LogOut
} from 'lucide-react';

// Sidebar pages with modern icon components
const pages = [
  { name: "dashboard", icon: LayoutDashboard },
  { name: "create-listing", icon: PlusCircle },
  { name: "buyer-proposals", icon: Inbox },
  { name: "ongoing-contracts", icon: FileSignature },
  { name: "completed-contracts", icon: History },
  { name: 'logistics', icon: Truck }
];

// Reusable link component updated for icon components
function CustomLink({ to, Icon, children }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: to === '/farmer/marketplace/dashboard' });

  return (
    <Link
      to={to}
      className={`py-2.5 px-4 rounded-lg flex items-center w-full text-left transition-all duration-200 group
        ${match 
          ? "bg-green-600 text-white font-semibold" 
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </Link>
  );
}

export default function MarketPlaceSidebar() {
  const formatName = (name) =>
    name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-screen sticky top-0">
      {/* Top Section */}
      <div className="flex-grow">
        {/* Logo */}
        <div className="text-2xl font-bold mb-6 flex items-center px-2">
          <Sprout className="mr-2 text-green-400" />
          KrishiConnect
        </div>

        {/* Nav links */}
        <nav className="space-y-1.5">
          {pages.map((page) => (
            <CustomLink
              key={page.name}
              to={`/farmer/marketplace/${page.name}`} 
              Icon={page.icon}
            >
              {formatName(page.name)}
            </CustomLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-700 space-y-1.5">
        <CustomLink to="/farmer/marketplace/profile" Icon={UserCircle}>
          Farmer Profile
        </CustomLink>
      </div>
    </div>
  );
}