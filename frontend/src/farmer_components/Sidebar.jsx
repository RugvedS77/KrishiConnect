import { Link, useMatch, useResolvedPath } from "react-router-dom";

// Sidebar pages
const pages = [
  { name: "dashboard", icon: "fa-tachometer-alt" },
  { name: "create-listing", icon: "fa-plus-circle" },
  { name: "buyer-proposals", icon: "fa-inbox" },
  { name: "ongoing-contracts", icon: "fa-file-signature" },
  { name: "completed-contracts", icon: "fa-history" },
  { name: 'logistics', icon: "fa-truck" }
];

// ✅ Reusable link component that handles active highlighting
function CustomLink({ to, icon, children, end = false }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end });

  return (
    <Link
      to={to}
      className={`py-3 px-4 rounded flex items-center w-full text-left transition-all duration-200
        ${match ? "bg-green-600" : "hover:bg-gray-700 hover:translate-x-1"}`}
    >
      <i className={`fas ${icon} mr-3 w-5 text-center`} aria-hidden="true"></i>
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const formatName = (name) =>
    name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="w-64 bg-gray-900 text-white p-5 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo */}
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <i className="fas fa-seedling mr-2"></i> KrishiConnect
        </h1>

        {/* Nav links */}
        <nav className="space-y-2">
          {pages.map((page) => (
            <CustomLink
              key={page.name}
              to={page.name === "dashboard" ? "." : page.name} // "." means index route
              icon={page.icon}
              end={page.name === "dashboard"} // exact match for dashboard
            >
              {formatName(page.name)}
            </CustomLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="pt-4 border-t border-gray-700 space-y-2">
        <CustomLink to="profile" icon="fa-user-circle">
          Farmer Profile
        </CustomLink>
        <CustomLink to="support" icon="fa-question-circle">
          Support
        </CustomLink>
      </div>
    </div>
  );
}
