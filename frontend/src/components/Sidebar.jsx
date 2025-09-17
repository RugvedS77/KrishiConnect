import { Link, useLocation } from "react-router-dom";

// Sidebar pages
const pages = [
  { name: "dashboard", icon: "fa-tachometer-alt" },
  { name: "create-listing", icon: "fa-plus-circle" },
  { name: "buyer-proposals", icon: "fa-inbox" },
  { name: "ongoing-contracts", icon: "fa-file-signature" },
  { name: "completed-contracts", icon: "fa-history" },
  { name: "notifications", icon: "fa-bell" },
];

export default function Sidebar() {
  const location = useLocation();

  const formatName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isActive = (path) => {
    // Exact match
    if (location.pathname === `/${path}`) return true;

    // Special case: dashboard can be `/` or `/dashboard`
    if (path === "dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) {
      return true;
    }

    // Nested match: highlight parent when in child routes
    if (location.pathname.startsWith(`/${path}`)) {
      return true;
    }

    return false;
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-5 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo */}
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <i className="fas fa-seedling mr-2"></i> AgriContract
        </h1>

        {/* Nav links */}
        <nav className="space-y-2">
          {pages.map((page) => (
            <Link
              key={page.name}
              to={page.name === "dashboard" ? "/" : `/${page.name}`}
              className={`py-3 px-4 rounded flex items-center w-full text-left transition-all duration-200
                ${isActive(page.name)
                  ? "bg-blue-600"
                  : "hover:bg-gray-700 hover:translate-x-1"}`}
            >
              <i className={`fas ${page.icon} mr-3 w-5 text-center`} aria-hidden="true"></i>
              {formatName(page.name)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="pt-4 border-t border-gray-700 space-y-2">
        <Link
          to="/profile"
          className={`py-3 px-4 rounded flex items-center w-full text-left transition-all duration-200
            ${isActive("profile")
              ? "bg-blue-600"
              : "hover:bg-gray-700 hover:translate-x-1"}`}
        >
          <i className="fas fa-user-circle mr-3 w-5 text-center" aria-hidden="true"></i>
          Farmer Profile
        </Link>

        <Link
          to="/support"
          className={`py-3 px-4 rounded flex items-center w-full text-left transition-all duration-200
            ${isActive("support")
              ? "bg-blue-600"
              : "hover:bg-gray-700 hover:translate-x-1"}`}
        >
          <i className="fas fa-question-circle mr-3 w-5 text-center" aria-hidden="true"></i>
          Support
        </Link>
      </div>
    </div>
  );
}
